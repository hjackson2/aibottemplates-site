/* Feedback / suggestion forms + news.json renderer. Static-site safe.
   Backend: Cloudflare Worker in /workspace/aibottemplates/forms-worker (see DEPLOY.md).
   FORMS_ENDPOINT is the ONE place to set the Worker URL. Placeholder until deployed. */
const FORMS_ENDPOINT='https://aibottemplates-forms.aibottemplates.workers.dev';
(()=>{const C=Object.assign({feedbackEndpoint:FORMS_ENDPOINT,turnstileSiteKey:'',site:location.hostname},window.CM_CONFIG||{});
const live=u=>!/PLACEHOLDER|<subdomain>/.test(u);
if(C.turnstileSiteKey){const s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js';s.async=1;document.head.appendChild(s)}
const t0=Date.now();
document.querySelectorAll('form[data-cm]').forEach(f=>{
  if(C.turnstileSiteKey){const d=document.createElement('div');d.className='cf-turnstile';d.dataset.sitekey=C.turnstileSiteKey;f.querySelector('button').before(d)}
  f.addEventListener('submit',async e=>{e.preventDefault();const m=f.querySelector('.cm-msg'),fd=new FormData(f);
    if(fd.get('website')){m.textContent='Thanks!';return}            // honeypot filled = bot; silently drop
    if(Date.now()-t0<3000){m.textContent='Please take a second, then send again.';return} // time trap
    const body=Object.fromEntries(fd);body.kind=f.dataset.cm;body.page=location.pathname;body.site=C.site;body.elapsed_ms=Date.now()-t0;
    const url=C.feedbackEndpoint;
    if(!live(url)){m.textContent='Preview only: this form is not connected yet.';return}
    m.textContent='Sending…';
    try{const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(body)});
      m.textContent=r.ok?'Thanks, got it.':'Something went wrong. Please try again later.';if(r.ok)f.reset()}
    catch{m.textContent='Network error. Please try again later.'}})});
const nb=document.getElementById('cm-news');if(nb){const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 fetch(nb.dataset.src||'news.json',{cache:'no-store'}).then(r=>r.json()).then(d=>{
  const all=(d.items||[...(d.x||[]),...(d.youtube||[])]).slice().sort((a,b)=>(b.date||b.created_at||'').localeCompare(a.date||a.created_at||'')).slice(0,12);
  if(!all.length){nb.innerHTML='<p class="cm-empty">No items yet. Check back soon.</p>';return}
  nb.innerHTML=all.map(i=>`<article class="cm-item">${i.thumbnail?`<img src="${esc(i.thumbnail)}" alt="" loading="lazy" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:10px;margin-bottom:8px">`:`<div aria-hidden="true" style="width:100%;aspect-ratio:16/9;border-radius:10px;margin-bottom:8px;display:flex;align-items:flex-end;padding:14px;box-sizing:border-box;background:linear-gradient(135deg,#3ee6ff 0%,#7b5cff 55%,#ff5ca8 100%);color:#fff;font:700 18px/1.2 system-ui,sans-serif;text-shadow:0 1px 4px #0006"><span><small style="display:block;font-size:11px;opacity:.85;letter-spacing:.08em;text-transform:uppercase">aibottemplates · news</small>${esc(i.source||'')}</span></div>`}<div class="by"><b>${esc(i.source||i.author||'')}</b> · ${esc((i.date||i.created_at||'').slice(0,10))}</div><p>${esc(i.title||i.text||'')}</p><a class="src" href="${esc(i.url)}" rel="noopener nofollow ugc" target="_blank">Read the original →</a></article>`).join('');
  const u=document.getElementById('cm-news-upd');if(u&&d.generated_at)u.textContent='Updated '+new Date(d.generated_at).toLocaleString();
 }).catch(()=>{nb.innerHTML='<p class="cm-empty">News is unavailable right now.</p>'})}})();
