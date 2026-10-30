'use strict';
const assert=require('node:assert/strict'),{server}=require('./server');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function connect(port){const ws=new WebSocket('ws://127.0.0.1:'+port);const msgs=[];ws.addEventListener('message',e=>msgs.push(JSON.parse(e.data)));await new Promise(r=>ws.addEventListener('open',r,{once:true}));return{ws,msgs,send:m=>ws.send(JSON.stringify(m))};}
async function check(c,fn){for(let i=0;i<120;i++){const m=c.msgs.find(fn);if(m)return m;await sleep(15);}throw Error(JSON.stringify(c.msgs.slice(-4)));}
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;const clients=[];
try{let a=await connect(port);clients.push(a);a.send({type:'create',name:'A',character:'gauthier',mission:'debt'});const reg=await check(a,x=>x.type==='registered');const snap=await check(a,x=>x.type==='snapshot');const room=snap.data.room;
let b=await connect(port);clients.push(b);b.send({type:'join',room,name:'B',character:'yanis'});await check(a,x=>x.type==='snapshot'&&x.data.players.length===2);
a.send({type:'start'});await check(a,x=>x.type==='snapshot'&&x.data.game?.scene==='debt_intro');
a.ws.close();await sleep(60);
let re=await connect(port);clients.push(re);re.send({type:'resume',room,token:reg.token});await check(re,x=>x.type==='registered');await check(re,x=>x.type==='snapshot'&&x.data.game?.scene==='debt_intro');
assert.equal((await check(re,x=>x.type==='snapshot')).data.players.length,2);
let active=[re,b];
for(let n=0;n<3;n++){const scene=(await check(re,x=>x.type==='snapshot'&&x.data.game?.round===n)).data.game.scene;const options={debt_intro:'debt_soft',debt_cafe:'debt_cash',debt_decision:'debt_deliver'};const choice=options[scene];assert(choice);
for(const cl of active)cl.send({type:'vote',choice});await check(re,x=>x.type==='snapshot'&&x.data.votedCount===2&&x.data.game?.round===n);b.send({type:'resolve'});await check(re,x=>x.type==='snapshot'&&x.data.game?.round===n+1);}
const finished=await check(re,x=>x.type==='snapshot'&&x.data.game?.ended);assert(finished.data.game.completed.debt);
b.send({type:'continue'});const hub=await check(re,x=>x.type==='snapshot'&&x.data.game?.scene==='mission_hub');assert.equal(hub.data.game.completed.debt,true);
console.log('Test reconnexion + campagne multijoueur OK');
}finally{clients.forEach(c=>c.ws.close());await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
