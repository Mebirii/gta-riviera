'use strict';
// Serveur Node.js sans dépendance, compatible avec Render / Railway / hébergement VPS.
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {attachWebSocket,READY_OPEN}=require('./wire');
const E=require('./engine');
const PORT=Number(process.env.PORT)||3000;
const MAX_SIZE=4,MAX_ROOMS=100,EXPIRE_MS=2*60*60*1000;
const rooms=new Map();
const mime={'.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
function roomCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let code;do{code=Array.from(crypto.randomBytes(5),x=>chars[x%chars.length]).join('');}while(rooms.has(code));return code;}
function safeName(value){return String(value||'Joueur').replace(/[<>\x00-\x1f]/g,'').trim().slice(0,22)||'Joueur';}
function send(ws,obj){if(ws?.readyState===READY_OPEN)ws.send(JSON.stringify(obj));}
function error(ws,message){send(ws,{type:'error',message});}
function seen(room){room.updatedAt=Date.now();}
function livePlayers(room){return room.players.filter(x=>x.ws&&x.ws.readyState===READY_OPEN);}
function snapshot(room,player){return{room:room.code,hostId:room.hostId,you:player.id,players:room.players.map(x=>({id:x.id,name:x.name,character:x.character,connected:!!x.ws&&x.ws.readyState===READY_OPEN})),eligibleCount:livePlayers(room).length,mission:room.mission,game:room.game?E.publicState(room.game):null,votedIds:Object.keys(room.votes),votedCount:Object.keys(room.votes).length};}
function broadcast(room){for(const p of livePlayers(room))send(p.ws,{type:'snapshot',data:snapshot(room,p)});}
function makePlayer(ws,msg){const hero=E.HEROES.find(x=>x.id===msg.character);return{id:crypto.randomUUID(),token:crypto.randomBytes(24).toString('hex'),name:safeName(msg.name),character:hero?hero.id:'gauthier',ws};}
function register(ws,room,player){ws.player={room:room.code,id:player.id};send(ws,{type:'registered',token:player.token,room:room.code});broadcast(room);}
function replyFile(res,file,type,cache='no-cache'){fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end('Introuvable');return;}res.writeHead(200,{'Content-Type':type,'Cache-Control':cache,'X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' ws: wss:"}).end(data);});}
const server=http.createServer((req,res)=>{
 let pathname;try{pathname=new URL(req.url,'http://localhost').pathname;}catch{res.writeHead(400).end();return;}
 if(pathname==='/'||pathname==='/jeu'||pathname==='/GTA_Riviera.html'){replyFile(res,path.join(__dirname,'GTA_Riviera.html'),'text/html; charset=utf-8','no-store');return;}
 if(pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify({ok:true,onlinePlayers:[...rooms.values()].reduce((n,r)=>n+livePlayers(r).length,0),rooms:rooms.size}));return;}
 if(/^\/assets\/[a-z0-9-]+\.(webp|png|jpg|svg)$/.test(pathname)){const asset=path.join(__dirname,pathname.slice(1));replyFile(res,asset,mime[path.extname(asset)]||'application/octet-stream','public,max-age=86400');return;}
 if(pathname==='/favicon.ico'){res.writeHead(204).end();return;}
 res.writeHead(404).end('Page inconnue');
});
attachWebSocket(server,ws=>{
 ws.player=null;
 ws.on('message',raw=>{
 let msg;try{msg=JSON.parse(String(raw));}catch{return error(ws,'Message invalide.');}
 if(!msg||typeof msg.type!=='string')return;
 if(msg.type==='create'){
  if(ws.player)return error(ws,'Vous êtes déjà dans un salon.');
  if(rooms.size>=MAX_ROOMS)return error(ws,'Trop de salons actifs, réessayez ultérieurement.');
  const code=roomCode(),p=makePlayer(ws,msg),mission=['neree','debt','convoy'].includes(msg.mission)?msg.mission:'neree';
  const room={code,players:[p],hostId:p.id,game:null,votes:{},mission,difficulty:['facile','normal','difficile'].includes(msg.difficulty)?msg.difficulty:'normal',updatedAt:Date.now()};
  rooms.set(code,room);register(ws,room,p);return;
 }
 if(msg.type==='join'){
  if(ws.player)return error(ws,'Vous êtes déjà dans un salon.');
  const code=String(msg.room||'').toUpperCase(),room=rooms.get(code);
  if(!room)return error(ws,'Salon introuvable : vérifiez le code.');
  if(room.game)return error(ws,'Partie déjà commencée : utilisez votre lien de reconnexion.');
  if(room.players.length>=MAX_SIZE)return error(ws,'Le salon est complet.');
  const character=String(msg.character||'');
  if(!E.HEROES.some(x=>x.id===character))return error(ws,'Personnage invalide.');
  if(room.players.some(x=>x.character===character))return error(ws,'Ce personnage est déjà pris.');
  const p=makePlayer(ws,msg);room.players.push(p);seen(room);register(ws,room,p);return;
 }
 if(msg.type==='resume'){
  if(ws.player)return error(ws,'Vous êtes déjà connecté.');
  const room=rooms.get(String(msg.room||'').toUpperCase());
  const player=room?.players.find(x=>x.token===msg.token);
  if(!player)return error(ws,'Salon expiré ou session invalide.');
  if(player.ws&&player.ws!==ws)player.ws.close();
  player.ws=ws;seen(room);register(ws,room,player);return;
 }
 if(!ws.player)return error(ws,'Vous devez rejoindre un salon.');
 const room=rooms.get(ws.player.room),p=room?.players.find(x=>x.id===ws.player.id);
 if(!p)return error(ws,'Salon ou joueur introuvable.');
 seen(room);const host=room.hostId===p.id;
 if(msg.type==='start'){
  if(!host)return error(ws,'Seul l’hôte peut commencer.');
  if(room.game)return error(ws,'Partie déjà commencée.');
  if(livePlayers(room).length<2)return error(ws,'Il faut au moins deux joueurs.');
  room.game=E.createGame(room.difficulty,room.mission);room.votes={};broadcast(room);return;
 }
 if(msg.type==='vote'){
  if(!room.game||room.game.ended)return error(ws,'Aucun vote actif.');
  if(!E.getScene(room.game).choices.some(c=>c.id===msg.choice&&c.condition!==false))return error(ws,'Choix non disponible.');
  room.votes[p.id]=msg.choice;broadcast(room);return;
 }
 if(msg.type==='resolve'){
  if(!host)return error(ws,'Seul l’hôte peut valider.');
  if(!room.game||room.game.ended)return error(ws,'Mission terminée.');
  const active=livePlayers(room);
  if(active.length===0||active.some(x=>!room.votes[x.id]))return error(ws,'Attendez les votes des joueurs connectés.');
  const votes=active.map(x=>room.votes[x.id]);const tally={};votes.forEach(id=>tally[id]=(tally[id]||0)+1);
  const max=Math.max(...Object.values(tally));const tied=Object.keys(tally).filter(k=>tally[k]===max);
  const winning=tied.includes(room.votes[room.hostId])?room.votes[room.hostId]:tied[0];
  const c=E.getScene(room.game).choices.find(c=>c.id===winning),candidates=active.filter(x=>room.votes[x.id]===winning);
  candidates.sort((a,b)=>c.skill?(E.HEROES.find(x=>x.id===b.character).skills[c.skill]-E.HEROES.find(x=>x.id===a.character).skills[c.skill]):0);
  try{room.game=E.choose(room.game,winning,candidates[0].character);}catch(e){return error(ws,e.message);}
  room.votes={};broadcast(room);return;
 }
 if(msg.type==='continue'){
  if(!host)return error(ws,'Seul l’hôte peut choisir la suite.');
  if(!room.game?.ended)return error(ws,'Terminez la mission avant de continuer.');
  try{room.game=E.continueCampaign(room.game);}catch(e){return error(ws,e.message);}
  room.votes={};broadcast(room);return;
 }
 if(msg.type==='restart'){
  if(!host)return error(ws,'Seul l’hôte peut recommencer.');
  room.game=E.createGame(room.difficulty,room.mission);room.votes={};broadcast(room);return;
 }
 error(ws,'Action inconnue.');
 });
 ws.on('close',()=>{
  if(!ws.player)return;const room=rooms.get(ws.player.room);if(!room)return;
  const player=room.players.find(x=>x.id===ws.player.id);if(!player||player.ws!==ws)return;
  player.ws=null;delete room.votes[player.id];
  if(room.hostId===player.id){const next=livePlayers(room)[0];if(next)room.hostId=next.id;}
  seen(room);broadcast(room);
 });
});
// Les salons abandonnés sont purgés sans empêcher l'arrêt du serveur (tests).
const cleanup=setInterval(()=>{const now=Date.now();for(const [code,r]of rooms){if(!livePlayers(r).length&&now-r.updatedAt>EXPIRE_MS)rooms.delete(code);}},60000);cleanup.unref();
if(require.main===module)server.listen(PORT,'0.0.0.0',()=>console.log(`GTA Riviera disponible sur http://localhost:${PORT}`));
module.exports={server,rooms};
