'use strict';
const passwordInput = document.getElementById('password');
const passwordToggle = document.getElementById('passwordToggle');
passwordToggle.addEventListener('click', () => {
  const visible = passwordInput.type === 'password';
  passwordInput.type = visible ? 'text' : 'password';
  passwordToggle.textContent = visible ? 'Ocultar' : 'Mostrar';
  passwordToggle.setAttribute('aria-label', visible ? 'Ocultar contraseña' : 'Mostrar contraseña');
  passwordToggle.setAttribute('aria-pressed', String(visible));
});
document.getElementById('loginForm').addEventListener('submit', () => {
  const button = document.getElementById('loginSubmit');
  button.disabled = true;
  button.textContent = 'Entrando…';
});
window.addEventListener('pageshow', () => {
  const button = document.getElementById('loginSubmit');
  button.disabled = false;
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '→';
  button.replaceChildren(document.createTextNode('Entrar al panel '), arrow);
});
