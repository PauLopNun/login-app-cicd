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

## Despliegues

| Destino | URL |
|:--|:--|
| GitHub Pages | https://paulopnun.github.io/login-app-cicd/ |
| Sitio web estático de S3 | http://login-cicd-paulopez-2627.s3-website-us-east-1.amazonaws.com/ |

## Sitio web estático en S3 (ampliación T.6)

El bucket `login-cicd-paulopez-2627` (`us-east-1`) se creó con el acceso público bloqueado. Para publicar la web se desactivó solo el bloqueo de políticas públicas, se activó el alojamiento web y se añadió una política que permite **únicamente lectura** de los objetos:

```bash
aws s3api put-public-access-block --bucket login-cicd-paulopez-2627 \
  --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false"

aws s3api put-bucket-policy --bucket login-cicd-paulopez-2627 --policy file://policy-web.json

aws s3 website s3://login-cicd-paulopez-2627 --index-document index.html --error-document index.html
```

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LecturaPublicaWeb",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::login-cicd-paulopez-2627/*"
    }
  ]
}
```

Escribir o borrar en el bucket sigue necesitando credenciales: solo lo hace el workflow `s3.yml` con los Secrets del repositorio.

## Flujo de trabajo

1. Se trabaja en `develop` (o en una rama `feature/*` o `fix/*`) y el CI valida cada push.
2. Con el CI en verde se fusiona en `main`.
3. El push a `main` lanza dos despliegues: `s3.yml` copia la web al bucket y, al terminar el CI, `deploy-pages.yml` la publica en GitHub Pages.
