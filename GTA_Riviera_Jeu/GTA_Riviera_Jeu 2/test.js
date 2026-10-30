'use strict';
const assert=require('node:assert/strict');const E=require('./engine');
function doIt(s,id,actor='gauthier',roll=20){return E.choose(s,id,actor,roll);}
let s=E.createGame();assert.equal(s.scene,'intro');s=doIt(s,'answer');s=doIt(s,'accept');assert.equal(s.scene,'crossroads');
s=doIt(s,'port');s=doIt(s,'shadow','yanis');assert.equal(s.flags.leadPort,true);
s=doIt(s,'watch');s=doIt(s,'inspect','gauthier');assert.equal(s.flags.watchCode,true);
s=doIt(s,'police');s=doIt(s,'confide','mathieu');assert.equal(E.leads(s),3);
s=doIt(s,'warehouse');s=doIt(s,'delivery','mathieu');assert.equal(s.scene,'records');s=doIt(s,'decrypt','gauthier');s=doIt(s,'duplicate','gauthier');assert.equal(s.flags.secretCopy,true);s=doIt(s,'protect','juliette');s=doIt(s,'double','gauthier');assert.equal(s.scene,'ending_double');assert.equal(s.ended,true);assert.equal(E.getScene(s).isEnding,true);
assert.throws(()=>doIt(s,'answer'),/terminée/);
let a=E.createGame('difficile');a=doIt(a,'answer');a=doIt(a,'negotiate','mathieu',1);assert.equal(a.scene,'crossroads');assert.equal(a.stats.heat,2);
a=doIt(a,'port');a=doIt(a,'shadow','yanis',1);assert.equal(a.flags.leadPort,true);a=doIt(a,'warehouse');a=doIt(a,'seawall','yanis',1);assert.equal(a.scene,'caught');a=doIt(a,'disable','gauthier',1);assert.equal(a.scene,'records');a=doIt(a,'wipe');a=doIt(a,'original');a=doIt(a,'abandon');a=doIt(a,'expose');assert.equal(a.scene,'ending_police');
for(let i=0;i<500;i++){let t=E.createGame();for(let j=0;j<25&&!t.ended;j++){const choices=E.getScene(t).choices.filter(c=>c.condition!==false);assert(choices.length,'Scene has available choice: '+t.scene);const c=choices[Math.floor(Math.random()*choices.length)];t=E.choose(t,c.id,E.HEROES[Math.floor(Math.random()*4)].id);}assert(t.ended,'Every generated playthrough should reach an ending');}
console.log('Tests OK : succès, échecs, embranchements, 500 parcours complets');
