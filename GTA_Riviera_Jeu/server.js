'use strict';
// Serveur Node.js sans dépendance, compatible avec Render / Railway / hébergement VPS.
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {attachWebSocket,READY_OPEN}=require('./wire');
const E=require('./engine');
const MJ=require('./mj-ai');
const storage=require('./storage');
const {sanitizeProfile}=require('./profile');
const PORT=Number(process.env.PORT)||3000;
const MAX_SIZE=4,MAX_ROOMS=100,EXPIRE_MS=2*60*60*1000;
const pending=new Map();
function persist(room){if(!storage.enabled())return Promise.resolve();const previous=pending.get(room.code)||Promise.resolve();const next=previous.catch(()=>{}).then(()=>storage.save(room));pending.set(room.code,next);return next.catch(e=>{console.error('Echec sauvegarde:',e.message);throw e;});}
function checkpoint(room){room.updatedAt=Date.now();return persist(room);}
async function initialize(){const saved=await storage.init();for(const row of saved){const room=storage.unpack(row.snapshot);if(room)rooms.set(room.code,room);}console.log('Campagnes rechargees:',rooms.size,'Stockage durable:',storage.enabled());}
const rooms=new Map();
const mime={'.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
function roomCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let code;do{code=Array.from(crypto.randomBytes(5),x=>chars[x%chars.length]).join('');}while(rooms.has(code));return code;}
function safeName(value){return String(value||'Joueur').replace(/[<>\x00-\x1f]/g,'').trim().slice(0,22)||'Joueur';}
function send(ws,obj){if(ws?.readyState===READY_OPEN)ws.send(JSON.stringify(obj));}
function error(ws,message){send(ws,{type:'error',message});}
function seen(room){room.updatedAt=Date.now();}
function livePlayers(room){return room.players.filter(x=>x.ws&&x.ws.readyState===READY_OPEN);}
function snapshot(room,player){return{room:room.code,hostId:room.hostId,you:player.id,players:room.players.map(x=>({id:x.id,name:x.name,character:x.character,connected:!!x.ws&&x.ws.readyState===READY_OPEN,profile:x.profile||null})),persistent:storage.enabled(),imported:!!room.importedCampaign,recoveryKey:player.id===room.hostId?room.recoveryKey:null,eligibleCount:livePlayers(room).length,mission:room.mission,aiMode:!!room.aiMode,aiReady:MJ.configured(),ai:room.aiMode?MJ.publicState(room.ai):null,game:room.game?E.publicState(room.game):null,votedIds:Object.keys(room.votes),votedCount:Object.keys(room.votes).length};}
function broadcast(room){for(const p of livePlayers(room))send(p.ws,{type:'snapshot',data:snapshot(room,p)});}
function makePlayer(ws,msg){const hero=E.HEROES.find(x=>x.id===msg.character);const profile=msg.character==='custom'?sanitizeProfile(msg.profile):null;return{id:crypto.randomUUID(),token:crypto.randomBytes(24).toString('hex'),name:safeName(msg.name)||profile?.name||'Joueur',character:profile?profile.id:hero?hero.id:'gauthier',profile,ws};}
function actor(room,player){return player.profile||E.HEROES.find(x=>x.id===player.character)||E.HEROES[0];}
function register(ws,room,player){ws.player={room:room.code,id:player.id};send(ws,{type:'registered',token:player.token,room:room.code});broadcast(room);}
function replyFile(res,file,type,cache='no-cache'){fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end('Introuvable');return;}res.writeHead(200,{'Content-Type':type,'Cache-Control':cache,'X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' ws: wss:"}).end(data);});}
const server=http.createServer((req,res)=>{
 let pathname;try{pathname=new URL(req.url,'http://localhost').pathname;}catch{res.writeHead(400).end();return;}
 if(pathname==='/'||pathname==='/jeu'||pathname==='/GTA_Riviera.html'){replyFile(res,path.join(__dirname,'GTA_Riviera.html'),'text/html; charset=utf-8','no-store');return;}
 if(pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify({ok:true,persistent:storage.enabled(),onlinePlayers:[...rooms.values()].reduce((n,r)=>n+livePlayers(r).length,0),rooms:rooms.size,aiReady:MJ.configured()}));return;}
 if(/^\/assets\/[a-z0-9-]+\.(webp|png|jpg|svg)$/.test(pathname)){const asset=path.join(__dirname,pathname.slice(1));replyFile(res,asset,mime[path.extname(asset)]||'application/octet-stream','public,max-age=86400');return;}
 if(pathname==='/favicon.ico'){res.writeHead(204).end();return;}
 res.writeHead(404).end('Page inconnue');
});
attachWebSocket(server,ws=>{
 ws.player=null;
 ws.on('message',async raw=>{
 try{ 
 let msg;try{msg=JSON.parse(String(raw));}catch{return error(ws,'Message invalide.');}
 if(!msg||typeof msg.type!=='string')return;
 if(msg.type==='create'){
  if(ws.player)return error(ws,'Vous êtes déjà dans un salon.');
  if(rooms.size>=MAX_ROOMS)return error(ws,'Trop de salons actifs, réessayez ultérieurement.');
  const code=roomCode(),p=makePlayer(ws,msg),mission=msg.mission==='belladone'?'belladone':'belladone';
  const room={aiMode:msg.aiMode===true,ai:null,code,recoveryKey:crypto.randomBytes(12).toString('hex').toUpperCase(),players:[p],hostId:p.id,game:null,votes:{},mission,difficulty:['facile','normal','difficile'].includes(msg.difficulty)?msg.difficulty:'normal',updatedAt:Date.now()};
  await checkpoint(room);rooms.set(code,room);register(ws,room,p);return;
 }
 if(msg.type==='join'){
  if(ws.player)return error(ws,'Vous êtes déjà dans un salon.');
  const code=String(msg.room||'').toUpperCase(),room=rooms.get(code);
  if(!room)return error(ws,'Salon introuvable : vérifiez le code.');
  if(room.game)return error(ws,'Partie déjà commencée : utilisez votre lien de reconnexion.');
  if(room.players.length>=MAX_SIZE)return error(ws,'Le salon est complet.');
  const character=String(msg.character||'');
  if(character!=='custom'&&!E.HEROES.some(x=>x.id===character))return error(ws,'Personnage invalide.');
  if(room.players.some(x=>x.character===character))return error(ws,'Ce personnage est déjà pris.');
  const p=makePlayer(ws,msg);room.players.push(p);await checkpoint(room);register(ws,room,p);return;
 }
 if(msg.type==='resume'){
  if(ws.player)return error(ws,'Vous êtes déjà connecté.');
  const room=rooms.get(String(msg.room||'').toUpperCase());
  const player=room?.players.find(x=>x.token===msg.token);
  if(!player)return error(ws,'Salon expiré ou session invalide.');
  if(player.ws&&player.ws!==ws)player.ws.close();
  player.ws=ws;seen(room);register(ws,room,player);return;
 }
 if(msg.type==='recover'){
  if(ws.player)return error(ws,'Vous êtes déjà connecté.');
  const room=rooms.get(String(msg.room||'').toUpperCase());
  if(!room||!room.recoveryKey||String(msg.recoveryKey||'').toUpperCase()!==room.recoveryKey)return error(ws,'Code de reprise incorrect.');
  const player=room.players.find(x=>x.id===room.hostId)||room.players[0];
  if(player.ws&&player.ws!==ws)player.ws.close();
  player.ws=ws;seen(room);register(ws,room,player);return;
 }
 if(!ws.player)return error(ws,'Vous devez rejoindre un salon.');
 const room=rooms.get(ws.player.room),p=room?.players.find(x=>x.id===ws.player.id);
 if(!p)return error(ws,'Salon ou joueur introuvable.');
 seen(room);const host=room.hostId===p.id;
 if(msg.type==='world'){
  if(room.aiMode)return error(ws,'Le mode MJ IA privilégie les actions narratives ; les commerces seront intégrés prochainement.');
  if(!host)return error(ws,'Seul l’hôte gère la caisse et le matériel.');
  if(!room.game||room.game.ended)return error(ws,'Commencez une mission pour accéder à Riviera.');
  if(Object.keys(room.votes).length)return error(ws,'Terminez d’abord le vote en cours.');
  room.game=E.worldAction(room.game,msg.action,msg.id);await checkpoint(room);broadcast(room);return;
 }
 if(msg.type==='start'){
  if(!host)return error(ws,'Seul l’hôte peut commencer.');
  if(room.game)return error(ws,'Partie déjà commencée.');
  if(livePlayers(room).length<(room.aiMode?1:2))return error(ws,'Il faut au moins deux joueurs.');
  if(room.aiMode&&!MJ.configured())return error(ws,'Le mode MJ IA nécessite une clé OPENAI_API_KEY configurée sur Render.');
  room.game=room.importedCampaign||E.createGame(room.difficulty,room.mission);room.importedCampaign=null;E.prepareCrew(room.game,room.players.map(p=>actor(room,p)));room.ai=room.aiMode?(room.importedAI||MJ.initial()):null;room.importedAI=null;room.votes={};await checkpoint(room);broadcast(room);return;
 }
 if(msg.type==='ai_action'){
  if(!room.aiMode||!room.game||!room.ai)return error(ws,'Aucun MJ IA actif dans cette partie.');
  if(room.ai.busy)return error(ws,'Le MJ répond déjà à un joueur.');
  if(typeof msg.text!=='string'||msg.text.length>500||!msg.text.trim())return error(ws,'Décrivez votre action en 500 caractères maximum.');
  if(room.ai.lastActionAt&&Date.now()-room.ai.lastActionAt<3500)return error(ws,'Laissez quelques secondes entre deux actions.');
  room.ai.busy=true;broadcast(room);
  try{await MJ.takeTurn(room,p,actor(room,p),msg.text);room.ai.lastActionAt=Date.now();await checkpoint(room);}catch(e){console.error('MJ IA:',e.message);error(ws,e.message);}finally{room.ai.busy=false;broadcast(room);}
  return;
 }
 if(room.aiMode&&['vote','resolve','continue'].includes(msg.type))return error(ws,'Utilisez les actions libres dans le mode MJ IA.');
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
  candidates.sort((a,b)=>c.skill?(actor(room,b).skills[c.skill]-actor(room,a).skills[c.skill]):0);
  try{room.game=E.choose(room.game,winning,candidates[0].character);}catch(e){return error(ws,e.message);}
  room.votes={};await checkpoint(room);broadcast(room);return;
 }
 if(msg.type==='continue'){
  if(!host)return error(ws,'Seul l’hôte peut choisir la suite.');
  if(!room.game?.ended)return error(ws,'Terminez la mission avant de continuer.');
  try{room.game=E.continueCampaign(room.game);}catch(e){return error(ws,e.message);}
  room.votes={};await checkpoint(room);broadcast(room);return;
 }
 if(msg.type==='backup'){
  if(!host)return error(ws,'Seul l’hôte peut exporter.');
  if(!room.game)return error(ws,'Commencez une mission avant de l’exporter.');
  send(ws,{type:'backup',data:{version:3,exportedAt:new Date().toISOString(),mission:room.mission,difficulty:room.difficulty,aiMode:!!room.aiMode,ai:room.aiMode?{...room.ai,busy:false}:null,game:room.game,team:room.players.map(p=>({name:p.name,profile:p.profile,character:p.character}))}});return;
 }
 if(msg.type==='import'){
  if(!host)return error(ws,'Seul l’hôte peut importer.');
  if(room.game)return error(ws,'Importez une sauvegarde avant de lancer le salon.');
  const b=msg.backup;
  if(!b||b.version!==3||!b.game||typeof b.game!=='object'||JSON.stringify(b).length>150000)return error(ws,'Fichier de sauvegarde invalide ou trop volumineux.');
  const game=JSON.parse(JSON.stringify(b.game));
  if(![1,4,5].includes(game.version)||!Number.isInteger(game.round)||game.round<0||game.round>10000||!game.stats||!game.flags||!Array.isArray(game.journal)||!Array.isArray(game.history)||game.history.length>10000||game.journal.length>100)return error(ws,'Format de campagne non pris en charge.');
  try{E.getScene(game);}catch{return error(ws,'Cette scène ne peut pas être chargée.');}
  if(room.aiMode!==!!b.aiMode)return error(ws,'Cette sauvegarde appartient à un autre mode de jeu.');
  if(room.aiMode){const ai=b.ai;if(!ai||!Number.isInteger(ai.stage)||ai.stage<0||ai.stage>=MJ.STAGES.length||!Number.isInteger(ai.turns)||ai.turns<0||ai.turns>80||typeof ai.memory!=='string'||ai.memory.length>600||!Array.isArray(ai.log)||ai.log.length>60||ai.log.some(x=>typeof x.text!=='string'||x.text.length>1600))return error(ws,'Sauvegarde MJ IA invalide.');room.importedAI={stage:ai.stage,turns:ai.turns,memory:ai.memory,log:ai.log,busy:false};}
  room.importedCampaign=game;
  await checkpoint(room);broadcast(room);return;
 }
 if(msg.type==='restart'){
  if(!host)return error(ws,'Seul l’hôte peut recommencer.');
  room.game=E.createGame(room.difficulty,room.mission);E.prepareCrew(room.game,room.players.map(p=>actor(room,p)));room.ai=room.aiMode?MJ.initial():null;room.votes={};await checkpoint(room);broadcast(room);return;
 }
 error(ws,'Action inconnue.');
 }catch(e){console.error('Message serveur:',e);error(ws,e.message||'Une erreur serveur est survenue.');}
 });
 ws.on('close',()=>{
  if(!ws.player)return;const room=rooms.get(ws.player.room);if(!room)return;
  const player=room.players.find(x=>x.id===ws.player.id);if(!player||player.ws!==ws)return;
  player.ws=null;delete room.votes[player.id];
  if(room.hostId===player.id){const next=livePlayers(room)[0];if(next)room.hostId=next.id;}
  seen(room);persist(room).catch(()=>{});broadcast(room);
 });
});
// Les salons abandonnés sont purgés sans empêcher l'arrêt du serveur (tests).
const cleanup=setInterval(()=>{if(storage.enabled())return;const now=Date.now();for(const [code,r]of rooms){if(!livePlayers(r).length&&now-r.updatedAt>EXPIRE_MS)rooms.delete(code);}},60000);cleanup.unref();
if(require.main===module)initialize().then(()=>server.listen(PORT,'0.0.0.0',()=>console.log(`GTA Riviera disponible sur http://localhost:${PORT}`))).catch(e=>{console.error('Base de données indisponible:',e);process.exitCode=1;});
module.exports={server,rooms,initialize};
