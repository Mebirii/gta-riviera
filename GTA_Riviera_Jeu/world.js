(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.RivieraWorld=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const CONTACTS=[
 {id:'barmaid',name:'Sofia · serveuse',place:'Belladone',desc:'Vous connaissez une employée du bar. +1 Ruse au Belladone ; accès à une piste de service.',skill:'ruse',match:'belle_'},
 {id:'mechanic',name:'Nico · mécanicien',place:'Garage Costa',desc:'Un ami au garage. +1 Technique pendant les préparatifs et sur les docks.',skill:'technique',match:'belle_prep|belle_service|docks|warehouse'},
 {id:'fixer',name:'Enzo · intermédiaire',place:'Vieux-Port',desc:'Un fixeur local. +1 Bagout pour négocier avec Lucien.',skill:'bagout',match:'belle_brief|lucien|debt_'},
 {id:'driver',name:'Inès · pilote',place:'La Corniche',desc:'Une amie du bitume. +1 Pilotage pendant les poursuites.',skill:'pilotage',match:'belle_exit|escape|convoy_'},
 {id:'hacker',name:'Milo · informaticien',place:'Centre-ville',desc:'Un technicien fiable. +1 Technique face aux systèmes électroniques.',skill:'technique',match:'belle_suite|records|gala_'},
 {id:'journalist',name:'Clara · journaliste',place:'Vieille Ville',desc:'Une alliée dans la presse. +1 Bagout lors des enquêtes et révélations.',skill:'bagout',match:'station|gala_|crossroads'}
];
const FLAWS=[
 {id:'impulsive',name:'Impulsif',desc:'Chaque échec critique augmente la pression policière de +1.',type:'criticalHeat'},
 {id:'indebted',name:'Endetté',desc:'−150 € dès le début ; +1 Bagout pour négocier un paiement.',type:'debt'},
 {id:'wanted',name:'Visage connu',desc:'La partie commence avec +2 de pression ; −1 Ruse au Belladone.',type:'wanted'},
 {id:'vertigo',name:'Vertige',desc:'−2 Physique pour les passages en hauteur ou les escaliers.',type:'vertigo'},
 {id:'distrustful',name:'Méfiant',desc:'−1 Bagout en négociant avec Lucien ; +1 Ruse avec ses hommes.',type:'distrustful'},
 {id:'loner',name:'Loup solitaire',desc:'La cohésion du groupe commence à −1 ; +1 Ruse en infiltration.',type:'loner'}
];
const ITEMS=[
 {id:'lockpick',name:'Kit de crochetage',icon:'🗝️',price:120,place:'bazar',category:'Équipement',desc:'Équipement : +1 Technique sur vos jets, tant qu’il est équipé.',kind:'gear',skill:'technique'},
 {id:'suit',name:'Costume de réception',icon:'🕴️',price:160,place:'boutique',category:'Équipement',desc:'Équipement : +1 Bagout avec une tenue crédible.',kind:'gear',skill:'bagout'},
 {id:'sneakers',name:'Chaussures furtives',icon:'👟',price:100,place:'boutique',category:'Équipement',desc:'Équipement : +1 Ruse dans les déplacements.',kind:'gear',skill:'ruse'},
 {id:'gloves',name:'Gants de conduite',icon:'🏎️',price:90,place:'garage',category:'Équipement',desc:'Équipement : +1 Pilotage.',kind:'gear',skill:'pilotage'},
 {id:'vest',name:'Veste renforcée',icon:'🧥',price:180,place:'bazar',category:'Équipement',desc:'Équipement : +1 Physique.',kind:'gear',skill:'physique'},
 {id:'espresso',name:'Espresso serré',icon:'☕',price:30,place:'boutique',category:'Consommable',desc:'À utiliser : +2 sur le prochain jet, puis disparaît.',kind:'boost',bonus:2},
 {id:'signal',name:'Brouilleur portable',icon:'📟',price:190,place:'bazar',category:'Consommable',desc:'À utiliser : +2 sur votre prochain jet de Technique ou Ruse.',kind:'boost',bonus:2,skills:['technique','ruse']},
 {id:'envelope',name:'Enveloppe de billets',icon:'💶',price:140,place:'bazar',category:'Consommable',desc:'À utiliser : +2 sur le prochain jet de Bagout.',kind:'boost',bonus:2,skills:['bagout']},
 {id:'firstaid',name:'Trousse de premiers soins',icon:'🩹',price:80,place:'boutique',category:'Consommable',desc:'À utiliser : rend +1 de cohésion (jusqu’à 5).',kind:'heal'},
 {id:'dossier_half',name:'Dossier Nérée · extrait',icon:'📁',price:0,place:'none',category:'Pièce à conviction',desc:'Les documents réellement récupérés au Belladone.',kind:'key'},
 {id:'dossier_full',name:'Dossier Nérée · complet',icon:'📚',price:0,place:'none',category:'Pièce à conviction',desc:'L’intégralité du dossier obtenu grâce à vos choix.',kind:'key'},
 {id:'beeper',name:'Bipeur de poche',icon:'📟',price:0,place:'none',category:'Personnel',desc:'Un contact d’urgence et les codes de votre équipe.',kind:'key'}
];
const STORES=[
 {id:'bazar',name:'Le Bazar des Quais',icon:'🧰',district:'Vieux-Port',districtId:'vieux-port',desc:'Outils et accessoires pour les missions.'},
 {id:'boutique',name:'Boutique de la Promenade',icon:'🛍️',district:'Centre-ville',districtId:'centre-ville',desc:'Tenues, soins et préparatifs discrets.'},
 {id:'garage',name:'Garage Costa',icon:'🚘',district:'La Corniche',districtId:'corniche',desc:'Équipement automobile et entretien.'}
];
const SERVICES=[
 {id:'workshop',name:'Plaques discrètes · Garage Costa',districtId:'corniche',icon:'🚘',price:180,desc:'−2 pression : change les plaques et efface les traces.',effects:{heat:-2}},
 {id:'doctor',name:'Clinique des Oliviers',districtId:'vieille-ville',icon:'🏥',price:120,desc:'+1 cohésion : panse les blessures et rassure le groupe.',effects:{morale:1}},
 {id:'informant',name:'Informateur du port',districtId:'vieux-port',icon:'🕵️',price:150,desc:'+1 au prochain jet : une information utile.',boost:1},
 {id:'fixer',name:'Intermédiaire discret',districtId:'vieux-port',icon:'🤝',price:200,desc:'+1 confiance de Lucien, −1 pression.',effects:{lucien:1,heat:-1}}
];

const DISTRICTS=[
 {id:'belle-rive',name:'Belle-Rive',icon:'🌇',x:56,y:26,tag:'Point de départ',desc:'La promenade, les premières rencontres et les préparatifs. La ville vous appartient, mais votre histoire reste à écrire.'},
 {id:'vieux-port',name:'Vieux-Port',icon:'⚓',x:33,y:73,tag:'Quais et affaires',desc:'Entrepôts, dockers et marchés parallèles. On y achète du matériel et les rumeurs circulent vite.'},
 {id:'centre-ville',name:'Centre-ville',icon:'🏙️',x:57,y:52,tag:'Commerces et réseaux',desc:'Boutiques, cafés et bureaux. Un quartier idéal pour se préparer sans attirer l’attention.'},
 {id:'corniche',name:'La Corniche',icon:'🚘',x:79,y:38,tag:'Moteurs et garages',desc:'Les routes qui dominent la baie. Les mécaniciens connaissent les voitures et leurs secrets.'},
 {id:'vieille-ville',name:'Vieille Ville',icon:'📰',x:22,y:38,tag:'Ruelles et contacts',desc:'Arcades anciennes, dispensaire et presse locale : on y rend des services et on recueille des confidences.'}
];
const NPCS=[
 {id:'enzo',name:'Enzo',role:'Intermédiaire du port',districtId:'vieux-port',contactId:'fixer',dialogue:'« Tout le monde a une histoire ici. Choisissez bien ceux à qui vous la racontez. »'},
 {id:'milo',name:'Milo',role:'Technicien indépendant',districtId:'centre-ville',contactId:'hacker',dialogue:'« Les machines gardent les traces que les gens oublient. »'},
 {id:'nico',name:'Nico',role:'Mécanicien',districtId:'corniche',contactId:'mechanic',dialogue:'« Une bonne voiture ne pose pas de questions. »'},
 {id:'ines',name:'Inès',role:'Conductrice',districtId:'corniche',contactId:'driver',dialogue:'« Connaître une sortie, c’est déjà préparer la prochaine entrée. »'},
 {id:'clara',name:'Clara',role:'Journaliste',districtId:'vieille-ville',contactId:'journalist',dialogue:'« Ici, tout le monde sait quelque chose, mais personne ne sait tout. »'}
];
const ACTIVITIES=[
 {id:'courier',districtId:'vieux-port',name:'Course du quai',icon:'📦',desc:'Acheminer un colis ordinaire pour un commerçant.',effect:{money:70},result:'Le pli est livré sans incident. Vous gagnez 70 €.'},
 {id:'poster',districtId:'centre-ville',name:'Distribution d’affiches',icon:'📋',desc:'Un petit boulot sans histoire, payé en espèces.',effect:{money:45},result:'La tournée est terminée. Vous recevez 45 €.'},
 {id:'help',districtId:'vieille-ville',name:'Coup de main au dispensaire',icon:'🩹',desc:'Aider à acheminer du matériel médical.',effect:{morale:1},result:'Le dispensaire vous remercie. La cohésion gagne +1.'}
];
const district=(id)=>DISTRICTS.find(d=>d.id===id);
const canExplore=(s)=>['belle_open','belle_brief','belle_prep','intro','mission_hub','crossroads','debt_intro','convoy_intro','gala_intro'].includes(s?.scene)&&!s?.ended;
function currentDistrict(s){return district(s?.city?.district)||DISTRICTS[0];}
function isLocal(s,id){return currentDistrict(s).id===id&&canExplore(s);}

const find=(arr,id)=>arr.find(x=>x.id===id);
function initialize(s){if(!s.inventory)s.inventory={beeper:1,firstaid:1};if(s.equipped===undefined)s.equipped=null;if(!s.prepared)s.prepared=null;if(!s.servicesUsed)s.servicesUsed={};if(!s.city||typeof s.city!=='object')s.city={district:'belle-rive',visited:{'belle-rive':1},met:{},activities:{}};if(!district(s.city.district))s.city.district='belle-rive';s.city.visited=s.city.visited||{'belle-rive':1};s.city.met=s.city.met||{};s.city.activities=s.city.activities||{};return s;}
function prepareCrew(s,crew){initialize(s);s.crew=crew;if(s.crewPrepared)return s;s.crewPrepared=true;for(const p of crew){if(p.flawId==='indebted')s.stats.money=Math.max(0,s.stats.money-150);if(p.flawId==='wanted')s.stats.heat=Math.min(10,s.stats.heat+2);if(p.flawId==='loner')s.stats.morale=Math.max(0,s.stats.morale-1);}return s;}
function characterBonus(p,skill,scene,roll){let n=0,details=[];
 const contact=find(CONTACTS,p?.contactId);if(contact&&skill===contact.skill&&new RegExp(contact.match).test(scene)){n++;details.push('contact : '+contact.name);}
 if(p?.flawId==='vertigo'&&skill==='physique'&&/belle_stairs|belle_terrace|gala_roof/.test(scene)){n-=2;details.push('vertige −2');}
 if(p?.flawId==='wanted'&&skill==='ruse'&&scene.startsWith('belle_')){n--;details.push('visage connu −1');}
 if(p?.flawId==='distrustful'&&skill==='bagout'&&/belle_brief|lucien/.test(scene)){n--;details.push('méfiance −1');}
 if(p?.flawId==='distrustful'&&skill==='ruse'&&/belle_stairs|belle_rivals/.test(scene)){n++;details.push('méfiance +1');}
 if(p?.flawId==='loner'&&skill==='ruse'){n++;details.push('loup solitaire +1');}
 if(p?.flawId==='indebted'&&skill==='bagout'&&/belle_brief|lucien/.test(scene)){n++;details.push('endetté +1');}
 return{value:n,details};}
function rollBonus(s,p,skill,roll){initialize(s);const x=characterBonus(p,skill,s.scene,roll);const gear=find(ITEMS,s.equipped);if(gear?.skill===skill){x.value++;x.details.push('équipement : '+gear.name+' +1');}if(s.prepared&&(!s.prepared.skills||s.prepared.skills.includes(skill))){x.value+=s.prepared.bonus;x.details.push('consommable +'+s.prepared.bonus);s.prepared=null;}return x;}
function perform(game,kind,id){const s=JSON.parse(JSON.stringify(game));initialize(s);const item=find(ITEMS,id),service=find(SERVICES,id);let note='';
 if(kind==='travel'){
  const destination=district(id);
  if(!destination)throw Error('Quartier inconnu.');
  if(!canExplore(s))throw Error('Terminez cette séquence de mission avant de reprendre l’exploration.');
  if(s.city.district===id)throw Error('Vous êtes déjà dans ce quartier.');
  s.city.district=id;s.city.visited[id]=(s.city.visited[id]||0)+1;
  note='Déplacement vers '+destination.name+'. '+destination.desc;
 }else if(kind==='talk'){
  const npc=find(NPCS,id);
  if(!npc||!isLocal(s,npc.districtId))throw Error('Ce contact n’est pas dans votre quartier actuel.');
  if(s.city.met[id])throw Error('Vous avez déjà échangé avec cette personne.');
  s.city.met[id]=true;
  const friend=s.crew?.some(p=>p.contactId===npc.contactId);
  if(friend)s.stats.morale=Math.min(5,s.stats.morale+1);
  note=npc.name+' : '+npc.dialogue+(friend?' Votre relation facilite la rencontre (+1 cohésion).':' Vous avez fait connaissance.');
 }else if(kind==='activity'){
  const activity=find(ACTIVITIES,id);
  if(!activity||!isLocal(s,activity.districtId))throw Error('Cette activité n’est pas disponible ici.');
  if(s.city.activities[id])throw Error('Cette activité a déjà été terminée.');
  s.city.activities[id]=true;
  for(const [key,value] of Object.entries(activity.effect)){
   if(key==='money')s.stats.money=Math.max(0,s.stats.money+value);
   else if(key==='morale')s.stats.morale=Math.min(5,Math.max(0,s.stats.morale+value));
  }
  note=activity.name+' : '+activity.result;
 }else if(kind==='buy'){
  if(!item||item.price<=0)throw Error('Article indisponible.');
  const shop=find(STORES,item.place);
  if(!shop||!isLocal(s,shop.districtId))throw Error('Rendez-vous dans le quartier du marchand pour acheter cet objet.');if((s.inventory[id]||0)>=8)throw Error('Stock maximum atteint.');if(s.stats.money<item.price)throw Error('Argent insuffisant.');s.stats.money-=item.price;s.inventory[id]=(s.inventory[id]||0)+1;note='Achat : '+item.name+' (−'+item.price+' €).';
 }else if(kind==='equip'){
  if(!item||item.kind!=='gear'||!s.inventory[id])throw Error('Équipement non possédé.');s.equipped=s.equipped===id?null:id;note=s.equipped?'Équipé : '+item.name+' (+1 '+item.skill+').':'Équipement retiré.';
 }else if(kind==='use'){
  if(!item||!s.inventory[id]||!['heal','boost'].includes(item.kind))throw Error('Objet indisponible.');if(item.kind==='boost'&&s.prepared)throw Error('Un bonus est déjà préparé : utilisez-le avant.');if(item.kind==='heal'&&s.stats.morale>=5)throw Error('La cohésion est déjà au maximum.');s.inventory[id]--;if(!s.inventory[id])delete s.inventory[id];if(item.kind==='heal')s.stats.morale=Math.min(5,s.stats.morale+1);else s.prepared={bonus:item.bonus,skills:item.skills||null};note='Utilisé : '+item.name+'. '+(item.kind==='boost'?'Bonus prêt pour le prochain jet adapté.':'Cohésion améliorée.');
 }else if(kind==='service'){
  if(!service)throw Error('Service inconnu.');if(!isLocal(s,service.districtId))throw Error('Rendez-vous sur place pour bénéficier de ce service.');if(s.stats.money<service.price)throw Error('Argent insuffisant.');const key=s.scene+':'+id;if(s.servicesUsed[key])throw Error('Service déjà utilisé pendant cette scène.');if(service.boost&&s.prepared)throw Error('Un bonus est déjà préparé.');s.stats.money-=service.price;s.servicesUsed[key]=true;for(const[k,v]of Object.entries(service.effects||{})){const limits=k==='heat'?[0,10]:k==='morale'?[0,5]:[-5,5];s.stats[k]=Math.max(limits[0],Math.min(limits[1],s.stats[k]+v));}if(service.boost)s.prepared={bonus:service.boost,skills:null};note=service.name+' : '+service.desc+' (−'+service.price+' €).';
 }else throw Error('Action inconnue.');
 s.journal.unshift({title:'Riviera · '+({travel:'Déplacement',talk:'Rencontre',activity:'Activité',service:'Service'}[kind]||'Inventaire'),text:note,turn:s.round});s.journal=s.journal.slice(0,24);return s;}
return{CONTACTS,FLAWS,ITEMS,STORES,SERVICES,DISTRICTS,NPCS,ACTIVITIES,canExplore,currentDistrict,isLocal,initialize,prepareCrew,characterBonus,rollBonus,perform};
});
