(function (root) {
  'use strict';
  const MAGIC = 'CSEM-GRAPH-LINKER/2\n', LIMIT = 2_000_000;
  const FORMATS = [
    { magic: MAGIC, kind: 'schedule', version: 2, schema: 'csem.graph-linker' },
    { magic: 'CSEM-GRAPH-LINKER/3\n', kind: 'schedule', version: 3, schema: 'csem.graph-linker' },
    { magic: 'CSEM-TEAM-INFO/1\n', kind: 'teams', version: 1, schema: 'csem.team-info' }
  ];
  const title = kind => kind === 'teams' ? '战队信息 .tinf' : '赛程 .csem';
  function identify(bytes, expected) {
    const input = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const format = FORMATS.find(f => { const h = new TextEncoder().encode(f.magic); return input.length >= h.length && h.every((v,i) => input[i] === v); });
    if (!format) {
      const prefix = new TextDecoder().decode(input.subarray(0, 64));
      if (/^CSEM-(GRAPH-LINKER|TEAM-INFO)\//.test(prefix)) throw new Error('文件识别码版本不支持。');
      throw new Error('文件识别码错误：需要 CSEM 赛程或战队信息文件。');
    }
    if (expected && format.kind !== expected) throw new Error(`文件用途不匹配：识别为${title(format.kind)}，此功能需要${title(expected)}。`);
    return format;
  }
  async function collect(stream, limit) {
    const reader = stream.getReader(), parts = []; let size = 0;
    try { while (true) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > limit) throw new Error('文件解压后超过 2 MB 原型限制。'); parts.push(value); } }
    finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
    const output = new Uint8Array(size); let offset = 0;
    for (const part of parts) { output.set(part, offset); offset += part.byteLength; }
    return output;
  }
  function checkPayload(doc, format) {
    if (doc?.schema !== format.schema || !(doc.version === format.version || format.kind === 'schedule' && format.version === 2 && doc.version === 1)) throw new Error('文件识别码与内容类型或版本不一致。');
  }
  async function encode(doc, kind = 'schedule') {
    const plain = new TextEncoder().encode(JSON.stringify(doc));
    if (plain.length > LIMIT) throw new Error('文件超过 2 MB 原型限制。');
    const format = FORMATS.find(f => f.kind === kind && (f.version === doc?.version || kind === 'schedule' && doc?.version === 1 && f.version === 2));
    if (!format) throw new Error('文件类型或版本不支持。');
    checkPayload(doc, format);
    const header = new TextEncoder().encode(format.magic);
    const zipped = await collect(new Blob([plain]).stream().pipeThrough(new CompressionStream('gzip')), LIMIT + 1024);
    const output = new Uint8Array(header.length + zipped.length); output.set(header); output.set(zipped, header.length); return output;
  }
  async function decodeFile(bytes, expected) {
    const input = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes), format = identify(input, expected);
    if (input.length > LIMIT + 1024) throw new Error('压缩文件超过原型限制。');
    let text;
    try {
      const plain = await collect(new Blob([input.subarray(new TextEncoder().encode(format.magic).length)]).stream().pipeThrough(new DecompressionStream('gzip')), LIMIT);
      text = new TextDecoder('utf-8', { fatal: true }).decode(plain);
    } catch (error) { if (error.message.includes('2 MB')) throw error; throw new Error('压缩数据损坏或内容编码错误。'); }
    let doc; try { doc = JSON.parse(text); } catch (_) { throw new Error('文件内容不是有效 JSON。'); }
    checkPayload(doc, format);
    return { kind: format.kind, version: format.version, text };
  }
  async function decode(bytes, expected = 'schedule') { return (await decodeFile(bytes, expected)).text; }
  const api = { MAGIC, SCHEDULE_MAGIC: FORMATS[1].magic, TEAM_MAGIC: FORMATS[2].magic, LIMIT, MAX_COMPRESSED: LIMIT + 1024, identify, encode, decode, decodeFile };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.CsemCodec = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
