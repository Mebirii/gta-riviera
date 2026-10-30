'use strict';
const E=require('./engine'),assert=require('node:assert/strict');
const ids=['neree','debt','convoy'];
for(const id of ids){let s=E.createGame('normal',id),turns=0;
 while(!s.ended&&turns++<40){const scene=E.getScene(s);assert(scene.choices.length,`No choices at ${s.scene}`);const c=scene.choices.filter(x=>x.condition!==false)[0];s=E.choose(s,c.id,'gauthier',20);}
 assert(s.ended,id+' did not reach ending');assert(s.completed[id],id+' not marked complete');console.log(id,'OK',turns,'turns',s.scene);
 const done=E.continueCampaign(s);assert.equal(done.scene,'mission_hub');assert.equal(done.ended,false);assert(done.completed[id]);
 const hub=E.getScene(done);assert(hub.choices.some(x=>x.mission==='gala'),'gala not unlocked');
 const galaChoice=hub.choices.find(x=>x.mission==='gala');let g=E.choose(done,galaChoice.id,'gauthier',20);assert.equal(g.mission,'gala');
 for(let i=0;i<8&&!g.ended;i++){const c=E.getScene(g).choices.find(x=>x.condition!==false);g=E.choose(g,c.id,'gauthier',20);}
 assert(g.ended&&g.completed.gala,'gala did not finish');
 assert.deepEqual(g.completed[id],true);assert(g.history.length>turns);
}
// Choix non linéaires et héritage des statistiques.
let s=E.createGame('normal','debt');s=E.choose(s,'debt_secret','gauthier',20);s=E.choose(s,'debt_guard','mathieu',20);s=E.choose(s,'debt_expose','mathieu',20);assert(s.stats.police>0&&s.completed.debt);
console.log('Missions et continuité de campagne validées');
