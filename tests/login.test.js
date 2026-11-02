const fs = require('fs');
const path = require('path');

let validate;

beforeEach(() => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  document.body.innerHTML = html.match(/<body>([\s\S]*)<\/body>/)[1].replace(/<script[\s\S]*?<\/script>/g, '');
  jest.resetModules();
  ({ validate } = require('../js/app.js'));
});

function rellenar(email, password) {
  document.getElementById('email').value = email;
  document.getElementById('password').value = password;
}

describe('validate()', () => {
  test('acepta un correo válido y una contraseña de 8 caracteres', () => {
    rellenar('alumno@instituto.es', 'Alumno123!');
    expect(validate()).toBe(true);
    expect(document.getElementById('emailError').textContent).toBe('');
    expect(document.getElementById('pwdError').textContent).toBe('');
  });

  test('rechaza un correo sin arroba', () => {
    rellenar('alumno.instituto.es', 'Alumno123!');
    expect(validate()).toBe(false);
    expect(document.getElementById('emailError').textContent).toMatch(/correo válido/);
  });

  test('rechaza una contraseña de menos de 8 caracteres', () => {
    rellenar('alumno@instituto.es', 'corta');
    expect(validate()).toBe(false);
    expect(document.getElementById('pwdError').textContent).toMatch(/mínimo 8/);
  });

  test('muestra los dos errores si todo es inválido', () => {
    rellenar('', '');
    expect(validate()).toBe(false);
    expect(document.getElementById('emailError').textContent).not.toBe('');
    expect(document.getElementById('pwdError').textContent).not.toBe('');
  });
});

describe('envío del formulario', () => {
  function enviar() {
    document.getElementById('loginForm').dispatchEvent(new Event('submit', { cancelable: true }));
  }

  test('credenciales correctas dan acceso', () => {
    rellenar('alumno@instituto.es', 'Alumno123!');
    enviar();
    expect(document.getElementById('formMsg').textContent).toMatch(/Acceso correcto/);
  });

  test('credenciales incorrectas se rechazan', () => {
    rellenar('alumno@instituto.es', 'OtraClave99');
    enviar();
    expect(document.getElementById('formMsg').textContent).toMatch(/incorrectas/);
  });
});
