'use strict';
// Database-backed campaign storage. Never persist open sockets or live player votes.
const databaseUrl=process.env.DATABASE_URL;
let pool=null;
const {Pool}=databaseUrl?require('pg'):{Pool:null};
function enabled(){return !!databaseUrl;}
async function init(){
 if(!databaseUrl)return [];
 pool=new Pool({connectionString:databaseUrl,max:3,connectionTimeoutMillis:6000, idleTimeoutMillis:20000});
 await pool.query(`CREATE TABLE IF NOT EXISTS riviera_campaigns (
   code varchar(8) PRIMARY KEY,
   snapshot jsonb NOT NULL,
   updated_at timestamptz NOT NULL DEFAULT now()
 )`);
 const {rows}=await pool.query('SELECT code, snapshot FROM riviera_campaigns ORDER BY updated_at DESC LIMIT 500');
 return rows;
}
function pack(room){return{version:3,code:room.code,hostId:room.hostId,recoveryKey:room.recoveryKey,mission:room.mission,difficulty:room.difficulty,updatedAt:room.updatedAt,aiMode:!!room.aiMode,ai:room.ai?{...room.ai,busy:false}:null,importedAI:room.importedAI||null,game:room.game,importedCampaign:room.importedCampaign||null,players:room.players.map(({id,token,name,character,profile})=>({id,token,name,character,profile}))};}
function unpack(data){if(!data||data.version!==3||!Array.isArray(data.players)||!data.players.length||data.players.length>4||!data.code||data.code.length!==5)return null;return {...data,aiMode:!!data.aiMode,ai:data.ai?{...data.ai,busy:false}:null,votes:{},players:data.players.map(p=>({...p,ws:null}))};}
async function save(room){if(!pool)return;await pool.query('INSERT INTO riviera_campaigns(code,snapshot,updated_at) VALUES($1,$2::jsonb,now()) ON CONFLICT (code) DO UPDATE SET snapshot=EXCLUDED.snapshot, updated_at=now()', [room.code,JSON.stringify(pack(room))]);}
async function close(){if(pool)await pool.end();}
module.exports={enabled,init,pack,unpack,save,close};
