function optionsFor(t){const pool=filteredTerms().filter(x=>x.term!==t.term),fallback=TERMS.filter(x=>x.term!==t.term&&!pool.includes(x));return shuffle([t.term,...shuffle([...pool,...fallback]).slice(0,3).map(x=>x.term)])}
function startQuick(n=5){setActivity(true);session=buildSession(n);qIndex=0;renderQuick()}
function renderQuick(){
 locked=false;if(qIndex>=session.length)return renderSessionDone("Daily Practice");const t=session[qIndex],opts=optionsFor(t);
 document.getElementById("app").innerHTML=`<div class="toolbar"><span class="kicker">Daily Practice</span><div class="spacer"></div><span class="small">${qIndex+1} of ${session.length}</span></div><section class="card"><div class="bigprompt">${esc(t.scenario)}</div><div class="choices">${opts.map(o=>`<button class="choice" data-choice="${esc(o)}" onclick="answerQuick(this,this.dataset.choice)">${esc(o)}</button>`).join("")}</div><div id="qfeedback" aria-live="polite"></div></section>`;
}
function answerQuick(btn,choice){
 if(locked)return;locked=true;const t=session[qIndex],ok=choice===t.term;update(t,ok,"retrieval");
 document.querySelectorAll(".choice").forEach(b=>{if(b.textContent===t.term)b.classList.add("correct")});if(!ok)btn.classList.add("wrong");
 document.getElementById("qfeedback").innerHTML=`<div class="feedback"><b>${ok?"Correct.":"Not yet."}</b> ${esc(t.plain)}<br><span class="small">${esc(t.confused_note)}</span></div><div class="toolbar" style="margin-top:12px"><div class="spacer"></div><button class="btn primary" onclick="qIndex++;renderQuick()">${qIndex===session.length-1?"Finish":"Next"}</button></div>`
}

function startScenario(n=5){setActivity(true);session=buildSession(n);qIndex=0;renderScenario()}
function renderScenario(){
 locked=false;if(qIndex>=session.length)return renderSessionDone("Scenario");const t=session[qIndex],opts=optionsFor(t);
 document.getElementById("app").innerHTML=`<div class="toolbar"><span class="kicker">Scenario</span><div class="spacer"></div><span class="small">${qIndex+1} of ${session.length}</span></div><section class="card"><div class="bigprompt">${esc(t.scenario)}</div><div class="choices">${opts.map(o=>`<button class="choice" data-choice="${esc(o)}" onclick="answerScenario(this,this.dataset.choice)">${esc(o)}</button>`).join("")}</div><div id="qfeedback" aria-live="polite"></div></section>`;
}
function answerScenario(btn,choice){
 if(locked)return;locked=true;const t=session[qIndex],ok=choice===t.term;update(t,ok,"retrieval");
 document.querySelectorAll(".choice").forEach(b=>{if(b.textContent===t.term)b.classList.add("correct")});if(!ok)btn.classList.add("wrong");
 document.getElementById("qfeedback").innerHTML=`<div class="feedback"><b>${ok?"Correct.":"Correction:"}</b> ${esc(t.term)} — ${esc(t.plain)}<br><span class="small">Technician connection: ${esc(t.example)}</span></div><div class="toolbar" style="margin-top:12px"><div class="spacer"></div><button class="btn primary" onclick="qIndex++;renderScenario()">${qIndex===session.length-1?"Finish":"Next"}</button></div>`
}

function startExplain(n=5){setActivity(true);session=buildSession(n);qIndex=0;renderExplain()}
function renderExplain(){
 if(qIndex>=session.length)return renderSessionDone("Explain It");const t=session[qIndex];
 document.getElementById("app").innerHTML=`<div class="toolbar"><span class="kicker">Explain it like a technician</span><div class="spacer"></div><span class="small">${qIndex+1} of ${session.length}</span></div><section class="card"><div class="term" style="font-size:clamp(2rem,6vw,3.5rem)">${esc(t.term)}</div><div class="expansion">${esc(t.expansion||"Technical term")}</div><p class="prompt">Explain this in one or two sentences to a new technician. Include <b>what it means</b> and <b>why it matters during the job</b>.</p><label class="input-label" for="explainText">Your explanation</label><textarea id="explainText" placeholder="Type your explanation here..."></textarea><div class="toolbar" style="margin-top:12px"><button class="btn primary" onclick="revealExplain()">Compare with TechSpeak</button></div><div id="explainFeedback" aria-live="polite"></div></section>`;
}
function revealExplain(){
 const t=session[qIndex],written=(document.getElementById("explainText").value||"").trim();
 if(written.length<12){document.getElementById("explainFeedback").innerHTML=`<div class="feedback">Write a little more before comparing. Try to include both meaning and why it matters.</div>`;return}
 document.getElementById("explainFeedback").innerHTML=`<div class="feedback"><b>TechSpeak version:</b> ${esc(t.plain)}<br><br><b>Work connection:</b> ${esc(t.example)}<br><br><span class="small">Your wording does not need to match. Ask: Did I explain the meaning and why a technician cares?</span></div><div class="toolbar" style="margin-top:12px"><button class="btn bad" onclick="rateExplain(false)">Needs another rep</button><button class="btn good" onclick="rateExplain(true)">Accurate enough</button></div>`
}
function rateExplain(ok){update(session[qIndex],ok,"explain");qIndex++;renderExplain()}

function renderShowdown(){
 setActivity(true);const s=SHOWDOWNS[Math.floor(Math.random()*SHOWDOWNS.length)],a=TERMS.find(t=>t.term===s.a),b=TERMS.find(t=>t.term===s.b);
 document.getElementById("app").innerHTML=`<div class="toolbar"><span class="kicker">TechSpeak Showdown</span><div class="spacer"></div><button class="btn" onclick="renderShowdown()">New matchup</button></div><div class="showdown"><div class="side"><h3>${esc(a.term)}</h3><p>${esc(a.plain)}</p><div class="small">${esc(a.example)}</div></div><div class="versus">VS</div><div class="side"><h3>${esc(b.term)}</h3><p>${esc(b.plain)}</p><div class="small">${esc(b.example)}</div></div></div><div class="feedback"><b>The distinction:</b> ${esc(s.d)}</div><div class="toolbar" style="margin-top:14px"><button class="btn ghost" onclick="showLanding()">Back home</button></div>`
}
function renderSessionDone(label){
 document.getElementById("app").innerHTML=`<section class="card"><div class="kicker">${esc(label)} complete</div><div class="term" style="font-size:2.3rem">Good reps.</div><p class="prompt">Lower-level terms will continue to return more often. Apply is earned through repeated retrieval; Connect is reserved for future multi-term or instructor-verified work.</p><div class="toolbar"><button class="btn primary" onclick="showLanding()">Back home</button><button class="btn" onclick="renderMastery()">View Mastery Map</button></div></section>`
}

function renderMastery(){
 setActivity(true);const pool=filteredTerms(),rows=[...pool].sort((a,b)=>mastery(a)-mastery(b)).map(t=>{const pct=mastery(t)/4*100;return `<div class="mastery-row"><b>${esc(t.term)}</b><div class="progress"><div class="bar" style="width:${pct}%"></div></div><div class="level">${LEVELS[mastery(t)]}</div></div>`}).join("");
 document.getElementById("app").innerHTML=`<div class="toolbar"><span class="kicker">Mastery Map • ${esc(CATS[config.cat])}</span><div class="spacer"></div><button class="btn" onclick="exportProgress()">Export progress</button></div><p class="small">Learn can establish Recognize, Explain It can establish Explain, and repeated objective retrieval can establish Apply. Connect will require a later multi-term or instructor-verified challenge.</p><div class="mastery-list">${rows}</div><div class="toolbar" style="margin-top:16px"><button class="btn ghost" onclick="showLanding()">Back home</button><div class="spacer"></div><button class="btn ghost" onclick="resetProgress()">Reset this profile</button></div>`
}
function exportProgress(){
 const now=new Date().toISOString();let lines=["Student,Set,Focus,Term,Mastery Level,Level Number,Attempts,Correct,Exported"];
 filteredTerms().forEach(t=>lines.push([currentProfile,"OC39",CATS[config.cat],t.term,LEVELS[mastery(t)],mastery(t),state.attempts,state.correct,now].map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")));
 const blob=new Blob([lines.join("\n")],{type:"text/csv"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`TechSpeak_${(currentProfile||"student").replace(/\W+/g,"_")}_OC39_Progress.csv`;a.click();URL.revokeObjectURL(a.href)
}
function resetProgress(){if(confirm("Reset TechSpeak progress for "+(currentProfile||"this profile")+" on this device?")){state={mastery:{},attempts:0,correct:0};saveState();renderMastery()}}

function showTeacher(){
 setActivity(false);
 document.getElementById("app").innerHTML=`<div class="toolbar"><div><div class="kicker">Instructor setup</div><h2 style="margin:5px 0">Create today's launch code</h2></div><div class="spacer"></div><button class="btn ghost" onclick="showLanding()">Student home</button></div>
 <p class="small">Choose one focus and a short practice. Students type the generated code into their own copy of TechSpeak.</p>
 <div class="setup">
  <div class="field"><label for="tCat">Vocabulary focus</label><select id="tCat">${Object.entries(CATS).map(([k,v])=>`<option value="${k}" ${config.cat===k?"selected":""}>${esc(v)}</option>`).join("")}</select></div>
  <div class="field"><label for="tMode">Practice mode</label><select id="tMode"><option value="Q" ${config.mode==="Q"?"selected":""}>Daily Practice</option><option value="S" ${config.mode==="S"?"selected":""}>Scenario</option><option value="L" ${config.mode==="L"?"selected":""}>Learn</option><option value="E" ${config.mode==="E"?"selected":""}>Explain It</option></select></div>
  <div class="field"><label for="tCount">Session length</label><select id="tCount"><option value="5" ${config.count===5?"selected":""}>5 reps</option><option value="10" ${config.count===10?"selected":""}>10 reps</option></select></div>
  <div class="field"><label>Current set</label><input value="OC39 • Tools, Safety, and Bench Procedures" disabled></div>
 </div>
 <div class="toolbar" style="margin-top:16px"><button class="btn primary" onclick="saveTeacher()">Generate code</button></div><div id="teacherCode" aria-live="polite"></div>
 <div class="notice" style="margin-top:16px"><b>Pilot limitation:</b> launch codes configure practice only. Student progress stays on each device unless the student exports it.</div>`
}
function saveTeacher(){
 config.cat=document.getElementById("tCat").value;config.mode=document.getElementById("tMode").value;config.count=Number(document.getElementById("tCount").value);localStorage.setItem("techspeak_v021_config",JSON.stringify(config));
 document.getElementById("teacherCode").innerHTML=`<div class="small" style="margin:12px 0 6px">Give students this code:</div><div class="codebox">${launchCode()}</div><div class="small" style="margin-top:8px">${esc(CATS[config.cat])} • ${MODE_LABEL[config.mode]} • ${config.count} reps</div>`
}
updateProfilePill();showLanding();
