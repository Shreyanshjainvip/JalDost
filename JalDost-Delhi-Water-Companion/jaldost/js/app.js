import { ACTIONS } from './data.js';
import { completeAction, getState, getTodayRecord, subscribe, resetPrototype } from './store.js';

const main = document.querySelector('#main');
const header = document.querySelector('#site-header');
const modalRoot = document.querySelector('.modal-root');
const toastRegion = document.querySelector('.toast-region');
let unsubscribe = null;

function routeName() { return location.hash.startsWith('#/dashboard') ? 'dashboard' : 'landing'; }

function navigate(route) {
  location.hash = route === 'dashboard' ? '#/dashboard' : '#/';
  window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

function render() {
  if (unsubscribe) { unsubscribe(); unsubscribe = null; }
  const route = routeName();
  header.hidden = route === 'dashboard';
  const template = document.querySelector(`#${route}-template`);
  main.replaceChildren(template.content.cloneNode(true));
  document.body.dataset.route = route;
  document.title = route === 'dashboard' ? 'Today — JalDost' : 'JalDost — Delhi Water Companion';
  bindGlobalControls(main);
  if (route === 'dashboard') {
    renderDashboard();
    unsubscribe = subscribe(renderDashboardState);
  }
}

function bindGlobalControls(scope = document) {
  scope.querySelectorAll('[data-route]').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.route)));
  scope.querySelectorAll('[data-coming]').forEach((button) => button.addEventListener('click', () => toast(`${button.dataset.coming} is part of the next prototype phase.`)));
  scope.querySelectorAll('[data-open-community]').forEach((button) => button.addEventListener('click', openCommunity));
}

function renderDashboard() {
  const date = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const dateLabel = main.querySelector('.date-label');
  if (dateLabel) dateLabel.textContent = date.toUpperCase();
  const list = main.querySelector('[data-action-list]');
  ACTIONS.filter((action) => action.active).forEach((action) => list.append(createActionCard(action)));
  renderDashboardState();
}

function createActionCard(action) {
  const article = document.createElement('article');
  article.className = 'action-card';
  article.dataset.actionId = action.id;
  article.innerHTML = `
    <div class="action-icon action-icon--${action.tone}" aria-hidden="true">${action.icon}</div>
    <div class="action-copy"><div class="action-meta"><span>${action.category}</span><span>${action.difficulty}</span></div><h3>${action.title}</h3><p>${action.description}</p><button class="evidence-link" type="button">Why ~${action.estimatedLitres} L?</button></div>
    <div class="action-reward"><strong>~${action.estimatedLitres} L</strong><span>estimated</span><b>+${action.xpReward} XP</b></div>
    <button class="complete-button" type="button"><span class="button-label">Mark complete</span><span aria-hidden="true">✓</span></button>`;
  article.querySelector('.complete-button').addEventListener('click', () => openCompleteDialog(action));
  article.querySelector('.evidence-link').addEventListener('click', () => openEvidence(action));
  return article;
}

function renderDashboardState() {
  if (routeName() !== 'dashboard') return;
  const state = getState();
  const record = getTodayRecord();
  const activeActions = ACTIONS.filter((action) => action.active);
  const completed = record.completedActionIds.length;
  const pct = Math.round((completed / activeActions.length) * 100);
  setText('[data-complete-count]', completed);
  setText('[data-action-count]', activeActions.length);
  setText('[data-xp]', state.profile.xp);
  setText('[data-savings]', state.profile.estimatedLitresSaved);
  setText('[data-streak]', state.profile.streak);
  setWidth('[data-day-progress]', pct);
  const milestonePct = Math.min(100, state.profile.estimatedLitresSaved);
  setText('[data-milestone-percent]', milestonePct);
  setText('[data-milestone-remaining]', Math.max(0, 100 - state.profile.estimatedLitresSaved));
  setWidth('[data-milestone-progress]', milestonePct);
  setWidth('[data-challenge-progress]', Math.min(100, (state.profile.streak / 7) * 100));
  renderWeek(state.profile.streak);

  main.querySelectorAll('[data-action-id]').forEach((card) => {
    const isComplete = record.completedActionIds.includes(card.dataset.actionId);
    card.classList.toggle('is-complete', isComplete);
    const button = card.querySelector('.complete-button');
    button.disabled = isComplete;
    button.querySelector('.button-label').textContent = isComplete ? 'Completed' : 'Mark complete';
  });
}

function renderWeek(streak) {
  const row = main.querySelector('[data-week-row]');
  if (!row) return;
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  row.innerHTML = labels.map((label, index) => `<span class="${index < Math.min(streak, 7) ? 'is-done' : ''}"><i>${index < Math.min(streak, 7) ? '✓' : ''}</i>${label}</span>`).join('');
}

function setText(selector, value) { main.querySelectorAll(selector).forEach((el) => { el.textContent = value; }); }
function setWidth(selector, value) { main.querySelectorAll(selector).forEach((el) => { el.style.width = `${value}%`; }); }

function openCompleteDialog(action) {
  const record = getTodayRecord();
  if (record.completedActionIds.includes(action.id)) { toast('This action is already recorded for today.'); return; }
  openModal({
    label: 'Record today’s action',
    title: action.title,
    body: `<div class="confirm-impact"><span><b>~${action.estimatedLitres} L</b> estimated saved</span><span><b>+${action.xpReward} XP</b> participation reward</span></div><p class="modal-disclaimer">By confirming, you’re self-reporting that you completed this action. The litres shown are an estimate, not a measurement.</p>`,
    confirmText: 'Yes, I did this',
    onConfirm: () => {
      const result = completeAction(action);
      closeModal();
      if (result.ok) {
        toast(`Action recorded: +${action.xpReward} XP and ~${action.estimatedLitres} estimated litres.`);
        const card = main.querySelector(`[data-action-id="${action.id}"]`);
        card?.classList.add('just-completed');
      } else toast('This action is already recorded for today.');
    }
  });
}

function openEvidence(action) {
  openModal({
    label: 'Estimate details',
    title: `Why ~${action.estimatedLitres} litres?`,
    body: `<dl class="evidence-list"><div><dt>Assumption</dt><dd>${action.evidence.assumption}</dd></div><div><dt>Confidence</dt><dd>${action.evidence.confidence}</dd></div><div><dt>Evidence status</dt><dd>${action.evidence.source ? 'Source documented' : 'Prototype estimate—source review pending'}</dd></div><div><dt>Last reviewed</dt><dd>${action.evidence.reviewedAt}</dd></div></dl><p class="modal-disclaimer">JalDost never presents this value as sensor-measured household usage.</p>`,
    confirmText: 'Got it',
    onConfirm: closeModal,
    cancel: false
  });
}

function openCommunity() {
  openModal({
    label: 'Community preview',
    title: 'Delhi learners leaderboard',
    body: `<ol class="modal-leaderboard"><li><b>1</b><span>Aarav M.</span><strong>1,420 XP</strong></li><li><b>2</b><span>Meher K.</span><strong>1,280 XP</strong></li><li><b>3</b><span>Vihaan R.</span><strong>1,160 XP</strong></li><li class="is-you"><b>8</b><span>You</span><strong>${getState().profile.xp} XP</strong></li></ol><p class="modal-disclaimer">Prototype preview only. A trusted leaderboard will use authenticated profiles and server-controlled calculations.</p>`,
    confirmText: 'Close preview',
    onConfirm: closeModal,
    cancel: false
  });
}

function openModal({ label, title, body, confirmText, onConfirm, cancel = true }) {
  const lastFocused = document.activeElement;
  modalRoot.innerHTML = `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" aria-label="Close dialog">×</button><p class="eyebrow">${label}</p><h2 id="modal-title">${title}</h2><div class="modal-body">${body}</div><div class="modal-actions">${cancel ? '<button class="button button--secondary" data-cancel>Cancel</button>' : ''}<button class="button button--primary" data-confirm>${confirmText}</button></div></section></div>`;
  const backdrop = modalRoot.querySelector('.modal-backdrop');
  const close = () => { closeModal(); lastFocused?.focus(); };
  backdrop.querySelector('.modal-close').addEventListener('click', close);
  backdrop.querySelector('[data-cancel]')?.addEventListener('click', close);
  backdrop.querySelector('[data-confirm]').addEventListener('click', onConfirm);
  backdrop.addEventListener('click', (event) => { if (event.target === backdrop) close(); });
  backdrop.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  requestAnimationFrame(() => { backdrop.classList.add('is-open'); backdrop.querySelector('[data-confirm]').focus(); });
}

function closeModal() {
  const backdrop = modalRoot.querySelector('.modal-backdrop');
  if (!backdrop) return;
  backdrop.classList.remove('is-open');
  setTimeout(() => modalRoot.replaceChildren(), 160);
}

function toast(message) {
  const item = document.createElement('div');
  item.className = 'toast';
  item.innerHTML = `<span aria-hidden="true">✓</span><p>${message}</p>`;
  toastRegion.append(item);
  requestAnimationFrame(() => item.classList.add('is-visible'));
  setTimeout(() => { item.classList.remove('is-visible'); setTimeout(() => item.remove(), 200); }, 4200);
}

window.addEventListener('hashchange', render);
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-route]');
  if (trigger && !main.contains(trigger)) navigate(trigger.dataset.route);
});
window.__JALDOST__ = { resetPrototype };
render();
