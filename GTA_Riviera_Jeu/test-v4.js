'use strict';
const assert=require('node:assert/strict'),E=require('./engine');
const {sanitizeProfile}=require('./profile');
const {server,rooms}=require('./server');
const {setTimeout:delay}=require('node:timers/promises');
async function until(msgs,pred){for(let i=0;i<140;i++){const x=msgs.find(pred);if(x)return x;await delay(20);}throw Error('WS timeout '+JSON.stringify(msgs.slice(-3)));}
const p={name:'Alessia Costa',bio:'Mécanicienne du port',goal:'Aider sa famille',flaw:'Trop fière',portrait:'juliette',color:'#ff82a1',skills:{physique:0,ruse:2,technique:1,bagout:1,pilotage:0},specialty:'ruse'};
const custom=sanitizeProfile(p);assert.equal(custom.specialty,'ruse');assert.equal(Object.keys(custom.skills).length,5);
assert.throws(()=>sanitizeProfile({...p,skills:{...p.skills,ruse:3}}));
assert.throws(()=>sanitizeProfile({...p,skills:{...p.skills,pilotage:1}}));
assert.equal(E.createGame().scene,'belle_open');
assert.equal(E.createGame().flags.memory,false);
assert.equal(E.createGame().flags.watch,false);
assert.equal(E.createGame().flags.half,false);
for(let i=0;i<500;i++){
 let g=E.createGame(),steps=0;g.crew=[custom];
 while(!g.ended&&steps++<30){const scene=E.getScene(g);const choices=scene.choices.filter(x=>x.condition!==false);assert(choices.length,'no choice on '+g.scene);const c=choices[Math.floor(Math.random()*choices.length)];g=E.choose(g,c.id,custom.id);}
 assert(g.ended,'not finished '+g.scene);assert(g.completed.belladone);assert(g.history[0].scene==='belle_open');
 assert(g.round>4);assert(E.getScene(g).isEnding);assert(!g.journal[0].text.includes('a mémorisé chaque ligne'));
 const next=E.continueCampaign(g),hub=E.getScene(next);assert(hub.choices.some(x=>x.mission==='neree'));
}
let critical=E.createGame();critical=E.choose(critical,'belle_scout','gauthier',12);assert(critical.last.success&&critical.last.roll===12);
let fail=E.createGame();fail=E.choose(fail,'belle_scout','gauthier',2);assert(fail.last.success===false);
assert.equal(E.dcFor({jdr:true,dc:9},'normal'),9);
assert.equal(E.dcFor({jdr:true,dc:9},'facile'),7);
console.log('Scenario 1 : 500 parcours ; 2D6 ; absence de spoilers ; fiches originales OK');
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const port=server.address().port,clients=[];
 function connect(){const ws=new WebSocket(`ws://127.0.0.1:${port}`);let messages=[];ws.onmessage=e=>messages.push(JSON.parse(e.data));clients.push(ws);return{ws,messages};}
 try{
  const a=connect();await new Promise(r=>a.ws.addEventListener('open',r,{once:true}));a.ws.send(JSON.stringify({type:'create',character:'custom',name:p.name,profile:p}));
  const first=await until(a.messages,x=>x.type==='snapshot'&&x.data.players.length===1);const code=first.data.room;
  assert.equal(first.data.players[0].profile.specialty,'ruse');
  const b=connect();await new Promise(r=>b.ws.addEventListener('open',r,{once:true}));b.ws.send(JSON.stringify({type:'join',room:code,character:'yanis',name:'Yanis'}));
  await until(a.messages,x=>x.type==='snapshot'&&x.data.players.length===2);
  a.ws.send(JSON.stringify({type:'start'}));const started=await until(a.messages,x=>x.type==='snapshot'&&x.data.game?.scene==='belle_open');
  assert.equal(started.data.game.flags.memory,false);
  a.ws.send(JSON.stringify({type:'vote',choice:'belle_go'}));b.ws.send(JSON.stringify({type:'vote',choice:'belle_go'}));
  await until(a.messages,x=>x.type==='snapshot'&&x.data.votedCount===2);
  a.ws.send(JSON.stringify({type:'resolve'}));await until(a.messages,x=>x.type==='snapshot'&&x.data.game?.scene==='belle_brief');
  assert.equal(rooms.get(code).game.crew[0].name,'Alessia Costa');
  console.log('Multijoueur / personnage personnalisé / vote 2 joueurs OK');
 }finally{clients.forEach(x=>x.close());await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
