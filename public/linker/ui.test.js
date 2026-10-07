'use strict';
// Exercise the actual UI listeners in a minimal DOM. Browser checks cover rendering
// and native interaction; this harness covers keys intercepted by browser tooling.
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
const E = require('./engine.js'), G = require('./editor.js'), C = require('./codec.js'), F = require('./team_info.js');
let assertions = 0;
const equal = (a,b,m) => { assert.deepEqual(a,b,m); assertions++; };
const check = (v,m) => { assert.ok(v,m); assertions++; };
class Element {
  constructor(id) { this.id=id; this.handlers={}; this.style={setProperty(){}}; this.dataset={}; this.innerHTML=''; this.textContent=''; this.value=''; this.hidden=false; this.clientWidth=700; this.scrollLeft=0; this.scrollTop=0; this.classes=new Set(); this.classList={add:(x)=>this.classes.add(x),remove:(x)=>this.classes.delete(x),toggle:(x,on)=>on?this.classes.add(x):this.classes.delete(x),contains:x=>this.classes.has(x)}; }
  addEventListener(name,fn) { (this.handlers[name]??=[]).push(fn); }
  querySelectorAll() { return []; }
  insertAdjacentHTML(_,text) { this.innerHTML+=text; }
  getBoundingClientRect() { return {left:0,top:0,right:1390,bottom:850,width:1390,height:850}; }
  setPointerCapture() {}
  scrollTo(x,y) { this.scrollLeft=x;this.scrollTop=y; }
  closest() { return null; }
}
const elements=new Map(), get=id=>{ if(!elements.has(id))elements.set(id,new Element(id)); return elements.get(id); };
const document=new Element('document'); document.getElementById=get; document.documentElement=new Element('root'); document.createElement=()=>new Element('created');
const context={GraphEngine:E,GraphEditor:G,GraphTeamInfo:F,CsemCodec:C,document,window:{},location:{search:'?verify=1'},URLSearchParams,URL,Blob,Date,Math,innerWidth:1280,innerHeight:720,setTimeout:()=>1,clearTimeout(){}};
// Any attempted access to the user's system clipboard fails this test immediately.
Object.defineProperty(context,'navigator',{get(){throw new Error('UI accessed system clipboard');}});
vm.runInNewContext(fs.readFileSync(`${__dirname}/graph_linker.js`,'utf8'),context,{filename:'graph_linker.js'});
const snap=()=>context.window.GraphLinkerDebug.snapshot();
const fire=(element,name,event)=>{for(const fn of element.handlers[name]||[])fn(event);};
function key(name,{ctrl=false,text=false}={}) { const event={key:name,ctrlKey:ctrl,metaKey:false,altKey:false,shiftKey:false,repeat:false,target:{closest:()=>text?{}:null},preventDefault(){this.prevented=true;}};fire(document,'keydown',event);return event; }
const pointer=(x,y,button=0)=>({clientX:x,clientY:y,button,pointerId:1,target:new Element('background'),preventDefault(){}});
(async () => {
const initialTeams=await C.encode(F.fromLegacy(E.sample()),'teams');
await get('teamFileInput').onchange({target:{files:[{size:initialTeams.length,arrayBuffer:async()=>initialTeams.buffer}],value:'chosen'}});
get('addMatchBtn').onclick(); const newMatch=snap().doc.matches.at(-1), before=snap().doc.matches.length;
equal({x:newMatch.x,y:newMatch.y},{x:423,y:23.5},'UI creates at current viewport top-right');
context.window.getSelection=()=>({toString:()=> 'selected inspector text'});check(!key('c',{ctrl:true}).prevented,'selected plain text retains native copy even while an object is selected');context.window.getSelection=undefined;
check(key('c',{ctrl:true}).prevented,'Ctrl+C is intercepted for object selection');
key('v',{ctrl:true});equal(snap().doc.matches.length,before,'Ctrl+V outside canvas never pastes');
fire(get('canvasScroll'),'pointerenter',{});fire(get('canvas'),'pointermove',pointer(1000,500));
check(!key('v',{ctrl:true,text:true}).prevented);equal(snap().doc.matches.length,before,'typing preserves native clipboard behavior');
check(key('v',{ctrl:true}).prevented);equal(snap().doc.matches.length,before+1,'actual Ctrl+V listener pastes internal cache');
const pasted=snap().doc.matches.at(-1);check(Math.abs(pasted.x+235/2-1000)<=G.GRID/2&&Math.abs(pasted.y+141/2-500)<=G.GRID/2,'UI keyboard paste uses hovered rectangle center');
check(!key('Backspace',{text:true}).prevented);equal(snap().doc.matches.length,before+1,'text Backspace cannot delete a node');
check(key('x',{ctrl:true}).prevented);equal(snap().doc.matches.length,before,'actual Ctrl+X listener cuts selection');
check(key('z',{ctrl:true}).prevented);equal(snap().doc.matches.length,before+1);check(key('y',{ctrl:true}).prevented);equal(snap().doc.matches.length,before);
key('v',{ctrl:true});equal(snap().doc.matches.length,before+1,'cut leaves reusable internal cache');
check(key('Delete').prevented);equal(snap().doc.matches.length,before);key('z',{ctrl:true});equal(snap().doc.matches.length,before+1);
// Provide DOM rectangles for the real pointer handlers, including seed edges.
get('sampleBtn').onclick();
get('canvas').querySelectorAll=()=>{
  const doc=snap().doc, output=[];
  for(const [kind,nodes] of [['group',doc.groups],['match',doc.matches],['result',doc.results]])for(const n of nodes.filter(n=>n.stage==='s1')){
    const el=new Element(n.id);el.dataset={kind,id:n.id};el.getBoundingClientRect=()=>({left:n.x,top:n.y,right:n.x+235,bottom:n.y+(kind==='group'?G.groupHeight(n):kind==='match'?141:58.75)});output.push(el);
  }
  for(const l of doc.links.filter(l=>E.stageOf(doc,l.target)==='s1'||E.stageOf(doc,l.source)==='s1')){
    const el=new Element(l.id);el.dataset={link:l.id};el.getBoundingClientRect=()=>({left:10,top:10,right:20,bottom:20});output.push(el);
  }
  return output;
};
fire(get('canvas'),'pointerdown',pointer(0,0,2));fire(get('canvas'),'pointermove',pointer(1380,800,2));fire(get('canvas'),'pointerup',pointer(1380,800,2));
check(get('contextMenu').hidden===false,'right-button rectangle opens batch menu');check(get('contextMenu').innerHTML.includes('全部删除'));
key('Delete');const cleared=snap().doc;
equal(cleared.matches.filter(m=>m.stage==='s1').length,0);equal(cleared.results.filter(r=>r.stage==='s1').length,0);equal(cleared.groups.length,0);
equal(cleared.stages.length,2,'right rectangle never selects or deletes start layers');equal(cleared.links.filter(l=>l.source.startsWith('seed:')).length,8,'right rectangle excludes seed-to-start channels');
key('z',{ctrl:true});
const clickNode=new Element('q1');clickNode.dataset={kind:'match',id:'q1'};
const handle=new Element('title');handle.closest=selector=>selector==='.node'?clickNode:null;
const clickEvent=pointer(430,50);clickEvent.target={closest:selector=>selector==='.drag-handle,.result'?handle:selector==='.node,[data-link],.port'?clickNode:null};
fire(get('canvas'),'pointerdown',clickEvent);fire(get('canvas'),'pointerup',clickEvent);
check(get('inspector').innerHTML.includes('MATCH')&&!get('inspector').innerHTML.includes('批量操作'),'a click on an already selected object opens its properties; dragging preserves the batch');
get('stepBtn').onclick();equal(snap().state.history.length,1);
get('addLabelGroupBtn').onclick();equal(snap().state.history.length,1,'creating a visual-only label frame preserves completed matches and FIFO');equal(snap().issues,[],'an empty label frame never blocks simulation');
const selectNode=(id,multiple=false)=>fire(document,'click',{target:{closest:selector=>selector==='.node'?{dataset:{kind:'match',id}}:null},shiftKey:multiple});
selectNode('q2');selectNode('q3',true);
fire(document,'click',{target:{closest:selector=>selector==='[data-operation]'?{dataset:{operation:'label'}}:null}});
equal(snap().state.history.length,1,'merging into a label-only frame preserves simulation');
for(let i=0;i<7;i++)get('stepBtn').onclick();get('resetBtn').onclick();equal(snap().state.history.length,0);equal(get('stageHeading').textContent,'资格赛','reset after crossing stages synchronizes the canvas with the initial FIFO head');
  const external=E.sample();external.seeds.forEach(t=>t.id=`external_${t.id}`);external.links.forEach(l=>{if(l.source.startsWith('seed:'))l.source=`seed:external_${l.source.slice(5)}`;});
  const info=F.fromLegacy(external), schedule=F.toSchedule(external), sb=await C.encode(schedule),tb=await C.encode(info,'teams');
  const importBytes=async(id,bytes,name='misleading.extension')=>get(id).onchange({target:{files:[{name,size:bytes.length,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)}],value:'chosen'}});
  await importBytes('fileInput',sb);equal(snap().doc.seeds.filter(t=>t._teamMissing).length,8);check(get('stepBtn').disabled,'missing .tinf disables step');
  get('stepBtn').onclick();equal(snap().state.history.length,0,'direct listener also refuses unresolved teams');
  await importBytes('teamFileInput',tb,'renamed.csem');equal(snap().issues,[]);equal(snap().doc.seeds,external.seeds,'matching IDs hydrate all names');
  get('stepBtn').onclick();equal(snap().state.history.length,1);
  let preserved=snap();await importBytes('fileInput',tb);equal(snap(),preserved,'wrong-purpose team file preserves graph, database and runtime');check(get('toast').textContent.includes('用途不匹配'));
  await importBytes('teamFileInput',sb);equal(snap(),preserved,'wrong-purpose schedule file preserves graph, database and runtime');check(get('toast').textContent.includes('用途不匹配'));
  await importBytes('teamFileInput',tb.subarray(0,tb.length-8));equal(snap(),preserved,'broken gzip leaves imported data intact');
  const invalid=E.copy(info);invalid.teams[0].seedRank=0;await importBytes('teamFileInput',await C.encode(invalid,'teams'));equal(snap(),preserved,'invalid team fields are rejected atomically');
  fire(document,'click',{target:{closest:selector=>selector==='[data-seed]'?{dataset:{seed:external.seeds[0].id}}:null},shiftKey:false});
  check(get('inspector').innerHTML.includes('只读')&&!get('inspector').innerHTML.includes('data-prop='),'team inspector has no editable properties');
  fire(get('inspector'),'change',{target:{dataset:{prop:'name'},value:'corruption'}});equal(snap().doc.seeds[0].name,external.seeds[0].name,'team property changes are ignored');
  key('Delete');equal(snap(),preserved,'Delete cannot delete imported team records');
  const renamed=E.copy(info);renamed.teams[0].name='Changed database name';await importBytes('teamFileInput',await C.encode(renamed,'teams'));equal(snap().doc.seeds[0].name,'Changed database name');equal(snap().state.history.length,0);
  key('z',{ctrl:true});equal(snap(),preserved,'undo database import restores both team binding and completed runtime');key('y',{ctrl:true});equal(snap().teamInfo,renamed);
  await importBytes('fileInput',sb);equal(snap().issues,[],'teams-first import resolves schedule');
  get('emptyBtn').onclick();await importBytes('teamFileInput',tb);equal(snap().doc.seeds.length,8,'team import supplies seed references to empty schedules');
  const saved=new Map([['csem.graph-linker.draft.v1',JSON.stringify(external)]]),writes=[];
  const savedDOM=new Map(),savedGet=id=>{if(!savedDOM.has(id))savedDOM.set(id,new Element(id));return savedDOM.get(id);};
  const savedDocument=new Element('document');savedDocument.getElementById=savedGet;savedDocument.documentElement=new Element('root');savedDocument.createElement=()=>new Element('created');
  const storedContext={...context,document:savedDocument,window:{},location:{search:''},localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>{writes.push(k);saved.set(k,v);}}};
  vm.runInNewContext(fs.readFileSync(`${__dirname}/graph_linker.js`,'utf8'),storedContext);
  equal(writes,[],'reading legacy draft does not overwrite any storage');
  savedGet('addMatchBtn').onclick();const raw=JSON.parse(saved.get('csem.graph-linker.draft.v3'));
  equal(raw.seeds,external.seeds.map(t=>({id:t.id})),'saved schedule contains only references');equal(JSON.parse(saved.get('csem.graph-linker.teams.v1')).teams.map(t=>t.name),external.seeds.map(t=>t.name));
  equal(saved.get('csem.graph-linker.draft.v1'),JSON.stringify(external),'old draft remains available unchanged');
  storedContext.window={};vm.runInNewContext(fs.readFileSync(`${__dirname}/graph_linker.js`,'utf8'),storedContext);
  equal(storedContext.window.GraphLinkerDebug.snapshot().doc.seeds,external.seeds,'split browser storage survives refresh');
  console.log(`Graph UI events: ${assertions} assertions passed.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
