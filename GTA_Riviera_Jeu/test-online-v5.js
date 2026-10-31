'use strict';
const assert=require('node:assert/strict'),{server,rooms}=require('./server');
const {setTimeout:delay}=require('node:timers/promises');
async function wait(messages,check){for(let i=0;i<150;i++){const entry=messages.find(check);if(entry)return entry;await delay(15);}throw Error('Attente dépassée '+JSON.stringify(messages.slice(-3)));}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const clients=[],url=`ws://127.0.0.1:${server.address().port}`;
 async function join(){const ws=new WebSocket(url),messages=[];clients.push(ws);ws.onmessage=e=>messages.push(JSON.parse(e.data));await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));return{ws,messages};}
 try{
 const host=await join();host.ws.send(JSON.stringify({type:'create',character:'custom',name:'Noa',profile:{name:'Noa',portrait:'extra-04',skills:{physique:0,ruse:2,technique:1,bagout:1,pilotage:0},specialty:'ruse',contactId:'barmaid',flawId:'indebted'}}));
 const lobby=await wait(host.messages,x=>x.type==='snapshot'&&x.data.players.length===1);const room=lobby.data.room;
 const guest=await join();guest.ws.send(JSON.stringify({type:'join',room,character:'yanis',name:'Yanis'}));await wait(host.messages,x=>x.type==='snapshot'&&x.data.players.length===2);
 host.ws.send(JSON.stringify({type:'start'}));await wait(host.messages,x=>x.type==='snapshot'&&x.data.game?.scene==='belle_open');
 assert.equal(rooms.get(room).game.stats.money,150);
 guest.ws.send(JSON.stringify({type:'world',action:'buy',id:'lockpick'}));await wait(guest.messages,x=>x.type==='error'&&x.message.includes('hôte'));assert.equal(rooms.get(room).game.stats.money,150);
 host.ws.send(JSON.stringify({type:'world',action:'buy',id:'lockpick'}));await wait(host.messages,x=>x.type==='snapshot'&&x.data.game?.inventory?.lockpick===1);assert.equal(rooms.get(room).game.stats.money,30);
 host.ws.send(JSON.stringify({type:'world',action:'equip',id:'lockpick'}));await wait(host.messages,x=>x.type==='snapshot'&&x.data.game?.equipped==='lockpick');
 host.ws.send(JSON.stringify({type:'vote',choice:'belle_go'}));guest.ws.send(JSON.stringify({type:'vote',choice:'belle_go'}));await wait(host.messages,x=>x.type==='snapshot'&&x.data.votedCount===2);
 host.ws.send(JSON.stringify({type:'resolve'}));await wait(host.messages,x=>x.type==='snapshot'&&x.data.game?.scene==='belle_brief');
 assert.equal(rooms.get(room).game.inventory.lockpick,1);
 console.log('Multijoueur V5 : achats réservés à l’hôte, caisse, équipement, synchronisation WebSocket, progression et inventaire conservé OK.');
 }finally{clients.forEach(w=>w.close());await delay(35);await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
