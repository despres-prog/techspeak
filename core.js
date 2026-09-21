const LEVELS = ["New","Recognize","Explain","Apply","Connect"];
const CATS = {"ALL":"All OC39 terms","SAF":"Safety","HWD":"Hardware","TRB":"Troubleshooting","DOC":"Documentation","PRO":"Professional Practice","BEN":"Bench Skills"};
const MODE_LABEL = {"Q":"Daily Practice","S":"Scenario","L":"Learn","E":"Explain It"};
const SHOWDOWNS = [
 {a:"Baseline",b:"Validation",d:"Baseline is the before-service reference. Validation is the after-service check against that reference."},
 {a:"POST",b:"Pre-Power Inspection",d:"Pre-power inspection happens before electricity is reapplied. POST happens after power-on and checks startup hardware."},
 {a:"RAM",b:"Storage Device",d:"RAM is temporary working memory. Storage retains data when power is removed."},
 {a:"SWO",b:"Closure Note",d:"The SWO is the full service record. The closure note is the concise final outcome recorded inside that service documentation."}
];
const DEFAULT_CONFIG={set:"OC39",cat:"ALL",mode:"Q",count:5};
let config=JSON.parse(localStorage.getItem("techspeak_v021_config")||JSON.stringify(DEFAULT_CONFIG));
let currentProfile=localStorage.getItem("techspeak_v021_current_profile")||"";
let state=loadState();
let index=0,session=[],qIndex=0,locked=false;

function keyForProfile(){return "techspeak_v021_profile_"+(currentProfile||"guest").toLowerCase().replace(/[^a-z0-9_-]/g,"_")}
function loadState(){try{return JSON.parse(localStorage.getItem(keyForProfile())||'{"mastery":{},"attempts":0,"correct":0}')}catch(e){return {mastery:{},attempts:0,correct:0}}}
function saveState(){localStorage.setItem(keyForProfile(),JSON.stringify(state));updateProfilePill()}
function mastery(t){return Number(state.mastery[t.term]||0)}
function update(t,ok,source){
 state.attempts++;
 if(ok)state.correct++;
 let m=mastery(t);
 if(!ok){state.mastery[t.term]=Math.max(0,m-1)}
 else if(source==="learn"){state.mastery[t.term]=Math.max(m,1)}
 else if(source==="explain"){state.mastery[t.term]=Math.max(m,2)}
 else {state.mastery[t.term]=Math.min(3,m+1)}
 saveState()
}
function updateProfilePill(){
 document.getElementById("profilePill").textContent=currentProfile?currentProfile+" • local":"No profile";
 document.getElementById("switchBtn").classList.toggle("hidden",!currentProfile)
}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function filteredTerms(){if(config.cat==="ALL")return TERMS;const n=CATS[config.cat];return TERMS.filter(t=>t.category===n)}
function weightedPick(pool,avoid=[]){
 const usable=pool.filter(t=>!avoid.includes(t.term));const source=usable.length?usable:pool,bag=[];
 source.forEach(t=>{for(let i=0;i<5-mastery(t);i++)bag.push(t)});
 return bag[Math.floor(Math.random()*bag.length)]
}
function buildSession(n){
 const pool=filteredTerms().length?filteredTerms():TERMS, result=[];let used=[];
 for(let i=0;i<n;i++){
   if(used.length>=pool.length)used=[];
   const avoid=[...used];if(result.length)avoid.push(result[result.length-1].term);
   const t=weightedPick(pool,avoid);result.push(t);used.push(t.term)
 }
 return result
}
function tags(t){return `<div class="meta"><span class="tag">${esc(t.category)}</span><span class="tag">${esc(t.cert)}</span><span class="tag">${LEVELS[mastery(t)]}</span></div>`}
function setActivity(active){document.getElementById("hero").classList.toggle("hidden",active)}
function parseCode(raw){
 const x=(raw||"").trim().toUpperCase().replace(/\s+/g,""),m=x.match(/^39-(ALL|SAF|HWD|TRB|DOC|PRO|BEN)-(Q|S|L|E)(5|10)$/);
 if(!m)return false;config={set:"OC39",cat:m[1],mode:m[2],count:Number(m[3])};localStorage.setItem("techspeak_v021_config",JSON.stringify(config));return true
}
function launchCode(){return `39-${config.cat}-${config.mode}${config.count}`}
function profileStats(){
 const pool=filteredTerms();const solid=pool.filter(t=>mastery(t)>=3).length;const avg=pool.length?pool.reduce((a,t)=>a+mastery(t),0)/(pool.length*4)*100:0;const acc=state.attempts?Math.round(state.correct/state.attempts*100)+"%":"—";return {solid,avg,acc}
}
function setProfile(){
 const v=document.getElementById("profileName").value.trim();if(!v)return;
 currentProfile=v.slice(0,30);localStorage.setItem("techspeak_v021_current_profile",currentProfile);state=loadState();updateProfilePill();showLanding()
}
function switchProfile(){localStorage.removeItem("techspeak_v021_current_profile");currentProfile="";state=loadState();showLanding()}

function showLanding(){
 setActivity(false);updateProfilePill();const p=profileStats();
 document.getElementById("app").innerHTML=`
 <div class="today">
   <div><div class="kicker">Today's focus</div><div style="font-size:1.28rem;font-weight:850;margin-top:4px">${esc(CATS[config.cat])}</div></div>
   <div class="meta" style="margin:0"><span class="tag">${MODE_LABEL[config.mode]}</span><span class="tag">${config.count} reps</span></div>
 </div>
 ${!currentProfile?`
 <div class="notice" style="margin-top:14px"><b>1. Create a local profile.</b> Use a first name, initials, or class ID. Nothing is sent anywhere.</div>
 <div class="code-row"><div style="flex:1"><label class="input-label" for="profileName">Name or initials</label><input id="profileName" autocomplete="off" placeholder="Example: SD"></div><button class="btn primary" style="align-self:end" onclick="setProfile()">Start profile</button></div>`:`
 <div class="code-row"><div style="flex:1"><label class="input-label" for="joinCode">Class code from your instructor</label><input id="joinCode" autocomplete="off" autocapitalize="characters" placeholder="Example: 39-SAF-Q5"></div><button class="btn" style="align-self:end" onclick="applyHomeCode()">Apply code</button></div>
 <div id="homeCodeFeedback" aria-live="polite"></div>
 <button class="launch-primary" aria-label="Start today's practice" onclick="startToday()"><b>⚡ Start Today's Practice</b><span>${MODE_LABEL[config.mode]} • ${config.count} reps • ${esc(CATS[config.cat])}</span></button>`}
 <div class="statsline"><span class="statpill"><strong>${filteredTerms().length}</strong> terms</span><span class="statpill"><strong>${p.solid}</strong> at Apply+</span><span class="statpill"><strong>${state.attempts||0}</strong> attempts</span><span class="statpill"><strong>${p.acc}</strong> accuracy</span></div>
 <div class="progress" style="margin-top:10px"><div class="bar" style="width:${p.avg}%"></div></div>
 ${currentProfile?`
 <div class="section-title">More practice</div>
 <div class="mode-grid">
   <button class="launch" aria-label="Learn terms" onclick="startLearn(5)"><div class="icon" aria-hidden="true">◫</div><b>Learn</b><span>Meaning, examples, and connections.</span></button>
   <button class="launch" aria-label="Practice scenarios" onclick="startScenario(5)"><div class="icon" aria-hidden="true">⌁</div><b>Scenario</b><span>Pick the term that fits the technician situation.</span></button>
   <button class="launch" aria-label="Explain terms" onclick="startExplain(5)"><div class="icon" aria-hidden="true">✦</div><b>Explain It</b><span>Say it in your own technician language.</span></button>
   <button class="launch" aria-label="Compare confusing terms" onclick="renderShowdown()"><div class="icon" aria-hidden="true">VS</div><b>Showdown</b><span>Separate concepts that are easy to mix up.</span></button>
 </div>
 <div class="toolbar" style="margin-top:16px;margin-bottom:0"><button class="btn ghost" onclick="renderMastery()">View Mastery Map</button><div class="spacer"></div></div>`:""}
 <div class="instructor-link"><button class="btn ghost" onclick="showTeacher()">Instructor setup</button></div>`;
}
function applyHomeCode(){
 const ok=parseCode(document.getElementById("joinCode").value);
 document.getElementById("homeCodeFeedback").innerHTML=ok?`<div class="feedback"><b>Code applied.</b> ${esc(CATS[config.cat])} • ${MODE_LABEL[config.mode]} • ${config.count} reps</div>`:`<div class="feedback"><b>Code not recognized.</b> Check it and try again.</div>`;
 if(ok)setTimeout(showLanding,550)
}
function startToday(){
 if(!currentProfile){return}
 if(config.mode==="Q")startQuick(config.count);
 if(config.mode==="S")startScenario(config.count);
 if(config.mode==="L")startLearn(config.count);
 if(config.mode==="E")startExplain(config.count)
}

function startLearn(n=5){setActivity(true);session=buildSession(n);qIndex=0;renderLearn()}
function renderLearn(){
 if(qIndex>=session.length)return renderSessionDone("Learn");
 const t=session[qIndex];
 document.getElementById("app").innerHTML=`<div class="toolbar"><span class="kicker">Learn</span><div class="spacer"></div><span class="small">${qIndex+1} of ${session.length}</span></div>
 <section class="card"><div class="kicker">${esc(t.category)}</div><div class="term">${esc(t.term)}</div><div class="expansion">${esc(t.expansion||"Technical term")}</div>${tags(t)}
 <div class="answerbox"><div class="fact"><b>Plain English:</b> ${esc(t.plain)}</div><div class="fact"><b>At the bench:</b> ${esc(t.example)}</div><div class="fact"><b>Don't confuse it with ${esc(t.confused)}:</b> ${esc(t.confused_note)}</div><div class="fact"><b>Connected terms:</b> ${t.related.map(esc).join(" • ")}</div></div></section>
 <div class="toolbar" style="margin-top:14px"><span class="small">Could you recognize and explain the basic idea without looking?</span><div class="spacer"></div><button class="btn bad" onclick="rateLearn(false)">Need practice</button><button class="btn good" onclick="rateLearn(true)">Yes</button></div>`;
}
function rateLearn(ok){update(session[qIndex],ok,"learn");qIndex++;renderLearn()}

