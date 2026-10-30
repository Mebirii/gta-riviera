'use strict';
const crypto=require('node:crypto');
const ATTRS=['parole','discretion','technique','instinct'];
const COLORS=['#b5a5ff','#61dfcf','#ffc17b','#ff82a1','#75bfff','#8fe5a8'];
const AVATARS=['gauthier','yanis','mathieu','juliette'];
function sanitizeText(value, max=32){return String(value??'').replace(/[<>\x00-\x1f]/g,'').trim().slice(0,max);}
function sanitizeProfile(source){
 if(!source||typeof source!=='object'||Array.isArray(source))throw Error('Profil de personnage invalide.');
 const name=sanitizeText(source.name,22),bio=sanitizeText(source.bio,110);
 const portrait=AVATARS.includes(source.portrait)?source.portrait:'gauthier';
 const color=COLORS.includes(source.color)?source.color:COLORS[0];
 if(!name)throw Error('Donnez un nom à votre personnage.');
 const raw=source.skills||{};const skills={};
 for(const k of ATTRS){const n=raw[k];if(!Number.isInteger(n)||n<0||n>4)throw Error('Les caractéristiques doivent être comprises entre 0 et 4.');skills[k]=n;}
 if(ATTRS.reduce((t,k)=>t+skills[k],0)!==7)throw Error('Vous devez répartir exactement 7 points de compétence.');
 const specialty=ATTRS.reduce((a,b)=>skills[a]>=skills[b]?a:b);
 const roles={parole:'Négociateur',discretion:'Fantôme',technique:'Technicien',instinct:'Éclaireur'};
 return {id:'perso_'+crypto.randomBytes(9).toString('hex'),name,bio:bio||'Un nouveau visage dans la pègre de Riviera.',role:roles[specialty],portrait,color,skills,custom:true};
}
module.exports={sanitizeProfile,ATTRS,COLORS,AVATARS};
