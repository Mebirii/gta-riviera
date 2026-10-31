'use strict';
const crypto=require('node:crypto');
const ATTRS=['physique','ruse','technique','bagout','pilotage'];
const COLORS=['#b5a5ff','#61dfcf','#ffc17b','#ff82a1','#75bfff','#8fe5a8'];
const AVATARS=['gauthier','yanis','mathieu','juliette',...Array.from({length:12},(_,i)=>'extra-'+String(i+1).padStart(2,'0'))];
const {CONTACTS,FLAWS}=require('./world');
function sanitizeText(value,max=80){return String(value??'').replace(/[<>\x00-\x1f]/g,'').trim().slice(0,max);}
function sanitizeProfile(source){
 if(!source||typeof source!=='object'||Array.isArray(source))throw Error('Profil de personnage invalide.');
 const name=sanitizeText(source.name,22),bio=sanitizeText(source.bio,110);
 const goal=sanitizeText(source.goal,80),flaw=sanitizeText(source.flaw,80),nickname=sanitizeText(source.nickname,30),contacts=sanitizeText(source.contacts,100),notes=sanitizeText(source.notes,160),equipment=sanitizeText(source.equipment,100);
 const contactId=CONTACTS.some(c=>c.id===source.contactId)?source.contactId:null;
 const flawId=FLAWS.some(f=>f.id===source.flawId)?source.flawId:null;
 if(!contactId||!flawId)throw Error('Choisissez un contact et un défaut qui influencent votre histoire.');
 const ARCHETYPES=['Indépendant','Escroc','Pilote','Infiltré','Fixeur','Technicien','Négociateur'];
 const archetype=ARCHETYPES.includes(source.archetype)?source.archetype:'Indépendant';
 const portrait=AVATARS.includes(source.portrait)?source.portrait:'gauthier';
 const color=COLORS.includes(source.color)?source.color:COLORS[0];
 if(!name)throw Error('Donnez un nom à votre personnage.');
 const raw=source.skills||{},skills={};
 for(const k of ATTRS){const n=raw[k];if(!Number.isInteger(n)||n<0||n>2)throw Error('Les caractéristiques doivent aller de 0 à +2.');skills[k]=n;}
 if(ATTRS.map(k=>skills[k]).sort((a,b)=>b-a).join(',')!=='2,1,1,0,0')throw Error('Répartissez exactement +2/+1/+1/0/0.');
 if(!ATTRS.includes(source.specialty))throw Error('Choisissez une spécialité.');
 const roles={physique:'Costaud',ruse:'Infiltré',technique:'Technicien',bagout:'Négociateur',pilotage:'As du volant'};
 return {id:'perso_'+crypto.randomBytes(9).toString('hex'),name,nickname,archetype,contacts,notes,equipment,contactId,flawId,pressure:0,wounds:0,bio:bio||'Nouveau venu à Riviera.',goal,flaw,role:archetype==='Indépendant'?roles[source.specialty]:archetype,portrait,color,skills,specialty:source.specialty,custom:true};
}
module.exports={sanitizeProfile,ATTRS,COLORS,AVATARS};
