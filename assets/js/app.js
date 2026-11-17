(()=>{'use strict';
const KEY='vyra_phase1_state_v1';
const initial={name:'VYRA Creator',email:'demo@vyra.local',jobs:[]};
let state=load();
function load(){try{return {...initial,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){return {...initial}}}
function save(){localStorage.setItem(KEY,JSON.stringify(state));renderAll()}
function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2600)}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
const pages=['dashboard','text','image','creations','account','admin'];
function go(page){if(!pages.includes(page))page='dashboard';document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page));document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.page===page));document.getElementById('crumb').textContent='Workspace / '+({dashboard:'Dashboard',text:'Text to Video',image:'Image to Video',creations:'My Creations',account:'Account & Credits',admin:'Demo Admin'}[page]);document.getElementById('sidebar').classList.remove('open');window.scrollTo(0,0);if(page==='creations')renderJobs();if(page==='admin')renderAdmin()}
document.addEventListener('click',e=>{const p=e.target.closest('[data-page]');if(p){e.preventDefault();go(p.dataset.page)}});
document.getElementById('menuBtn').addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));
document.getElementById('profileBtn').addEventListener('click',()=>go('account'));
function createJob(type,prompt,extra={}){if(!prompt.trim()){toast('Please enter a prompt first.');return}const job={id:'VY-'+Date.now().toString(36).toUpperCase(),type,prompt:prompt.trim(),status:'Queued',created:new Date().toISOString(),extra};state.jobs.unshift(job);save();openJob(job);simulate(job.id);toast('Demo job added to your queue.')}
function openJob(job){
  const video=document.getElementById('sampleVideo');
  video.pause();
  video.currentTime=0;
  document.getElementById('dialogEyebrow').textContent=job.status==='Completed'?'SAMPLE VIDEO PREVIEW':'DEMO JOB DETAILS';
  document.getElementById('dialogTitle').textContent=job.status==='Completed'?'Sample video player':'Your request is in the studio queue.';
  document.getElementById('dialogJobText').textContent=(job.type==='image'?'Image-to-video request: ':'Text-to-video request: ')+job.prompt;
  document.getElementById('dialogStatus').textContent=job.status;
  document.getElementById('dialogJobId').textContent=job.id;
  const d=document.getElementById('jobDialog');if(!d.open)d.showModal();
}
function simulate(id){const steps=[['Processing',48],['Completed',100]];steps.forEach((step,i)=>setTimeout(()=>{const j=state.jobs.find(x=>x.id===id);if(!j)return;j.status=step[0];save();if(document.getElementById('jobDialog').open){document.getElementById('dialogProgress').style.width=step[1]+'%';document.getElementById('dialogStatus').textContent=step[0]}},(i+1)*2300))}
document.getElementById('closeDialog').addEventListener('click',()=>{document.getElementById('sampleVideo').pause();document.getElementById('jobDialog').close()});
document.getElementById('dialogGoLibrary').addEventListener('click',()=>{document.getElementById('sampleVideo').pause();document.getElementById('jobDialog').close();go('creations')});
const tp=document.getElementById('textPrompt');tp.addEventListener('input',()=>document.getElementById('textCount').textContent=tp.value.length+' / 1200');

document.getElementById('generateText').addEventListener('click',()=>createJob('text',tp.value,{duration:document.getElementById('textDuration').value,style:document.getElementById('textStyle').value,ratio:document.getElementById('textRatio').value,quality:document.getElementById('textQuality').value}));
const ip=document.getElementById('imagePrompt');ip.addEventListener('input',()=>document.getElementById('imageCount').textContent=ip.value.length+' / 800');
let imageData=null;const fileInput=document.getElementById('imageFile');
fileInput.addEventListener('change',()=>{const f=fileInput.files[0];if(!f)return;if(!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>8*1024*1024){toast('Choose a JPG, PNG or WebP image under 8 MB.');fileInput.value='';return}const reader=new FileReader();reader.onload=()=>{imageData=reader.result;document.getElementById('imagePreview').src=imageData;document.getElementById('imagePreviewWrap').hidden=false;document.getElementById('imageSidePreview').innerHTML='<img src="'+imageData+'" alt="Local preview" style="max-width:100%;max-height:190px;border-radius:9px"><small>Local preview only</small>'};reader.readAsDataURL(f)});
document.getElementById('removeImage').addEventListener('click',()=>{imageData=null;fileInput.value='';document.getElementById('imagePreviewWrap').hidden=true;document.getElementById('imageSidePreview').innerHTML='<span>▧</span><b>Image preview</b><small>Your selected image will appear here.</small>'});
document.getElementById('generateImage').addEventListener('click',()=>{if(!imageData){toast('Please choose an image first.');return}createJob('image',ip.value,{duration:document.getElementById('imageDuration').value,ratio:document.getElementById('imageRatio').value,imageName:fileInput.files[0]?.name||'Selected image'})});
function jobHtml(j){return `<article class="job-item"><div class="job-thumb">${j.type==='image'?'▧':'✧'}</div><div class="job-info"><b>${esc(j.prompt)}</b><small>${esc(j.id)} · ${esc(j.type==='image'?'Image to Video':'Text to Video')} · ${new Date(j.created).toLocaleString()}</small></div><span class="status ${j.status==='Completed'?'':'processing'}">${esc(j.status)}</span><div class="job-actions">${j.status==='Completed'?'<button data-sample="'+esc(j.id)+'">Preview info</button>':''}<button data-delete="${esc(j.id)}">Delete</button></div></article>`}
function renderJobs(filter='all'){const list=state.jobs.filter(j=>filter==='all'||(filter==='completed'?j.status==='Completed':j.status==='Processing'||j.status==='Queued'));const html=list.length?list.map(jobHtml).join(''):'<div class="empty-state">No jobs in this view yet.</div>';document.getElementById('allJobs').innerHTML=html}
function renderAll(){document.getElementById('dashJobs').textContent=state.jobs.length;document.getElementById('dashDone').textContent=state.jobs.filter(j=>j.status==='Completed').length;document.getElementById('accountName').textContent=state.name;document.getElementById('accountEmail').textContent=state.email;document.getElementById('displayName').value=state.name;document.getElementById('adminJobs').textContent=state.jobs.length;document.getElementById('adminDone').textContent=state.jobs.filter(j=>j.status==='Completed').length;const recent=state.jobs.slice(0,3);document.getElementById('recentJobs').className=recent.length?'job-list':'job-list empty-state';document.getElementById('recentJobs').innerHTML=recent.length?recent.map(jobHtml).join(''):'No creations yet. Start with a text or image prompt.';document.getElementById('adminActivity').className=state.jobs.length?'job-list':'job-list empty-state';document.getElementById('adminActivity').innerHTML=state.jobs.length?state.jobs.slice(0,8).map(jobHtml).join(''):'No activity yet.'}
document.addEventListener('click',e=>{const del=e.target.closest('[data-delete]');if(del){state.jobs=state.jobs.filter(j=>j.id!==del.dataset.delete);save();renderJobs();toast('Job deleted from local history.')}const sample=e.target.closest('[data-sample]');if(sample)toast('Sample preview placeholder — no video was generated.')});
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderJobs(b.dataset.filter)}));
document.getElementById('clearJobs').addEventListener('click',()=>{if(confirm('Clear all demo generation history?')){state.jobs=[];save();renderJobs();toast('History cleared.')}});
document.getElementById('saveProfile').addEventListener('click',()=>{state.name=document.getElementById('displayName').value.trim()||'VYRA Creator';save();toast('Profile saved locally.')});

renderAll();
})();
