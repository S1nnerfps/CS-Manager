# 战队信息与赛程文件约定（2026-10-07）

编辑器只编辑赛程、阶段、比赛、赛果与接线。战队信息由独立 `.tinf` 文件提供，编辑器只读解析；不会根据队名查询或填入当前年份的战队数据。

## 字段来源

已实际查阅 CSEMTV 的 `E:/CSEMTV/src/TeamData.h`、`TeamData.cpp`、`TeamDatabase.cpp` 与 `TournamentManager.cpp` 荣誉写入处。TeamData 的存储字段为 `id/name/region/vrs/stamina/wins/losses/prize_total/honors`，`historical_honors` 是 honors 的兼容别名。TeamDatabase 还保存 `current_date`。当前模型没有选手名单、Logo 或其他独立战队属性；本协议按现有模型设计，不冒充新增游戏字段。

## 二进制封装

| 文件 | 开头识别码（ASCII，无 BOM，末尾一个 LF） | 后续内容 |
| --- | --- | --- |
| `.tinf` v1 | `CSEM-TEAM-INFO/1\n`，17 字节 | gzip 压缩的紧凑 UTF-8 JSON |
| `.csem` v3 | `CSEM-GRAPH-LINKER/3\n`，20 字节 | gzip 压缩的紧凑 UTF-8 JSON |
| 旧 `.csem` v1/v2 模型 | `CSEM-GRAPH-LINKER/2\n` | 保留读取赛程结构；内置战队资料不覆盖导入的 `.tinf` |

压缩混淆不是加密。压缩文件（含识别码）最多 2,001,024 字节，解压内容最多 2,000,000 字节。先识别用途和版本，再按限量流解压、严格 UTF-8、JSON、识别码/内容版本一致性和模型字段校验。错误、损坏、超限和功能用途不匹配均拒绝，保留当前赛程、战队库与演算进度。识别依据为文件开头字节，不依赖后缀。

## `.tinf` 模型

根字段：`schema:"csem.team-info"`、`version:1`、`name`（文件显示名称）、`current_date`（`YYYY-MM-DD` 或 null）、`teams`（最多 1000 条）。

| 战队字段 | 约定 |
| --- | --- |
| id | 非空字母、数字、下划线、连字符；文件内唯一，与赛程 ID 引用完全一致 |
| name | 非空名称，最多 200 字符；只读展示 |
| region | 赛区字符串或 null；主工程当前使用 EU/AM/AS |
| vrs | 非负 int32 或 null；这是积分，不自动当作实时排名 |
| stamina | 0～100 整数或 null |
| wins / losses | 非负 int32 或 null |
| prize_total | 非负 int64 的十进制**字符串**或 null，避免 JavaScript 数字损失精度 |
| honors | 荣誉对象数组或 null；兼容 historical_honors 别名 |
| seedRank | 正安全整数，保留原种子排序输入；不在编辑器修改 |
| liveRank | 非负安全整数，保留实时排名接口；旧存档值为 0，不由 VRS 自动推算 |

未知与已知零值区分：旧存档没有的赛区、VRS、体力、战绩、奖金、荣誉及快照日期用 null；不能把默认 1000/100/0 当成 Copenhagen 2024 的历史资料。荣誉对象保留主工程已有的 `tour_id/name/date/prize/tier/format/placement/vrs_before/vrs_after/delta_vrs` 等内容；此处不生成历史荣誉。

示例战队记录：

```json
{"id":"team_muxecwbl_vbps","name":"FaZe","region":null,"vrs":null,"stamina":null,"wins":null,"losses":null,"prize_total":null,"honors":null,"seedRank":1,"liveRank":0}
```

## `.csem` v3 与 ID 绑定

赛程根字段沿用 v2 的 schema/name/appearance/stages/matches/results/groups/links，version 改为 3。`seeds` 仅保存有序的 `[{"id":"战队ID"}]`，不包含队名、种子排名、实时排名或任何战队属性。可选 `teamInfoFile` 只提示建议 `.tinf` 文件名，不自动读取路径，也不要求两个文件同名。

`.tinf` 和 `.csem` 可按任意顺序导入。缺失 ID 显示“待导入”并产生 TEAM_MISSING，禁止演算，但允许编辑、保存赛程。按 ID 匹配，不按队名猜测。部分战队库可以导入，其余缺失逐项报错；额外战队不改变已有赛程。空赛程导入 `.tinf` 时创建该文件全部战队的种子引用；“加入文件中的其余战队”只增加参赛 ID 引用，不创建或修改战队资料。

战队属性、名称、排名均只读；删除键不会删除战队数据。导入成功重置演算，可通过编辑撤销恢复上一个战队库、绑定和运行快照。新建空白赛程保留已导入战队库。默认八队示例只提供赛程，需导入 sample.tinf 才能演算。

运行时仍使用 engine.js 的 v2 已绑定内存模型，由 team_info.js 把外部 ID 引用解析为只读名称与排序值。导出一律通过 toSchedule 去掉战队数据，输出 v3；codec.encode 原始 v2 仅用于旧格式兼容测试，界面不会用它导出。浏览器新草稿与战队缓存分别使用 `csem.graph-linker.draft.v3` 和 `csem.graph-linker.teams.v1`。旧 `draft.v1` 只读迁移，旧战队拆入只读缓存；读取不覆盖旧草稿，新编辑保存到新键。

## Copenhagen 拆分结果

本次源文件为用户当前的 6,933 字节压缩存档（SHA256 `8fef25c3b53710413334c762a6c7e61bb741101801a62ac5489f86bf850ae244`），并非上一轮裸 JSON 文件。源赛制校验通过，含 24 战队、3 阶段、73 比赛、40 赛果、34 大框、226 通道。生成 `Cphg2024.tinf`（630 字节）与 `Cphg2024.csem`（6,660 字节），Downloads 内原文件保留。

战队 ID、名称、种子排名、实时排名完整进入 `.tinf`；未知主工程属性写 null。所有阶段、比赛、赛果、排名、分组、坐标与通道保持原值，赛程仅多建议文件名并剥离战队字段。实际封装往返和拆分前后 73 次 FIFO/历史逐步比较通过；浏览器两个导入顺序、两种用途错误、只读检查器及三阶段 73 场完赛均实测。C++/Godot 的新文件读取与战队数据接入未实现、未验证。

## C++ 接入约定

文件分发器先按识别码路由 TournamentFormatReader / TeamInfoReader，调用功能与用途不符立即报错。`.tinf` 解析成独立 TeamDatabase 快照；int64 奖金从字符串显式转换并检查边界。null 是未知资料，需游戏导入策略明确处理，不能静默变成真实历史数据。比赛图只保存 Team ID，构建运行态时通过数据库解析 TeamRef；缺失 ID 不允许开始赛事。兼容 honors/historical_honors，保留原 ID，不能用队名与 2026 默认库强行合并。先迁移文件校验和绑定，再运行匹配、缺 ID、错用途、压缩损坏及完整跨阶段回归。
