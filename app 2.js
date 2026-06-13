const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const storeKey = 'gieokhae.v5.records';
const prefKey = 'gieokhae.v5.prefs';
const quotes = [
  ['행복은 당신의 경험이 아닌 당신의 기억이다.', '오스카 레반트'],
  ['신은 우리에게 추억을 주셨기에, 우리는 한겨울에도 장미를 품을 수 있다.', 'J.M. 배리'],
  ['과거의 향기는 라일락 꽃밭보다 향기가 진하다.', '프란츠 투생'],
  ['오늘의 특별한 순간들은 내일의 추억들이다.', '알라딘'],
  ['끝났다고 슬퍼하지 마라. 그냥 그런 일이 일어났다는 것에 미소 지어라.', '닥터 수스'],
  ['추억은 우리가 절대 추방당할 수 없는 유일한 지상낙원이다.', '장 파울'],
  ['그래, 인생은 단 한 번의 추억여행이야.', '김정한'],
  ['사진은 영원히 지나간 순간을, 다시 올 수 없는 순간을 남겨준다. 그게 내가 사진을 좋아하는 이유이다.', '칼 라거펠트'],
  ['네 재산을 유형의 것에 쓰지 마라. 대신 경험과 같은 무형의 것에 써서, 언젠가 추억이 될 수 있도록 하라.', '예레미야 서'],
  ['과거의 눈물을 돌아보는 것이 나에게 웃음을 줄 수 있다는 것은 알았지만, 과거의 웃음을 돌아보는 것이 나에게 눈물을 줄 수 있다는 것은 알지 못했다.', '캣 스티븐스'],
  ['청춘은 일시적인 소유일 뿐, 나머지 인생은 그것을 추억하는 시간이라네.', '앙드레 지드'],
  ['어쩌면 앞으로 이런 시간은 두 번 다시 오지 않을 것이다. 소중한 것들은 그리 오래 머물지 않는다.', '황선미, 마당을 나온 암탉'],
  ['간직할 것이라고는 기억밖에 없으니까.', '황선미, 마당을 나온 암탉'],
  ['사람들의 좋은 회상 속에 자주 있는 자가 가장 위대하다.', '미상'],
  ['언젠가 당신도 누군가의 추억이 될 테니, 좋은 추억이 되기 위해 노력하라.', '미상'],
  ['단지 사진기로 사진만 찍지 말고, 당신의 마음으로 추억을 찍어라.', '미상']
];
const moods = [
  ['happy','기쁨'],['smile','좋음'],['love','설렘'],['kiss','애정'],['tired','피곤'],['sad','차분'],['angry','답답'],['yawn','졸림'],['calm','편안']
];
const themes = [
  ['paper','종이','따뜻한 기록장',['#f6f2ea','#fffdf9','#8a755b']],
  ['milk','밀크','가장 단정한 기본',['#f7f7f5','#ffffff','#6f6f6f']],
  ['polaroid','폴라로이드','사진이 제일 잘 보이는 톤',['#f4f1eb','#fffaf2','#92795c']],
  ['dawn','새벽','은은한 분홍빛 기억',['#f7f0ef','#fffafa','#a06f69']]
];
let records = JSON.parse(localStorage.getItem(storeKey) || '{}');
let prefs = JSON.parse(localStorage.getItem(prefKey) || '{}');
let currentDate = new Date();
let selectedMood = prefs.mood || 'smile';
let selectedPhotos = [];

function saveRecords(){ localStorage.setItem(storeKey, JSON.stringify(records)); }
function savePrefs(){ localStorage.setItem(prefKey, JSON.stringify(prefs)); }
function ymd(d){ const z=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}`; }
function niceDate(v){ const d = new Date(v+'T00:00:00'); return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`; }
function room(){ return (prefs.room || '개인 앨범').trim() || '개인 앨범'; }
function activeRecords(){ return Object.values(records).filter(r => (r.room || '개인 앨범') === room()).sort((a,b)=>b.date.localeCompare(a.date)); }
function renderQuote(){
  const text = $('#homeQuote');
  const author = $('#homeQuoteAuthor');
  if(!text || !author) return;
  const index = Math.floor(Date.now() / (4 * 60 * 60 * 1000)) % quotes.length;
  text.textContent = `“${quotes[index][0]}”`;
  author.textContent = `— ${quotes[index][1]}`;
}

function applyTheme(name=prefs.theme || 'polaroid'){ document.documentElement.dataset.theme = name; prefs.theme = name; savePrefs(); renderThemes(); }

function init(){
  $('#dateInput').value = ymd(new Date());
  $('#todayText').textContent = niceDate(ymd(new Date()));
  $('#roomLabel').textContent = room();
  $('#roomInput').value = prefs.room || '';
  renderMoods(); renderQuote(); applyTheme(prefs.theme || 'polaroid'); bind(); loadForDate($('#dateInput').value); renderCalendar(); renderSearch();
}

function bind(){
  $$('.tab').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.target)));
  $('#themeBtn').addEventListener('click', () => switchView('settings'));
  $('#dateInput').addEventListener('change', e => loadForDate(e.target.value));
  $('#photoInput').addEventListener('change', handlePhotos);
  $('#memoryForm').addEventListener('submit', saveMemory);
  $('#prevMonth').addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth()-1); renderCalendar(); });
  $('#nextMonth').addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth()+1); renderCalendar(); });
  $('#saveRoomBtn').addEventListener('click', () => { prefs.room = $('#roomInput').value.trim() || '개인 앨범'; savePrefs(); $('#roomLabel').textContent = room(); renderCalendar(); renderSearch(); toast('앨범 코드가 적용됐습니다.'); });
  $('#searchInput').addEventListener('input', renderSearch);
}
function switchView(name){
  $$('.tab').forEach(t=>t.classList.toggle('active', t.dataset.target===name));
  $$('.view').forEach(v=>{ v.classList.remove('active'); if(v.dataset.view===name) requestAnimationFrame(()=>v.classList.add('active')); });
  if(name==='calendar') renderCalendar();
  if(name==='shared') renderSearch();
}

function renderMoods(){
  $('#moodGrid').innerHTML = moods.map(([id,label]) => `<button type="button" class="mood-btn ${id===selectedMood?'active':''}" data-mood="${id}" title="${label}"><img src="assets/mood-${id}.png" alt="${label}"></button>`).join('');
  $$('.mood-btn').forEach(b=>b.addEventListener('click',()=>{selectedMood=b.dataset.mood; prefs.mood=selectedMood; savePrefs(); renderMoods();}));
}
function renderThemes(){
  const host = $('#themeList'); if(!host) return;
  host.innerHTML = themes.map(([id,name,desc,colors]) => `<button type="button" class="theme-card" data-theme-id="${id}"><span><b>${name}</b><br><small>${desc}</small></span><span class="swatches">${colors.map(c=>`<i style="background:${c}"></i>`).join('')}</span></button>`).join('');
  $$('.theme-card').forEach(b => b.addEventListener('click',()=>applyTheme(b.dataset.themeId)));
}

function handlePhotos(e){
  const files = [...e.target.files].slice(0,3);
  selectedPhotos = [];
  if([...e.target.files].length > 3) toast('사진은 최대 3장까지 저장할 수 있습니다.');
  if(files.length === 0){ renderPhotoPreview(); return; }
  let done = 0;
  files.forEach(file=>{
    const reader = new FileReader();
    reader.onload = () => { selectedPhotos.push(reader.result); done++; if(done===files.length) renderPhotoPreview(); };
    reader.readAsDataURL(file);
  });
}
function renderPhotoPreview(){
  const host = $('#photoPreview');
  if(!selectedPhotos.length){ host.className='photo-preview empty'; host.textContent='사진을 선택하면 여기에 표시됩니다.'; return; }
  host.className='photo-preview'; host.innerHTML = selectedPhotos.map(src=>`<img src="${src}" alt="선택한 사진">`).join('');
}
function loadForDate(date){
  const r = records[`${room()}::${date}`];
  $('#menuInput').value = r?.menu || '';
  $('#noteInput').value = r?.note || '';
  selectedMood = r?.mood || prefs.mood || 'smile';
  selectedPhotos = r?.photos ? [...r.photos] : [];
  renderMoods(); renderPhotoPreview(); $('#formHint').textContent = r ? '저장된 기록을 수정하고 있습니다.' : '';
}
function saveMemory(e){
  e.preventDefault();
  const date = $('#dateInput').value;
  if(!selectedPhotos.length){ toast('사진을 1장 이상 선택해 주세요.'); return; }
  const rec = { date, room: room(), photos:selectedPhotos.slice(0,3), menu:$('#menuInput').value.trim(), note:$('#noteInput').value.trim(), mood:selectedMood, updatedAt:Date.now() };
  records[`${rec.room}::${date}`] = rec; saveRecords(); toast('저장되었습니다.'); renderCalendar(); renderSearch();
}

function renderCalendar(){
  const year=currentDate.getFullYear(), month=currentDate.getMonth();
  $('#monthTitle').textContent = `${year}년 ${month+1}월`;
  const first=new Date(year,month,1), start=new Date(year,month,1-first.getDay());
  const today=ymd(new Date());
  let html='';
  for(let i=0;i<42;i++){
    const d=new Date(start); d.setDate(start.getDate()+i); const key=ymd(d); const rec=records[`${room()}::${key}`];
    html += `<button class="day ${d.getMonth()!==month?'other':''} ${key===today?'today':''}" data-date="${key}"><span class="day-num">${d.getDate()}</span>${rec?.photos?.[0]?`<img class="day-thumb" src="${rec.photos[0]}" alt="${key} 대표 사진">`:`<span class="day-dot" style="opacity:${rec?1:0}"></span>`}</button>`;
  }
  $('#calendarGrid').innerHTML=html;
  $$('.day').forEach(b=>b.addEventListener('click',()=>showDay(b.dataset.date,b)));
}
function showDay(date, btn){
  $$('.day').forEach(d=>d.classList.remove('selected')); btn?.classList.add('selected');
  const rec=records[`${room()}::${date}`];
  const host=$('#dayDetail');
  if(!rec){ host.className='card detail-card muted-detail'; host.textContent=`${niceDate(date)}에는 아직 기록이 없습니다.`; return; }
  const moodLabel = moods.find(m=>m[0]===rec.mood)?.[1] || '기록';
  host.className='card detail-card';
  host.innerHTML = `<h2>${niceDate(date)}</h2><div class="detail-photos">${rec.photos.map(p=>`<img src="${p}" alt="기록 사진">`).join('')}</div><div class="detail-meta">${rec.menu?`<span class="pill">메뉴 · ${escapeHtml(rec.menu)}</span>`:''}<span class="pill">${moodLabel}</span></div>${rec.note?`<p style="margin-top:14px;line-height:1.65">${escapeHtml(rec.note)}</p>`:''}`;
}
function renderSearch(){
  const q=($('#searchInput')?.value || '').trim().toLowerCase(); const list=activeRecords().filter(r=>!q || `${r.date} ${r.menu} ${r.note}`.toLowerCase().includes(q));
  const host=$('#searchResults'); if(!host) return;
  host.innerHTML = list.length ? list.map(r=>`<button class="result-item" data-date="${r.date}"><img src="${r.photos[0]}" alt="대표 사진"><span><b>${niceDate(r.date)}</b><p>${escapeHtml(r.menu || r.note || '기록된 사진')}</p></span></button>`).join('') : '<p class="hint">검색 결과가 없습니다.</p>';
  $$('.result-item').forEach(b=>b.addEventListener('click',()=>{ currentDate=new Date(b.dataset.date+'T00:00:00'); switchView('calendar'); setTimeout(()=>{renderCalendar(); const day=$(`.day[data-date="${b.dataset.date}"]`); day?.click();},50); }));
}
function toast(msg){ const h=$('#formHint') || document.body; h.textContent=msg; setTimeout(()=>{ if(h.textContent===msg) h.textContent=''; },2400); }
function escapeHtml(s=''){ return s.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
init();
