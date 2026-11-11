(() => {
  const root = document.getElementById('prompt-lab');
  root.innerHTML = `<details open><summary>Prompt mixer · manual generation</summary>
  <p>Keep the structural reference fixed. Randomize the execution, then copy the prompt into Nautilus with your reference images attached. This creates prompts only; it does not run a generation.</p>
  <div class="prompt-fields">
  <label>Historical structure / Image 1<input id="pm-old" value="REWARD poster — condensed Tuscan structure, broad slab heads, narrow waists, notches and compact counters"></label>
  <label>Modern execution / Image 2<input id="pm-modern" value="CAFÉ DELLA LUCE — sparse circular modules, clear open spacing and playful terminals"></label>
  <label>Execution direction<select id="pm-mode"><option value="mix">Surprise me</option><option value="pearls">Sparse pearls</option><option value="steps">Rounded steps</option><option value="capsules">Capsule joints</option><option value="tiles">Modular tiles</option></select></label>
  <label>Exactly five glyphs<input id="pm-glyphs" value="H O R n a" spellcheck="false"></label>
  <label>Approved anchor (one of the five)<input id="pm-anchor" maxlength="2" placeholder="e.g. O — only if approved"></label>
  <label>Seed · reuse to repeat a variation<input id="pm-seed" placeholder="Automatically chosen"></label>
  <label class="wide">Approved secondary / Image 3 · optional<input id="pm-approved" placeholder="Describe only reviewed, correct glyphs. Leave empty until a batch is approved."><small>Attach this approved sheet as Image 3. Unchecked gallery results are not automatically references.</small></label>
  <label class="wide">Your extra instructions<textarea id="pm-notes" rows="2" placeholder="e.g. More dramatic terminals; keep lowercase counters open"></textarea></label>
  </div><div class="prompt-actions"><button id="pm-random" class="primary">Randomize prompt</button><button id="pm-repeat">Rebuild from seed</button><button id="pm-copy">Copy prompt</button><button id="pm-download">Download prompt</button></div>
  <p id="prompt-notice" role="status" aria-live="polite"></p><textarea id="prompt-output" aria-label="Editable generated prompt" spellcheck="false"></textarea>
  <details><summary>Recent prompts · saved in this browser</summary><div id="prompt-history"></div><button id="pm-clear">Clear history</button></details></details>`;
  const el = id => document.getElementById(id);
  const ids = ['old','modern','mode','glyphs','anchor','seed','approved','notes'];
  const key = 'type-lab-prompt-mixer-v1';
  let history = [];
  try { const saved=JSON.parse(localStorage.getItem(key)||'{}'); history=saved.history||[]; ids.forEach(id=>{if(saved.fields?.[id]!==undefined)el('pm-'+id).value=saved.fields[id]}); } catch {}
  const fields=()=>Object.fromEntries(ids.map(id=>[id,el('pm-'+id).value.trim()]));
  const notice=text=>el('prompt-notice').textContent=text;
  function persist(){try{localStorage.setItem(key,JSON.stringify({fields:fields(),history}));}catch{notice('Browser storage unavailable. Copy or download this prompt to keep it.');}}
  function drawHistory(){el('prompt-history').replaceChildren();history.forEach(item=>{const b=document.createElement('button');b.textContent=item.label;b.onclick=()=>{ids.forEach(id=>el('pm-'+id).value=item.fields[id]||'');el('prompt-output').value=item.prompt;persist();notice('Restored saved prompt.');};el('prompt-history').append(b);});}
  function rng(seed){let n=2166136261;for(const c of seed)n=Math.imul(n^c.charCodeAt(0),16777619);return()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
  const styles={
    pearls:['Use sparse, separated circular modules. Build heavy areas with larger circles and fine joins with smaller circles. Use one or two deliberate chains rather than filling the outline with a dot texture.','Use a measured large–small pearl cadence following the actual stroke skeleton. Keep every circle distinct and apply the same cadence to straight, curved and diagonal strokes.'],
    steps:['Use a few connected rounded-step modules per stroke, with a consistent step interval and corner radius. Carry this construction through stems, diagonals, bowls, serifs and lowercase joins.','Use broad rounded blocks joined by short narrow bridges. Let the stepped silhouette express thick/thin transitions without decorative bumps confined to round letters.'],
    capsules:['Use sparse short capsules at heavy stroke segments and fine circular joints at thin transitions. Rotate each capsule along the stroke direction; preserve the historical silhouette.','Use elongated rounded modules with deliberate white breaks. Larger capsules mark heavy areas; short small modules mark fine joins. Keep one construction across every glyph.'],
    tiles:['Use a small vocabulary of rounded square and quarter-circle modules sized to stroke thickness. Apply it to every structural segment, not only the bowls.','Use interlocking soft geometric tiles and open joints. Large units occupy thick heads and stems; smaller units articulate thin waists, diagonals and crossbars.']
  };
  function build(fresh){
    const f=fields(), glyphs=Array.from(f.glyphs.replace(/\s/g,''));
    if(glyphs.length!==5||new Set(glyphs).size!==5){notice('Enter exactly five different glyphs, including lowercase when testing lowercase.');return;}
    if(!f.old||!f.modern){notice('Describe both main reference roles first.');return;}
    if(f.anchor&&(!glyphs.includes(f.anchor)||!f.approved)){notice('An anchor must be one of the five glyphs and have an approved secondary reference.');return;}
    if(fresh||!f.seed){f.seed=String(crypto.getRandomValues(new Uint32Array(1))[0]);el('pm-seed').value=f.seed;}
    const random=rng(f.seed),pick=a=>a[Math.floor(random()*a.length)];
    const mode=f.mode==='mix'?pick(Object.keys(styles)):f.mode;
    const execution=pick(styles[mode]);
    const contrast=pick(['Emphasize a dramatic thick/thin contrast while keeping fine connections legible.','Use a moderate thick/thin contrast with open counters and stable stroke rhythm.','Let broad heads and terminals contrast with slender waists; avoid making every segment equally heavy.']);
    const terminals=pick(['Retain clear historical notches, expressed through the selected modules.','Use restrained split terminals that preserve the reference serif footprint.','Keep compact playful terminals and generous interior white space.']);
    const text=`TYPE LAB — FIVE-GLYPH IMAGE STUDY\nVariation seed: ${f.seed} · Direction: ${mode}\n\nREFERENCES — fixed roles\nImage 1: ${f.old}. Use its structure, proportions, skeleton, thick/thin relationships and serif logic.\nImage 2: ${f.modern}. Use its execution and module vocabulary, not its letter skeleton.\n${f.approved?`Image 3: ${f.approved}. This contains reviewed correct glyphs; preserve their construction and adapt new glyphs to it.`:'No approved secondary sheet is supplied. Do not treat an earlier failed alphabet as an approved reference.'}\n\nDRAW EXACTLY: ${glyphs.join(' ')}\nOne large, evenly spaced row; each glyph appears once. Preserve case and identity. This is a five-glyph concept image, not a complete font.\n${f.anchor?`Repeat the approved ${f.anchor} faithfully as the drift-control anchor. Do not redesign it.`:'This batch has no approved anchor yet; review it before promoting any glyph into the reference chain.'}\n\nEXECUTION\n${execution}\n${contrast}\n${terminals}\nUse fewer, larger, intentional shapes. Keep counters and apertures open. Derive lowercase from the same module rules, adapted to its own anatomy. Apply the treatment to ALL five glyphs, including straight strokes and diagonals. Do not leave generic slab-serif letters beside styled letters.\n\nPRESENTATION\nSingle black ink on pure white; no color, shadows, texture, gradients, labels or poster artwork. Align baselines and make lowercase large enough to inspect.\n${f.notes?`\nADDITIONAL INSTRUCTIONS\n${f.notes}\n`:''}\nREVIEW BEFORE EXPANDING\nCheck all five identities, case, consistent module sizes and spacing, open counters, historical skeleton and treatment of every stroke. Reject missing, duplicated or partially styled glyphs. Only a reviewed successful batch may become the next secondary reference.`;
    el('prompt-output').value=text;
    history.unshift({fields:{...f},prompt:text,label:`${f.seed} · ${mode} · ${glyphs.join('')}`});history=history.slice(0,20);persist();drawHistory();notice('Prompt ready. Attach the specified reference images in Nautilus, then paste and run manually.');
  }
  el('pm-random').onclick=()=>build(true);el('pm-repeat').onclick=()=>build(false);
  el('pm-copy').onclick=async()=>{if(!el('prompt-output').value){notice('Randomize a prompt first.');return;}try{await navigator.clipboard.writeText(el('prompt-output').value);notice('Prompt copied.');}catch{el('prompt-output').select();notice('Select and copy the prompt manually; clipboard access is unavailable.');}};
  el('pm-download').onclick=()=>{if(!el('prompt-output').value){notice('Randomize a prompt first.');return;}const url=URL.createObjectURL(new Blob([el('prompt-output').value],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`type-lab-prompt-${el('pm-seed').value||'edited'}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  el('pm-clear').onclick=()=>{history=[];persist();drawHistory();notice('Prompt history cleared.');};
  ids.forEach(id=>el('pm-'+id).addEventListener('change',persist));drawHistory();
})();
