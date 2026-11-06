'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const css=fs.readFileSync('style.css','utf8'),js=fs.readFileSync('app.js','utf8');
function webpSize(name){
 const bytes=fs.readFileSync('assets/portrait-'+name+'.webp');
 assert.equal(bytes.toString('ascii',0,4),'RIFF');
 const k=bytes.indexOf(Buffer.from([0x9d,0x01,0x2a]));
 assert(k>0,'VP8 header missing for '+name);
 return [(bytes.readUInt16LE(k+3)&0x3fff),(bytes.readUInt16LE(k+5)&0x3fff)];
}
for(const name of ['gauthier','yanis','mathieu','juliette']){
 const [w,h]=webpSize(name);assert(w>=330&&h>=450,'Portrait principal trop petit : '+name);
}
for(let i=1;i<=12;i++){
 const name='extra-'+String(i).padStart(2,'0');
 const [w,h]=webpSize(name);assert(w>=228&&h>=252,'Portrait alternatif trop petit : '+name);
}
assert(css.includes('.sheet-picture img.character-portrait--small'));
assert(css.includes('width:min(228px,100%)'));
assert(css.includes('.portrait-choice img.character-portrait--bottom'));
assert(css.includes('transform-origin:center bottom'));
assert(css.includes('.avatar.photo img.character-portrait'));
const listeners={},app={innerHTML:'',querySelector:()=>null,addEventListener:(event,fn)=>listeners[event]=fn},saved={};
const ctx={console,document:{getElementById:()=>app},localStorage:{
 getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]
},window:{scrollTo(){}},location:{protocol:'file:',search:''},navigator:{},confirm:()=>true};
ctx.globalThis=ctx;vm.createContext(ctx);
for(const file of ['world.js','engine.js','app.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
const click=(action,value)=>listeners.click({target:{closest:()=>({dataset:{action,value}})}});
click('start');
assert(app.innerHTML.includes('portrait-extra-12.webp'));
for(let i=1;i<=12;i++){
 const id='extra-'+String(i).padStart(2,'0');
 click('profile-portrait',id);
 const classTail=i>=9?' character-portrait--bottom':'';
 assert(app.innerHTML.includes('class="character-portrait character-portrait--small'+classTail+'" data-portrait="'+id+'"'));
 assert(app.innerHTML.includes('width="228" height="252"'));
}
for(const id of ['gauthier','yanis','mathieu','juliette']){
 click('profile-portrait',id);
 assert(app.innerHTML.includes('class="character-portrait" data-portrait="'+id+'"'));
 assert(app.innerHTML.includes('width="330" height="450"'));
}
console.log('Portraits V8.1 OK : 16 sources vérifiées, 12 cadrages alternatifs, 4 portraits principaux, CSS et création de personnage.');
