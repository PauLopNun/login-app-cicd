# login-app-cicd

Práctica de CI/CD con GitHub Actions: una página de login (HTML, CSS y JS) con validación en el cliente, tests, despliegue en GitHub Pages y copia automática a Amazon S3.

## Estructura

| Ruta | Descripción |
|:--|:--|
| `index.html`, `css/`, `js/` | La web de login |
| `tests/login.test.js` | Tests unitarios con Jest y jsdom |
| `.github/workflows/ci.yml` | CI: html-validate, stylelint, ESLint y Jest |
| `.github/workflows/deploy-pages.yml` | CD a GitHub Pages cuando el CI termina bien en `main` |
| `.github/workflows/s3.yml` | Copia de la web a un bucket de S3 en cada push a `main` |

## Ramas

`main` es producción y solo recibe merges tras pasar el CI. `develop` integra el trabajo y `feature/*` y `fix/*` se borran tras el merge.

## Secrets necesarios para `s3.yml`

`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` (solo en AWS Academy), `AWS_REGION` y `S3_BUCKET`.

## En local

```bash
npm ci
npm run lint:html && npm run lint:css && npm run lint:js
npm test
```
