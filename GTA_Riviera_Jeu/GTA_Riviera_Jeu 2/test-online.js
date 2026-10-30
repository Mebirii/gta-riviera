'use strict';
const assert=require('node:assert/strict');const {server}=require('./server');
const {setTimeout:delay}=require('node:timers/promises');
async function test(){await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=server.address().port;let clients=[];
function client(){const ws=new WebSocket(`ws://127.0.0.1:${port}`);const messages=[];ws.addEventListener('message',e=>messages.push(JSON.parse(e.data)));clients.push(ws);return{ws,messages};}
async function until(c,condition){for(let i=0;i<100;i++){const ret=c.messages.find(condition);if(ret)return ret;await delay(20);}throw Error('Timeout, received: '+JSON.stringify(c.messages));}
try{const a=client();await new Promise(r=>a.ws.addEventListener('open',r,{once:true}));a.ws.send(JSON.stringify({type:'create',name:'Gauthier',character:'gauthier'}));const created=await until(a,x=>x.type==='snapshot');const room=created.data.room;assert.equal(room.length,5);
const b=client();await new Promise(r=>b.ws.addEventListener('open',r,{once:true}));b.ws.send(JSON.stringify({type:'join',room,name:'Yanis',character:'yanis'}));await until(a,x=>x.type==='snapshot'&&x.data.players.length===2);
a.ws.send(JSON.stringify({type:'start'}));await until(a,x=>x.type==='snapshot'&&x.data.game?.scene==='intro');
a.ws.send(JSON.stringify({type:'vote',choice:'answer'}));b.ws.send(JSON.stringify({type:'vote',choice:'answer'}));await until(a,x=>x.type==='snapshot'&&x.data.votedCount===2);
a.ws.send(JSON.stringify({type:'resolve'}));const played=await until(b,x=>x.type==='snapshot'&&x.data.game?.scene==='lucien');assert.equal(played.data.game.round,1);
console.log('Tests online OK : WebSocket natif, création, deux joueurs, votes, résolution synchronisée');
}finally{clients.forEach(c=>c.close());await new Promise(r=>server.close(r));}}
test().catch(e=>{console.error(e);process.exitCode=1;server.close();});
