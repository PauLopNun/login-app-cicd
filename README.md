# login-app-cicd

Práctica de CI/CD del curso de especialización en servicios en la nube (1CES, 2026/27). Parte de una página de login muy simple y monta alrededor un pipeline con GitHub Actions: cada push se revisa y se prueba, y si todo pasa la web se publica en GitHub Pages y se copia a un bucket de Amazon S3.

La web en sí no tiene mucho interés (solo valida el formulario en el navegador). Lo que se trabaja aquí es la automatización.

- Web en GitHub Pages: https://paulopnun.github.io/login-app-cicd/
- Web en S3: http://login-cicd-paulopez-2627.s3-website-us-east-1.amazonaws.com/
- Documentación y capturas de la entrega: [curso-servicios-nube](https://github.com/PauLopNun/curso-servicios-nube/tree/main/Despliegue-de-Servicios-Administrados-en-la-Nube/Practica-1-Despliegue-CICD)

## Qué hay en el repo

| Ruta | Qué es |
|:--|:--|
| `index.html`, `css/`, `js/` | La página de login |
| `tests/login.test.js` | Tests con Jest y jsdom |
| `.github/workflows/ci.yml` | Lint y tests |
| `.github/workflows/deploy-pages.yml` | Despliegue en GitHub Pages |
| `.github/workflows/s3.yml` | Copia de la web al bucket de S3 |
| `.stylelintrc.json`, `eslint.config.cjs`, `.htmlvalidate.json` | Configuración de los linters |

## Cómo funciona el pipeline

1. **CI** (`ci.yml`). En cada push o pull request a `main` o `develop` se instalan las dependencias, se pasan html-validate, stylelint y ESLint, y se ejecutan los tests de Jest. Si algo falla, el workflow se pone en rojo.
2. **GitHub Pages** (`deploy-pages.yml`). Cuando el CI termina bien en `main`, se publican `index.html`, `css/` y `js/`.
3. **S3** (`s3.yml`). En cada push a `main` se hace `aws s3 sync` contra el bucket, con `--delete` para que lo borrado del repo desaparezca también del bucket. No se suben los tests, los `package*.json`, las configuraciones de los linters ni el README.

## Ramas

- `main`: lo que está publicado. Solo se le llega desde `develop` una vez que el CI está en verde.
- `develop`: donde se trabaja.

## Credenciales de AWS

No hay ninguna en el código. El workflow de S3 las lee de los Secrets del repositorio (Settings, Secrets and variables, Actions):

`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, `AWS_REGION` y `S3_BUCKET`.

Se usa AWS Academy Learner Lab, así que las credenciales son temporales y caducan al cerrar el laboratorio. Hay que volver a copiarlas en los Secrets cada vez que se inicia una sesión nueva.

## Sitio web estático en S3

Esto es la ampliación opcional del enunciado. El bucket (`login-cicd-paulopez-2627`, región `us-east-1`) se creó con el acceso público bloqueado. Para servir la web desde S3 se quitó solo el bloqueo de políticas públicas, se activó el alojamiento de sitio web y se añadió una política que permite únicamente leer los objetos:

```bash
aws s3api put-public-access-block --bucket login-cicd-paulopez-2627 \
  --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false"

aws s3api put-bucket-policy --bucket login-cicd-paulopez-2627 --policy file://policy-web.json

aws s3 website s3://login-cicd-paulopez-2627 --index-document index.html --error-document index.html
```

`policy-web.json`:

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

Escribir en el bucket sigue necesitando credenciales, así que solo lo puede hacer el workflow.

## Probarlo en local

```bash
npm ci
npm run lint:html
npm run lint:css
npm run lint:js
npm test
```

Para ver la web basta con abrir `index.html` en el navegador. El usuario de prueba está en `js/app.js`.
