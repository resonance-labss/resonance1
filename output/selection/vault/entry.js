(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const chooser = document.createElement('section');
  chooser.className = 'panel';
  chooser.id = 'plan-entry';
  chooser.innerHTML = '<h2>How would you like to start?</h2><div class="row" role="group" aria-label="Plan preparation"><button type="button" data-entry="practice" aria-controls="scenario-guide" aria-pressed="true">Guided practice</button><button type="button" data-entry="manual" aria-controls="rule-form" aria-pressed="false">Write my own rule</button><button type="button" data-entry="words" aria-controls="plain-rule" aria-pressed="false">Describe it in words</button><button type="button" data-entry="ai" aria-controls="ai-guide" aria-pressed="false">Ask the AI guide</button></div><p id="entry-hint" class="muted" role="status"></p>';
  $('scenario-guide').before(chooser);
  if ($('plain-rule')) chooser.after($('plain-rule'));
  const hints = {
    practice: 'Start with a short example. You still review and confirm every rule.',
    manual: 'Set your price limit, budget and deadline in the form below. No AI request is needed.',
    words: 'Write your limits in a sentence. The form is filled in this browser; nothing is sent anywhere.',
    ai: 'Describe your limits to get a draft. A request is sent only when you press Draft a plan.'
  };
  function select(mode, focus = false) {
    $('scenario-guide').hidden = mode !== 'practice';
    $('ai-guide').hidden = mode !== 'ai';
    if ($('plain-rule')) $('plain-rule').hidden = mode !== 'words';
    for (const button of chooser.querySelectorAll('[data-entry]')) {
      const active = button.dataset.entry === mode;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('secondary', !active);
    }
    $('entry-hint').textContent = hints[mode];
    if (focus && mode === 'manual') {
      const target = $('limit').disabled ? $('rule-progress') : $('limit');
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      if (!target.disabled && target.tagName === 'INPUT') target.focus({ preventScroll: true });
    }
  }
  for (const button of chooser.querySelectorAll('[data-entry]')) button.onclick = () => select(button.dataset.entry, true);
  // Changing the view never changes a plan, starts a request, or reserves funds.
  select('practice');
})();
