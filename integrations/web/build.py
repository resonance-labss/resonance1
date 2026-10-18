"""Allowlisted public build. Never reads secrets, credentials or server files."""
from pathlib import Path
import shutil, json, subprocess, os
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'output/selection'
DEST=ROOT/'output/vercel-site'
subprocess.run(['python3',str(SOURCE/'build.py')],check=True)
DEST.mkdir(parents=True,exist_ok=True)
# Preserve Vercel's project link across builds; replace only our public directory.
PUBLIC=DEST/'public'
if PUBLIC.exists(): shutil.rmtree(PUBLIC)
PUBLIC.mkdir()
files=['site-bar.js','anime-theme.css','anime-theme.js','fonts/cinzel-700-latin-ext.woff2','fonts/cinzel-700-latin.woff2','fonts/mplus-rounded-500-latin-ext.woff2','fonts/mplus-rounded-500-latin.woff2','fonts/mplus-rounded-700-latin-ext.woff2','fonts/mplus-rounded-700-latin.woff2','fonts/mplus-rounded-800-latin-ext.woff2','fonts/mplus-rounded-800-latin.woff2','fonts/shippori-700-latin-ext.woff2','fonts/shippori-700-latin.woff2','fonts/shippori-800-latin-ext.woff2','fonts/shippori-800-latin.woff2','fonts/OFL.txt','glossary.js','tour.js','favicon.svg','i18n/tr.js','i18n/i18n.js','my/index.html','my/dashboard.css','my/dashboard.js','demo-unit.js','resonance-playable-v1.html','nft-artwork.js','diren.jpg','ece.jpg','ade.jpg','denis.jpg','hero/entry-1672.webp','hero/entry-960.webp','deploy/ethers.umd.min.js','nft/diren.webp','nft/ece.webp','nft/denis.webp','nft/ade.webp','mint/index.html','mint/mint.js','mint/mint-config.js']
files += ['vault/'+name for name in ['index.html','gate.js','policy.js','progress.js','vault.js','lesson-bridge.js','latch-check.js','ai-guide.js','outcome.js','scenarios.js','entry.js','protection.html','protection.css','protection.js','protection-engine.js','protection-ai.js','journey.js','price-sequence.js','scenario-library.js','experience.js','ade.html','ade.js','ade-engine.js','eric.html','eric.js','eric-engine.js','orientation.js','form-feedback.js','workspace-ui.js','workspace-ui.css','result-card.js','vault-fx.js']]
for name in files:
 target=PUBLIC/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(SOURCE/name,target)
# Credential-backed UI is opt-in; deployment must configure the guarded endpoints first.
if os.environ.get('RESONANCE_HOSTED_SERVICES') != 'enabled':
 p=PUBLIC/'vault/protection.html';p.write_text(p.read_text().replace('<details id="ece-ai"', '<details hidden id="ece-ai"'))
 # Public release deliberately has no credential-backed endpoints.
 p=PUBLIC/'vault/latch-check.js'
 p.write_text("""(()=>{const panel=document.createElement('p');panel.className='muted';panel.textContent='Live Latch checks are available in the local development preview. This public release runs the simulation without a live policy-service check.';document.getElementById('rule-form').append(panel);})();""")
 p=PUBLIC/'vault/ai-guide.js'
 p.write_text("""(()=>{const box=document.createElement('section');box.id='ai-guide';box.hidden=true;document.getElementById('lesson-bridge').after(box);})();""")
 p=PUBLIC/'vault/entry.js';s=p.read_text().replace("  select('practice');", "  const ai=chooser.querySelector('[data-entry=ai]');ai.disabled=true;ai.textContent='AI guide · Local preview only';\n  select('practice');");p.write_text(s)
 p=PUBLIC/'vault/lesson-bridge.js';s=p.read_text().replace('The AI guide can translate your stated limits into a draft plan.', 'In the local development preview, the AI guide can translate your stated limits into a draft plan.').replace('Live Latch checking is available in the plan form.', 'Live Latch checking is available in the local development preview.');p.write_text(s)
 p=PUBLIC/'vault/scenarios.js';s=p.read_text().replace('Optionally check it with Latch, then confirm.', 'Then confirm to reserve the demo budget.');p.write_text(s)
# The shared site bar (site-bar.js) carries the home link and release on every page.
home=Path(__file__).with_name('home.html').read_text()
if os.environ.get('RESONANCE_HOSTED_SERVICES') != 'enabled':
 home=home.replace('Diren and Ece can draft your stated limits with AI. Diren also offers a live Latch proposal check. Apply the draft, then review and confirm separately. Ece’s cumulative protection rules run locally in the rehearsal.', 'AI and Latch are unavailable in this build. Guided examples and manual rules remain available.')
(PUBLIC/'index.html').write_text(home)
(PUBLIC/'robots.txt').write_text('User-agent: *\nAllow: /\n')
(PUBLIC/'404.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><title>Resonance · Page not found</title><body style="background:#0c161e;color:#eee9de;font:20px system-ui;padding:40px"><h1>This path is not open yet.</h1><a href="/" style="color:#b6dfcc">Return to Resonance</a></body></html>')
config={'$schema':'https://openapi.vercel.sh/vercel.json','framework':None,'outputDirectory':'public','headers':[{'source':'/(.*)','headers':[{'key':'X-Content-Type-Options','value':'nosniff'},{'key':'Referrer-Policy','value':'strict-origin-when-cross-origin'},{'key':'X-Frame-Options','value':'DENY'},{'key':'Cache-Control','value':'public, max-age=0, must-revalidate'}]}]}
(DEST/'vercel.json').write_text(json.dumps(config,indent=2)+'\n')
(DEST/'.vercelignore').write_text('.vercel\n.env*\n.private\n')
print('Built public assets:',len(files),'allowlisted app files; no credentials. Hosted UI:',os.environ.get('RESONANCE_HOSTED_SERVICES') == 'enabled')
