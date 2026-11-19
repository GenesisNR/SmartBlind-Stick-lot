(() => {
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let chosen = null;
  try { chosen = localStorage.getItem('smartblind-theme'); } catch (_) { /* Storage may be blocked. */ }
  const apply = mode => {
    document.documentElement.dataset.theme = mode;
    document.querySelector('meta[name="theme-color"]').content = mode === 'dark' ? '#101923' : '#f3f6f9';
    const button = document.getElementById('themeToggle');
    if (button) {
      const next = mode === 'dark' ? 'claro' : 'oscuro';
      button.setAttribute('aria-label', 'Cambiar a modo ' + next);
      document.getElementById('themeLabel').textContent = 'Modo ' + next;
      document.getElementById('themeIcon').textContent = mode === 'dark' ? '☀' : '☾';
    }
  };
  apply(chosen === 'light' || chosen === 'dark' ? chosen : system.matches ? 'dark' : 'light');
  system.addEventListener('change', e => { if (chosen !== 'light' && chosen !== 'dark') apply(e.matches ? 'dark' : 'light'); });
  document.addEventListener('DOMContentLoaded', () => {
    apply(document.documentElement.dataset.theme);
    document.getElementById('themeToggle').addEventListener('click', () => {
      chosen = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(chosen);
      try { localStorage.setItem('smartblind-theme', chosen); } catch (_) { /* Theme still changes for this visit. */ }
    });
  });
})();
