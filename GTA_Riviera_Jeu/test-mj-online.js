'use strict';
const assert=require('node:assert/strict');
process.env.GEMINI_API_KEY='test-only-mock';
const oldFetch=global.fetch;
let calls=0;
global.fetch=async(url,options)=>{
 calls++;
 assert(url.startsWith('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent'));
 assert.equal(options.headers['x-goog-api-key'],'test-only-mock');
 assert.equal(JSON.parse(options.body).generationConfig.responseMimeType,'application/json');
 assert.equal(JSON.parse(options.body).generationConfig.responseJsonSchema.type,'object');
 assert(!JSON.stringify(options.body).includes('api.openai.com'));
 return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify({narration:'Le garage des Tamaris apparaît au détour de la rue. Vous êtes encore libres de vos actes.',rollSkill:'none',rollDC:9,advance:false,memory:'Alex a pris le temps de réfléchir.',evidence:'none'})}]}}]})};
};
const {server,rooms}=require('./server');
const delay=require('node:timers/promises').setTimeout;
async function wait(messages,fn){for(let i=0;i<150;i++){const hit=messages.find(fn);if(hit)return hit;await delay(20);}throw Error('Temps dépassé : '+JSON.stringify(messages.slice(-5)));}
(async()=>{
 const sockets=[];
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 try{
  const ws=new WebSocket('ws://127.0.0.1:'+server.address().port),messages=[];
  sockets.push(ws);ws.onmessage=e=>messages.push(JSON.parse(e.data));
  await new Promise(ok=>ws.addEventListener('open',ok,{once:true}));
  ws.send(JSON.stringify({type:'create',aiMode:true,character:'yanis',name:'Alex'}));
  const start=await wait(messages,m=>m.type==='snapshot'&&m.data.aiMode);
  const code=start.data.room;assert.equal(start.data.aiReady,true);
  ws.send(JSON.stringify({type:'start'}));
  await wait(messages,m=>m.type==='snapshot'&&m.data.ai?.log?.length===1);
  ws.send(JSON.stringify({type:'ai_action',text:'Je prends le temps d’observer le garage.'}));
  await wait(messages,m=>m.type==='snapshot'&&m.data.ai?.turns===1);
  assert.equal(calls,1);assert.equal(rooms.get(code).ai.log.length,3);
  assert.equal(rooms.get(code).game.round,1);
  assert.equal(rooms.get(code).ai.memory,'Alex a pris le temps de réfléchir.');
  console.log('MJ IA WebSocket : solo, narration mockée, état synchronisé, aucune API réelle appelée.');
 }finally{global.fetch=oldFetch;sockets.forEach(ws=>ws.close());await delay(40);await new Promise(ok=>server.close(ok));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
