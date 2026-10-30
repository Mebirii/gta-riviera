'use strict';
const assert=require('node:assert/strict');
const {server,rooms}=require('./server');
const {sanitizeProfile}=require('./profile');
const storage=require('./storage');
const {setTimeout:delay}=require('node:timers/promises');
const E=require('./engine');
async function until(messages,predicate){for(let i=0;i<150;i++){const m=messages.find(predicate);if(m)return m;await delay(12);}throw Error('timeout '+JSON.stringify(messages).slice(-1000));}
const profile={name:'Nina Riviera',bio:'Pilote devenue informatrice',portrait:'juliette',color:'#ff82a1',skills:{parole:1,discretion:1,technique:1,instinct:4}};
assert.throws(()=>sanitizeProfile({...profile,skills:{...profile.skills,instinct:5}}),/caractéristiques/);
assert.throws(()=>sanitizeProfile({...profile,skills:{...profile.skills,instinct:3}}),/7 points/);
const clean=sanitizeProfile(profile);assert.equal(clean.name,profile.name);
async function main(){await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;let sockets=[];
function conn(){const ws=new WebSocket('ws://127.0.0.1:'+port);const messages=[];ws.onmessage=e=>messages.push(JSON.parse(e.data));sockets.push(ws);return {ws,messages};}
try{const a=conn();await new Promise(r=>a.ws.addEventListener('open',r,{once:true}));a.ws.send(JSON.stringify({type:'create',name:'Nina',character:'custom',profile}));const snap=await until(a.messages,x=>x.type==='snapshot'&&x.data.players.length===1);const code=snap.data.room,recovery=snap.data.recoveryKey;assert.ok(recovery&&recovery.length===24);assert.equal(snap.data.players[0].profile.skills.instinct,4);const pack=storage.pack(rooms.get(code));const unpack=storage.unpack(pack);assert.equal(unpack.players[0].ws,null);assert.equal(unpack.recoveryKey,recovery);assert.equal(unpack.players[0].profile.name,'Nina Riviera');
const b=conn();await new Promise(r=>b.ws.addEventListener('open',r,{once:true}));b.ws.send(JSON.stringify({type:'join',room:code,character:'gauthier',name:'Gauthier'}));const bSnap=await until(b.messages,x=>x.type==='snapshot'&&x.data.players.length===2);assert.equal(bSnap.data.recoveryKey,null);
a.ws.send(JSON.stringify({type:'start'}));const started=await until(a.messages,x=>x.type==='snapshot'&&x.data.game?.scene==='intro');assert.equal(started.data.game.crew[0].name,'Nina Riviera');const intro=E.getScene(rooms.get(code).game);const first=intro.choices[0];assert.ok(first);
a.ws.send(JSON.stringify({type:'vote',choice:first.id}));b.ws.send(JSON.stringify({type:'vote',choice:first.id}));await until(a.messages,x=>x.type==='snapshot'&&x.data.votedCount===2);a.ws.send(JSON.stringify({type:'resolve'}));const after=await until(a.messages,x=>x.type==='snapshot'&&x.data.game?.round===1);assert.ok(after.data.game.last.actor.length);
// Reconnexion avec la clé privée, sans effacer les décisions de campagne.
a.ws.close();await delay(50);const c=conn();await new Promise(r=>c.ws.addEventListener('open',r,{once:true}));c.ws.send(JSON.stringify({type:'recover',room:code,recoveryKey:recovery}));const recovered=await until(c.messages,x=>x.type==='snapshot'&&x.data.game?.round===1);assert.equal(recovered.data.players[0].profile.name,'Nina Riviera');
c.ws.send(JSON.stringify({type:'backup'}));const backup=await until(c.messages,x=>x.type==='backup');assert.equal(backup.data.game.round,1);assert.equal(backup.data.version,3);assert.equal(backup.data.team.length,2);assert.ok(!JSON.stringify(backup.data).includes(recovery));
const d=conn();await new Promise(r=>d.ws.addEventListener('open',r,{once:true}));d.ws.send(JSON.stringify({type:'create',character:'yanis',name:'Yanis'}));const dCreated=await until(d.messages,x=>x.type==='snapshot');const newRoom=dCreated.data.room;d.ws.send(JSON.stringify({type:'import',backup:backup.data}));await until(d.messages,x=>x.type==='snapshot'&&x.data.imported===true);
const e=conn();await new Promise(r=>e.ws.addEventListener('open',r,{once:true}));e.ws.send(JSON.stringify({type:'join',room:newRoom,character:'mathieu',name:'Mathieu'}));await until(d.messages,x=>x.type==='snapshot'&&x.data.players.length===2);d.ws.send(JSON.stringify({type:'start'}));const restored=await until(d.messages,x=>x.type==='snapshot'&&x.data.game?.round===1);assert.equal(restored.data.game.stats.money,after.data.game.stats.money);
console.log('V3 OK : validation des profils, personnages personnalisés et talents, recovery key et état de campagne.');
}finally{sockets.forEach(c=>c.close());await new Promise(r=>server.close(r));}}
main().catch(e=>{console.error(e);process.exitCode=1;server.close();});
