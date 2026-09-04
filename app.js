const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const GAME_TYPES={x301:{label:'301',desc:'X01 classique'},x501:{label:'501',desc:'X01 standard'},x701:{label:'701',desc:'Longue partie'},x301k:{label:'301 Killer',desc:'Même volée = retour au départ'},x501k:{label:'501 Killer',desc:'Même volée = retour au départ'},x701k:{label:'701 Killer',desc:'Même volée = retour au départ'},cricket:{label:'Cricket',desc:'15–20 + Bull'},shanghai:{label:'Shanghai',desc:'20 manches · Tout sur la cible'},training:{label:'Entraînement',desc:'Cibles, scores et checkouts'}};
const OUTS={170:'T20 T20 Bull',167:'T20 T19 Bull',164:'T20 T18 Bull',161:'T20 T17 Bull',160:'T20 D20',158:'T20 D19',157:'T19 D20',156:'T20 D18',155:'T19 D19',154:'T18 D20',153:'T19 D18',152:'T20 D16',151:'T17 D20',150:'T20 D15',149:'T19 D16',148:'T20 D14',147:'T17 D18',146:'T18 D16',145:'T19 D14',144:'T20 D12',143:'T17 D16',142:'T18 D14',141:'T19 D12',140:'T20 D10',139:'T13 D20',138:'T18 D12',137:'T19 D10',136:'T20 D8',135:'Bull T15 D20',134:'T14 D16',133:'T19 D8',132:'Bull T14 D20',131:'T13 D16',130:'T20 D5',129:'T19 D12',128:'T18 D16',127:'T17 D8',126:'T19 D6',125:'Bull T17 D12',124:'T16 D8',123:'T19 D6',122:'T18 D7',121:'T11 D14',120:'T20 S20 D20',119:'T19 T12 D13',118:'T20 S18 D20',117:'T20 S17 D20',116:'T20 S16 D20',115:'T20 S15 D20',114:'T20 S14 D20',113:'T20 S13 D20',112:'T20 S12 D20',111:'T20 S11 D20',110:'T20 S10 D20',109:'T20 S9 D20',108:'T20 S16 D16',107:'T19 S18 D16',106:'T20 S14 D16',105:'T19 S16 D16',104:'T18 S18 D16',103:'T20 S3 D20',102:'T20 S10 D16',101:'T20 S1 D20',100:'T20 D20',99:'T19 S10 D20',98:'T20 D19',97:'T19 D20',96:'T20 D18',95:'T19 D19',94:'T18 D20',93:'T19 D18',92:'T20 D16',91:'T17 D20',90:'T18 D18',89:'T19 D16',88:'T16 D20',87:'T17 D18',86:'T18 D16',85:'T15 D20',84:'T20 D12',83:'T17 D16',82:'Bull D19',81:'T19 D12',80:'T20 D10',79:'T19 D11',78:'T18 D12',77:'T19 D10',76:'T20 D8',75:'T17 D12',74:'T14 D16',73:'T19 D8',72:'T16 D12',71:'T13 D16',70:'T18 D8',69:'T19 D6',68:'T20 D4',67:'T17 D8',66:'T10 D18',65:'T19 D4',64:'T16 D8',63:'T13 D12',62:'T10 D16',61:'T15 D8',60:'S20 D20',59:'S19 D20',58:'S18 D20',57:'S17 D20',56:'S16 D20',55:'S15 D20',54:'S14 D20',53:'S13 D20',52:'S12 D20',51:'S11 D20',50:'Bull',49:'S9 D20',48:'S8 D20',47:'S7 D20',46:'S6 D20',45:'S5 D20',44:'S4 D20',43:'S3 D20',42:'S10 D16',41:'S9 D16',40:'D20',39:'S7 D16',38:'D19',37:'S5 D16',36:'D18',35:'S3 D16',34:'D17',33:'S1 D16',32:'D16',31:'S7 D12',30:'D15',29:'S13 D8',28:'D14',27:'S11 D8',26:'D13',25:'S9 D8',24:'D12',23:'S7 D8',22:'D11',21:'S5 D8',20:'D10',19:'S3 D8',18:'D9',17:'S1 D8',16:'D8',15:'S7 D4',14:'D7',13:'S5 D4',12:'D6',11:'S3 D4',10:'D5',9:'S1 D4',8:'D4',7:'S3 D2',6:'D3',5:'S1 D2',4:'D2',3:'S1 D1',2:'D1'};

let S=JSON.parse(localStorage.getItem('dartsScoreV14')||'null');
let mult=1, undoStack=[], deferred=null, setupType='x501', finish='double', starterSeed=null, playerMode='multi', autoTimer=null;
function save(){localStorage.setItem('dartsScoreV14',JSON.stringify(S))}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function typeLabel(){return GAME_TYPES[S.type]?.label||S.type}
function isX(){return !!S?.type?.startsWith('x')}
function isKiller(){return isX()&&S.type.endsWith('k')}
function baseOf(type){return type.startsWith('x')?+type.slice(1,type.endsWith('k')?-1:undefined):0}
function emptyStats(){return{total:0,darts:0,turns:0,busts:0,checkouts:0,highestTurn:0,lastTurnScore:null,legWins:0,setWins:0,started:false,marks:{15:0,16:0,17:0,18:0,19:0,20:0,25:0}}}
function newState(type,names){
 const base=baseOf(type), now=Date.now();
 S={type,baseScore:base,players:names.map((name,idx)=>({name:name||`Joueur ${idx+1}`,score:base,...emptyStats()})),active:0,starter:0,round:1,target:1,dartsInTurn:[],finished:false,winner:null,finish,legsToWin:+$('#legsToWin').value||1,setsToWin:+$('#setsToWin').value||1,doubleIn:$('#doubleIn')?.classList.contains('selected')||false,log:[],startedAt:now,history:[],gameNumber:(S?.gameNumber||0)+1,trainingTarget:null,trainingScore:0};
 if(names.length===1)S.starter=0;else{if(starterSeed===null)starterSeed=Math.floor(Math.random()*names.length);S.starter=starterSeed%names.length;starterSeed=(S.starter+1)%names.length}S.active=S.starter;undoStack=[];save();showMain();render();closeFinish();log(`Nouvelle partie — ${typeLabel()} — ${names.length===1?'Jeu solo':`🎯 ${S.players[S.starter].name} commence`}`)
}
function showMain(){$('#setup').classList.add('hide');$('#main').classList.remove('hide')}
function showSetup(){$('#main').classList.add('hide');$('#setup').classList.remove('hide');renderSetup();closeFinish()}
function renderSetup(){
 $('#gameTypes').innerHTML=Object.entries(GAME_TYPES).map(([k,v])=>`<button class="game-type ${setupType===k?'selected':''}" data-type="${k}"><strong>${v.label}</strong><span>${v.desc}</span></button>`).join('');
 $('#x01Options').classList.toggle('hide',!setupType.startsWith('x'));
 $('#playerEditor').innerHTML='';
 const names=playerMode==='solo'?['Joueur 1']:['Joueur 1','Joueur 2']; names.forEach(addPlayerRow); syncPlayerMode();
}
function addPlayerRow(name=''){const count=$('#playerEditor').children.length;if(count>=4){toast('Maximum 4 joueurs');return}const row=document.createElement('div');row.className='player-edit';row.innerHTML=`<input maxlength="20" value="${escapeHtml(name)}" placeholder="Nom du joueur ${count+1}"><button class="danger" title="Supprimer">×</button>`;row.querySelector('button').onclick=()=>{if($('#playerEditor').children.length<=2&&!soloSelected()){toast('Il faut au moins 2 joueurs');return}row.remove();refreshPlaceholders();syncPlayerMode()};$('#playerEditor').appendChild(row);refreshPlaceholders();syncPlayerMode()}
function soloSelected(){return playerMode==='solo'}
function refreshPlaceholders(){$$('#playerEditor input').forEach((x,i)=>x.placeholder=`Nom du joueur ${i+1}`)}
function selectedNames(){return $$('#playerEditor input').map(x=>x.value.trim()).filter(Boolean).slice(0,4)}
function syncPlayerMode(){const solo=soloSelected();$('#addPlayer').classList.toggle('hide',solo);$$('#playerEditor input').forEach((x,i)=>x.disabled=solo&&i>0);$$('#playerEditor .danger').forEach(b=>b.classList.toggle('hide',solo));if(solo){while($('#playerEditor').children.length>1)$('#playerEditor').lastElementChild.remove()}}
function label(v,m){if(m===0)return'Miss';if(v===25&&m===2)return'Bull';if(v===25&&m===3)return'T25';return(m===3?'T':m===2?'D':'S')+v}
function dartValue(d){return d.m===0?0:d.m===25?25:d.v*d.m}
function pushUndo(){undoStack.push(JSON.stringify(S));if(undoStack.length>100)undoStack.shift()}
function addDart(v){
 if(!S||S.finished||S.dartsInTurn.length>=3)return;
 if(S.type==='shanghai'&&v!==S.target&&v!==0&&v!==25){toast(`Manche ${S.target} : tout sur le ${S.target}`);return}
 if(S.type==='training'&&v===0){/* miss is allowed */}
 S.dartsInTurn.push({v,m:mult,label:label(v,mult)});
 save();render();
 // En X01, une partie se termine dès que le joueur atteint 0 :
 // il n'a pas à saisir les fléchettes restantes comme MISS.
 if(isX()&&canFinishCurrentTurn()){
   clearTimeout(autoTimer);
   submit();
   return;
 }
 if(S.dartsInTurn.length===3){
   clearTimeout(autoTimer);
   autoTimer=setTimeout(()=>{if(S&&!S.finished&&S.dartsInTurn.length===3)submit()},120)
 }
}
function canFinishCurrentTurn(){
 if(!S||!isX()||S.finished||!S.dartsInTurn.length)return false;
 const p=S.players[S.active], ds=S.dartsInTurn;
 let startIdx=0;
 // En Double In, seules les fléchettes à partir du premier double/Bull comptent.
 if(S.doubleIn&&!p.started){
   const idx=ds.findIndex(d=>d.m===2||d.m===25);
   if(idx<0)return false;
   startIdx=idx;
 }
 const counted=ds.slice(startIdx).reduce((a,d)=>a+dartValue(d),0);
 const after=p.score-counted;
 if(after!==0)return false;
 // Le type de sortie doit être respecté sur LA fléchette qui fait passer à 0.
 // Comme cette fonction est appelée après chaque fléchette, c'est la dernière saisie.
 if(S.finish==='single')return true;
 const last=ds[ds.length-1];
 return !!last&&(last.m===2||last.m===25);
}
function undo(){if(!undoStack.length){toast('Rien à annuler');return}S=JSON.parse(undoStack.pop());save();render();toast('Dernière volée annulée')}
function clearTurn(){if(!S)return;if(S.dartsInTurn.length){S.dartsInTurn=[];save();render();toast('Volée en cours effacée');return}undo()}
function log(t){if(!S)return;S.log.unshift(t);S.log=S.log.slice(0,250);save();renderLogOnly()}
function renderLogOnly(){if($('#log'))$('#log').innerHTML=S.log.map(x=>`<div>${escapeHtml(x)}</div>`).join('')}
function submit(){if(!S||S.finished||!S.dartsInTurn.length)return false;pushUndo();const p=S.players[S.active],ds=S.dartsInTurn.slice(),total=ds.reduce((a,d)=>a+dartValue(d),0);p.darts+=ds.length;p.turns++;p.total+=total;p.highestTurn=Math.max(p.highestTurn,total);if(isX())playX01(p,ds,total);else if(S.type==='cricket')playCricket(p,ds);else if(S.type==='shanghai')playShanghai(p,ds,total);else playTraining(p,ds,total);S.dartsInTurn=[];if(!S.finished)S.active=(S.active+1)%S.players.length;save();render();return true}
function oneDartFinish(score){return score>=2&&score<=40&&score%2===0}
function playX01(p,ds,total){
 const before=p.score;let counted=total;
 if(S.doubleIn&&!p.started){const idx=ds.findIndex(d=>d.m===2||d.m===25);if(idx<0){p.lastTurnScore=0;log(`${p.name} — ${ds.map(d=>d.label).join(' ')} = 0 (Double In non atteint)`);return}p.started=true;counted=ds.slice(idx).reduce((a,d)=>a+dartValue(d),0)}
 const after=before-counted;const last=ds[ds.length-1];const modeFinish=S.finish||finish;const validFinish=modeFinish==='single'||(last&&(last.m===2||last.m===25));const bust=after<0||(modeFinish==='double'&&after===1)||(after===0&&!validFinish);
 const effective=bust?0:counted;const prevIdx=(S.active-1+S.players.length)%S.players.length;const prev=S.players[prevIdx];
 const killerZeroBlocked=effective===0&&prev.score>0&&modeFinish==='double'&&oneDartFinish(prev.score);
 if(isKiller()&&S.players.length>1&&prev!==p&&prev.lastTurnScore!==null&&prev.lastTurnScore===effective&&!killerZeroBlocked){prev.score=S.baseScore;if(S.doubleIn)prev.started=false;log(`💥 KILLER ! ${p.name} fait ${effective} comme ${prev.name} → ${prev.name} revient à ${S.baseScore}`)}
 p.lastTurnScore=effective;
 if(bust){p.busts++;p.score=before;log(`${p.name} — BUST (${counted}) → ${before}`);return}
 p.score=after;log(`${p.name} — ${ds.map(d=>d.label).join(' ')} = ${counted} → ${after}`);if(after===0)winLeg(p)
}
function resetLeg(){S.players.forEach(p=>{p.score=S.baseScore;p.total=0;p.darts=0;p.turns=0;p.busts=0;p.checkouts=0;p.lastTurnScore=null;p.highestTurn=0;if(S.doubleIn)p.started=false});S.target=1;S.round=1;S.starter=(S.starter+1)%S.players.length;S.active=S.starter}
function winLeg(p){p.checkouts++;p.legWins++;log(`🏆 ${p.name} gagne le leg !`);if(p.legWins>=S.legsToWin){p.setWins++;S.players.forEach(x=>x.legWins=0);log(`⭐ ${p.name} gagne le set !`);if(p.setWins>=S.setsToWin){S.finished=true;S.winner=p;finishGame('Victoire');return}}resetLeg();log(`🎯 ${S.players[S.active].name} commence le prochain leg`)}
function playCricket(p,ds){const targets=[15,16,17,18,19,20,25];for(const d of ds){const n=d.m===25?25:d.v;if(!targets.includes(n))continue;const hits=d.m===25?1:d.m,old=p.marks[n],totalHits=old+hits;p.marks[n]=Math.min(3,totalHits);const extra=Math.max(0,totalHits-3);if(extra>0&&S.players.some(o=>o!==p&&o.marks[n]<3))p.score+=extra*n}log(`${p.name} — ${ds.map(d=>d.label).join(' ')} → ${p.score} pts`);const closed=targets.every(n=>p.marks[n]>=3),max=Math.max(...S.players.map(o=>o.score));if(closed&&p.score>=max){S.finished=true;S.winner=p;finishGame('Cricket terminé')}}
function playShanghai(p,ds){const target=S.target,on=ds.filter(d=>d.v===target);p.score+=on.reduce((a,d)=>a+dartValue(d),0);log(`${p.name} — Manche ${target} : ${on.length?on.map(d=>d.label).join(' '):'aucun impact'} → ${p.score}`);const hasS=on.some(d=>d.m===1),hasD=on.some(d=>d.m===2),hasT=on.some(d=>d.m===3);if(hasS&&hasD&&hasT){S.finished=true;S.winner=p;finishGame(`Shanghai sur le ${target}`);return}if(S.active===S.players.length-1){if(S.target===20){S.finished=true;const max=Math.max(...S.players.map(x=>x.score));S.winner=S.players.find(x=>x.score===max);finishGame('Fin des 20 manches');return}S.target++}}
function playTraining(p,ds,total){S.trainingScore+=total;log(`${p.name} — ${ds.map(d=>d.label).join(' ')} = ${total}`);if(!S.trainingTarget)S.trainingTarget=randomTrainingTarget()}
function randomTrainingTarget(){const pool=['T20','T19','T18','T17','T16','T15','D16','D20','Bull'];return pool[Math.floor(Math.random()*pool.length)]}
function finishGame(reason){save();render();$('#winnerTitle').textContent=S.winner?`🏆 ${S.winner.name} gagne !`:'🏆 Partie terminée';const sorted=[...S.players].sort((a,b)=>isX()?(b.setWins-a.setWins||b.legWins-a.legWins||b.score-a.score):(b.score-a.score));$('#resultList').innerHTML=sorted.map((p,i)=>`<div class="result"><span>${i+1}. ${escapeHtml(p.name)}</span><strong>${isX()?`${p.setWins} set · ${p.legWins} leg`:S.type==='cricket'?`${p.score} pts`:`${p.score} pts`}</strong></div>`).join('')+`<div class="muted">${escapeHtml(reason)}</div>`;$('#finishStats').innerHTML=gameSummary();$('#finishModal').classList.remove('hide')}
function gameSummary(){return`<div class="kpis">${S.players.map(p=>`<div class="kpi"><span class="muted">${escapeHtml(p.name)}</span><b>${p.darts?((p.total/p.darts)*3).toFixed(1):'0.0'}/3</b><small class="muted">${p.darts} flèches · ${p.highestTurn} max · ${p.busts} bust</small></div>`).join('')}</div>`}
function closeFinish(){$('#finishModal').classList.add('hide')}
function checkoutRecommendation(score){
 if(!isX()||score<2||score>170)return '';
 const darts=[];
 for(let v=1;v<=20;v++){darts.push({v,m:1,label:`S${v}`,value:v});darts.push({v,m:2,label:`D${v}`,value:v*2});darts.push({v,m:3,label:`T${v}`,value:v*3})}
 darts.push({v:25,m:25,label:'Bull',value:25});
 const candidates=[];
 const add=(arr)=>{const sum=arr.reduce((a,d)=>a+d.value,0);if(sum!==score)return;const last=arr[arr.length-1];if((S.finish||finish)==='double'&&(last.m!==2&&last.m!==25))return;candidates.push(arr)};
 for(const a of darts)add([a]);
 for(const a of darts)for(const b of darts)add([a,b]);
 for(const a of darts)for(const b of darts)for(const c of darts)add([a,b,c]);
 if(!candidates.length)return OUTS[score]||'';
 candidates.sort((a,b)=>{
   const ad16=a.at(-1).label==='D16'?1:0,bd16=b.at(-1).label==='D16'?1:0;
   if(ad16!==bd16)return bd16-ad16;
   if(a.length!==b.length)return a.length-b.length;
   const av=a.reduce((x,d)=>x+d.value,0),bv=b.reduce((x,d)=>x+d.value,0);
   return bv-av;
 });
 return candidates[0].map(d=>d.label).join(' → ');
}
function render(){if(!S)return;showMain();$('#mode').textContent=typeLabel();$('#round').textContent=S.type==='shanghai'?`Manche ${S.target}/20`:S.type==='training'?'Entraînement':`Tour ${S.round}`;$('#activeName').textContent=S.players[S.active]?.name||'';const ap=S.players[S.active];const rec=isX()?(checkoutRecommendation(ap.score)||''):' ';$('#checkout').textContent=rec;$('#target').textContent=S.type==='shanghai'?`Manche ${S.target} — Tout sur le ${S.target}`:isX()?`${S.doubleIn?'Double In · ':''}${S.finish==='double'?'Double Out':'Simple Out'}${isKiller()?' · 🔥 Killer':''}`:S.type==='training'?`Cible : ${S.trainingTarget||randomTrainingTarget()}`:'';$('#activeMeta').textContent=S.type==='shanghai'?`🎯 Tout sur le ${S.target}`:isX()?`${S.doubleIn&&!ap.started?'Double In à faire · ':''}${ap.setWins} set · ${ap.legWins} leg`:'À toi de jouer';$('#scoreStrip').innerHTML=S.players.map((p,i)=>`<div class="score-mini ${i===S.active?'active':''}"><div class="mini-name">${escapeHtml(p.name)}</div><div class="mini-score">${p.score}</div><div class="mini-turn">${i===S.active?'🎯 À toi':''}</div></div>`).join('');if($('#players'))$('#players').innerHTML='';$('#darts').innerHTML=S.dartsInTurn.map((d,i)=>`<span class="chip">${i+1}. ${d.label}</span>`).join('');$('#log').innerHTML=S.log.map(x=>`<div>${escapeHtml(x)}</div>`).join('');$('#hint').innerHTML=hint();$('#undo').disabled=!undoStack.length;renderStats();save()}
function cricketMarks(p){return`<div class="marks">${[20,19,18,17,16,15,25].map(n=>`<div class="mark"><b>${n===25?'B':n}</b><div class="hits">${p.marks[n]>=3?'✕✕✕':p.marks[n]===2?'✕✕':p.marks[n]===1?'✕':'·'}</div></div>`).join('')}</div>`}
function hint(){if(isX()){if(S.doubleIn&&!S.players[S.active].started)return`🎯 Double In : les fléchettes avant le premier double/Bull sont perdues. Dès le double touché, les suivantes comptent. · Passage automatique après 3 fléchettes.`;return isKiller()?`🔥 Killer : si le joueur suivant fait exactement ${S.players[S.active].lastTurnScore??'le même score'}, son adversaire revient à ${S.baseScore}.`: `Checkout conseillé : ${checkoutRecommendation(S.players[S.active].score)||'—'} · Passage automatique après 3 fléchettes.`}if(S.type==='cricket')return'Ferme 15, 16, 17, 18, 19, 20 et Bull avec 3 marques. Les points supplémentaires comptent tant qu’un adversaire n’a pas fermé la cible.';if(S.type==='shanghai')return`Manche ${S.target} – Tout sur le ${S.target}. Shanghai = simple + double + triple dans la même volée.`;return`🎯 Cible ${S.trainingTarget||'—'} · travaille la régularité et les checkouts.`}
function renderStats(){const ps=S.players,totalD=ps.reduce((a,p)=>a+p.darts,0),totalT=ps.reduce((a,p)=>a+p.turns,0),points=ps.reduce((a,p)=>a+p.total,0),best=Math.max(...ps.map(p=>p.darts?(p.total/p.darts)*3:0));$('#kpis').innerHTML=`<div class="kpi"><span class="muted">Volées</span><b>${totalT}</b></div><div class="kpi"><span class="muted">Fléchettes</span><b>${totalD}</b></div><div class="kpi"><span class="muted">Points lancés</span><b>${points}</b></div><div class="kpi"><span class="muted">Meilleure moyenne</span><b>${best.toFixed(1)}</b></div>`;$('#statTable').innerHTML=`<table class="table"><thead><tr><th>Joueur</th><th>Moy./3</th><th>Flèches</th><th>Volées</th><th>Max</th><th>Bust</th><th>Checkouts</th></tr></thead><tbody>${ps.map(p=>`<tr><td>${escapeHtml(p.name)}</td><td>${p.darts?((p.total/p.darts)*3).toFixed(1):'0.0'}</td><td>${p.darts}</td><td>${p.turns}</td><td>${p.highestTurn}</td><td>${p.busts}</td><td>${p.checkouts}</td></tr>`).join('')}</tbody></table>`}
function toast(t){const el=$('#toast');el.textContent=t;el.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>el.style.display='none',1900)}
function exportGame(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));a.download=`darts-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href)}
function init(){renderSetup();if(S&&!S.finished){$('#resumeGame').classList.remove('hide');$('#resumeGame').onclick=()=>{showMain();render()}}}
$('#gameTypes').onclick=e=>{const b=e.target.closest('[data-type]');if(!b)return;setupType=b.dataset.type;renderSetup()};$('#addPlayer').onclick=()=>addPlayerRow('');$('#playerEditor').onclick=e=>{if(e.target.matches('button'))refreshPlaceholders()};
$$('[data-finish]').forEach(b=>b.onclick=()=>{$$('[data-finish]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');finish=b.dataset.finish});
$$('[data-in]').forEach(b=>b.onclick=()=>{$$('[data-in]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');$('#doubleIn').classList.toggle('selected',b.dataset.in==='double');$('#straightIn').classList.toggle('selected',b.dataset.in==='straight');});
$$('[data-in]').forEach(b=>b.onclick=()=>{$$('[data-in]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')});
$$('[data-mode]').forEach(b=>b.onclick=()=>{playerMode=b.dataset.mode;$$('[data-mode]').forEach(x=>x.classList.toggle('selected',x.dataset.mode===playerMode));renderSetup()});
$('#startGame').onclick=()=>{let names=selectedNames();if(soloSelected())names=names.slice(0,1);if(!names.length){toast('Ajoute au moins 1 joueur');return}if(!soloSelected()&&names.length<2){toast('Ajoute au moins 2 joueurs ou choisis Jeu solo');return}newState(setupType,names)};
$('#newFromGame').onclick=showSetup;$('#again').onclick=()=>{const names=S.players.map(p=>p.name),type=S.type;closeFinish();newState(type,names)};$('#changeGame').onclick=showSetup;$('#clear').onclick=clearTurn;$('#undo').onclick=undo;
$('#nums').addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b)addDart(+b.dataset.v)});$('#mult').addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b)return;$$('#mult [data-m]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');mult=+b.dataset.m});
$$('[data-tab]').forEach(b=>b.onclick=()=>{$$('[data-tab]').forEach(x=>x.classList.remove('active'));b.classList.add('active');['game','stats','settings'].forEach(x=>$('#'+x).classList.toggle('hide',x!==b.dataset.tab))});
$('#export').onclick=exportGame;$('#resetData').onclick=()=>{if(confirm('Supprimer la partie sauvegardée ?')){localStorage.removeItem('dartsScoreV14');S=null;location.reload()}};
$('#nums').innerHTML=Array.from({length:20},(_,i)=>`<button data-v="${i+1}">${i+1}</button>`).join('')+'<button data-v="25">25</button><button data-v="0">Miss</button>';
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;$('#install').classList.remove('hide')});$('#install').onclick=async()=>{if(deferred){deferred.prompt();deferred=null}};if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});init();
