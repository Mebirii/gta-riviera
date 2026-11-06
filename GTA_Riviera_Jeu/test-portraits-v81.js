'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const css=fs.readFileSync('style.css','utf8');
function webpDims(path){
 const bytes=fs.readFileSync(path);
 assert.equal(bytes.toString('ascii',0,4),'RIFF',path);
 const kind=bytes.toString('ascii',12,16);
 if(kind==='VP8 '){const i=bytes.indexOf(Buffer.from([0x9d,0x01,0x2a]));assert(i>0);return [(bytes.readUInt16LE(i+3)&0x3fff),(bytes.readUInt16LE(i+5)&0x3fff)];}
 if(kind==='VP8L'){return [1+(((bytes[21]&0x3f)<<8)|bytes[22]),1+(((bytes[22]&0xc0)>>6)|(bytes[23]<<2)|((bytes[24]&15)<<10))];}
 if(kind==='VP8X'){return [1+bytes.readUIntLE(24,3),1+bytes.readUIntLE(27,3)];}
 throw Error('Format WebP inattendu : '+kind);
}
for(const name of ['gauthier','yanis','mathieu','juliette']){
 const [w,h]=webpDims('assets/portrait-'+name+'.webp');assert(w>=330&&h>=450);
}
for(let i=1;i<=12;i++){
 const name='extra-'+String(i).padStart(2,'0');
 const path='assets/portrait-hd-'+name+'.webp';
 const [w,h]=webpDims(path);
 assert(w>=512&&h>=512,'Portrait HD insuffisant : '+path+' '+w+'×'+h);
}
assert(css.includes('.sheet-picture img.character-portrait--hd'));
assert(css.includes('.portrait-choice img.character-portrait--hd'));
assert(css.includes('.avatar.photo img.character-portrait--hd'));
const events={},app={innerHTML:'',querySelector:()=>null,addEventListener:(k,f)=>events[k]=f},saved={};
const ctx={console,document:{getElementById:()=>app},localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},window:{scrollTo(){}},location:{protocol:'file:',search:''},navigator:{},confirm:()=>true};
ctx.globalThis=ctx;vm.createContext(ctx);
for(const n of ['world.js','engine.js','app.js'])vm.runInContext(fs.readFileSync(n,'utf8'),ctx);
const click=(action,value)=>events.click({target:{closest:()=>({dataset:{action,value}})}});
click('start');
assert(app.innerHTML.includes('assets/portrait-hd-extra-12.webp'));
for(let i=1;i<=12;i++){
 const id='extra-'+String(i).padStart(2,'0');
 click('profile-portrait',id);
 assert(app.innerHTML.includes('class="character-portrait character-portrait--hd" data-portrait="'+id+'"'));
 assert(app.innerHTML.includes('assets/portrait-hd-'+id+'.webp'));
 assert(app.innerHTML.includes('width="512" height="512"'));
}
for(const id of ['gauthier','yanis','mathieu','juliette']){
 click('profile-portrait',id);
 assert(app.innerHTML.includes('class="character-portrait" data-portrait="'+id+'"'));
 assert(app.innerHTML.includes('width="330" height="450"'));
}
console.log('Portraits V8.2 OK : 12 nouvelles images WebP 512×512, 4 portraits originaux, cadrage CSS et création personnage.');
