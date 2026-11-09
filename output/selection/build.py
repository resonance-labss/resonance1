from pathlib import Path
import json
root=Path(__file__).resolve().parent
(root/'i18n/tr.js').write_text('window.RESONANCE_TR='+json.dumps(json.loads((root/'i18n/tr.json').read_text()),ensure_ascii=False)+';\nwindow.RESONANCE_TR_PATTERNS='+json.dumps(json.loads((root/'i18n/patterns-tr.json').read_text()),ensure_ascii=False)+';\n')
s=(root/"resonance-character-selection.html").read_text()
for name in ['chapter.js', 'learn-panel.js', 'progress.js', 'nft-artwork.js', 'nft-preview.js', 'character-lessons.js', 'lesson-fx.js', 'character-link.js', 'explainer.js']:
 s=s.replace("</body>","<script>"+(root/name).read_text()+"</script></body>")
(root/"resonance-playable-v1.html").write_text(s)
