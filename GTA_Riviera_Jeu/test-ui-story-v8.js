'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const listeners={},app={innerHTML:'',querySelector:()=>null,addEventListener:(e,fn)=>listeners[e]=fn};
const saved={},ctx={
 console,document:{getElementById:()=>app},
 localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},
 window:{scrollTo(){}},location:{protocol:'file:',search:''},navigator:{},confirm:()=>true
};
ctx.globalThis=ctx;vm.createContext(ctx);
for(const name of ['world.js','engine.js','app.js'])vm.runInContext(fs.readFileSync(name,'utf8'),ctx);
const click=(action,value)=>listeners.click({target:{closest:()=>({dataset:{action,value}})}});
const input=(field,value)=>listeners.input({target:{dataset:{field},value}});
assert(app.innerHTML.includes('Le Dossier Nérée'));
click('start');
input('profile-name','Alex');
click('profile-contact','barmaid');
click('profile-flaw-id','impulsive');
click('finish-creator');
click('start');
assert(app.innerHTML.includes('CARNET DE CAMPAGNE'));
assert(app.innerHTML.includes('journal-de-quetes'));
assert(app.innerHTML.includes('exploration-optional'));
assert(app.innerHTML.includes('Quête à découvrir'));
click('choice','belle_go');
click('choice','belle_accept');
assert(app.innerHTML.includes('Le service de Nora'));
assert(app.innerHTML.includes('DÉBLOQUÉE'));
click('choice','quest_nora');
assert(app.innerHTML.includes('Un badge de trop'));
click('choice','nora_trust');
assert(app.innerHTML.includes('TERMINÉE'));
assert(!app.innerHTML.includes('data-value="quest_nora"'));
assert(app.innerHTML.includes('Choisir le plan'));
console.log('UI V8 : carnet de quêtes, déblocage, scène annexe, retour à la trame et scénario classique OK.');
