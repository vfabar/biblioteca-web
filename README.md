# biblioteca-web

El frontend Angular de la biblioteca, **en el estado en que empieza el tramo 8
de L3**: la aplicación funciona, navega y le pide los datos al gateway del
8080 — y no sabe nada de autenticación.

Eso último no es un descuido: es el laboratorio.

Este repositorio es el gemelo de
[**biblioteca-gateway**](https://github.com/Umbingelelo/biblioteca-gateway),
que es el backend. Necesitas los dos, forkeados, para L3, L4 y L5.

```
biblioteca-web/
├── src/
│   ├── main.ts                     Amplify.configure, COMENTADO ← tramo 8.3
│   ├── index.html
│   ├── styles.css
│   └── app/
│       ├── app.ts / app.html       el cascarón y la navegación
│       ├── app.config.ts           provideHttpClient() SIN interceptor ← tramo 8.7
│       ├── app.routes.ts           las rutas, SIN canActivate ← tramo 8.6
│       ├── biblioteca.ts           el único que habla con el gateway
│       ├── libros/                 el catálogo → GET /v1/libros
│       ├── prestamos/              los préstamos → GET /v1/prestamos
│       ├── callback/               a donde Cognito devuelve el navegador
│       └── auth/                   VACÍA: los dos archivos los escribes tú
└── docs/
```

Cada archivo que te toca modificar tiene arriba un comentario que empieza con
**🔨** y dice exactamente qué le falta y de qué tramo es. Búscalos:

```bash
grep -rn "🔨" src/
```

## Partir

Necesitas **Node 24**. Angular 22 pide `v22.22.3` o superior, o `v24.15.0` o
superior; si tienes un Node 22 más viejo el `ng` no arranca y el mensaje sí te
dice por qué.

```bash
node -v                       # → v24.x
git clone https://github.com/<tu-usuario>/biblioteca-web.git
cd biblioteca-web
npm install
npm start
```

Abre **http://localhost:4200**.

`aws-amplify` **ya está en el `package.json`** — no tienes que instalarlo. Con
treinta forks del mismo repositorio bajando lo mismo a la vez en la misma sala,
eso son varios minutos que no se pierden. Compruébalo:

```bash
npm ls aws-amplify
```

## Qué tienes que ver la primera vez

El gateway de L1 responde **401** cuando la petición no trae header
`Authorization`, y este frontend todavía no manda ninguno. Así que la primera
vez que abras el catálogo vas a ver esto:

> **El gateway respondió 401.**
> *No sé quién eres.* La petición salió sin header `Authorization`…

**Eso está bien.** Es el gateway funcionando como puerta. Lo que arregla el
tramo 8 no es el gateway: es que el frontend consiga un token de verdad y lo
mande.

Si en cambio ves **código 0**, ahí sí hay algo que arreglar: un `0` no es una
respuesta HTTP, es que no hubo respuesta. O el gateway no está corriendo, o su
CORS no permite `http://localhost:4200`.

## Levantar las dos mitades

L3 necesita **cuatro procesos**, y por eso cuatro terminales. No es desorden:
es cómo se trabaja con esto.

| Terminal | Comando | Carpeta |
|---|---|---|
| 1 | `node servicios/libros.mjs` | `biblioteca-gateway/` |
| 2 | `node servicios/prestamos.mjs` | `biblioteca-gateway/` |
| 3 | `npm run start:dev` | `biblioteca-gateway/gateway/` |
| 4 | `npm start` | `biblioteca-web/` |

| Quién | Dónde escucha |
|---|---|
| microservicio de libros | `http://localhost:3001` |
| microservicio de préstamos | `http://localhost:3002` |
| **gateway** | **`http://localhost:8080`** ← el único que el frontend conoce |
| **frontend** | **`http://localhost:4200`** |

Los puertos **no son negociables**, y no por capricho:

- El gateway trae `enableCors({ origin: 'http://localhost:4200' })` a mano. Si
  sirves el frontend en otro puerto, el navegador se niega a entregarle la
  respuesta al JavaScript y te sale el código 0.
- `http://localhost:4200/callback` es la **Allowed callback URL** que
  registraste en tu app client de Cognito. Coincidencia **exacta**, carácter por
  carácter: `http` y no `https`, y sin barra final.

## Los cuatro valores que necesitas

Del `ficha.txt` de L3. Van en `src/main.ts`:

| Valor | De dónde salió | Forma |
|---|---|---|
| `userPoolId` | tramo 1.2 | `us-east-1_` + 9 caracteres |
| `userPoolClientId` | tramo 4 | ~26 caracteres alfanuméricos, sin guiones |
| `domain` | tramo 2 | `algo.auth.us-east-1.amazoncognito.com` — **sin `https://`** |
| scope | tramo 3.3 | `biblioteca/libros.leer` — con el prefijo |

Ninguno es secreto. Un cliente público **no tiene** secretos: tu código corre
en el navegador del usuario y cualquier cosa que le pongas está a un clic
derecho de distancia. Por eso existe PKCE — es lo que reemplaza al secreto que
no puedes tener.

## Probarlo

```bash
npm test          # las unitarias, con vitest
npm run build     # que compile de verdad, con las optimizaciones de producción
```

Las pruebas que vienen comprueban lo que se puede comprobar sin AWS: que la
aplicación arranca, que las rutas existen, y que el servicio le pega al
**8080** y no a los microservicios directo. Esa última es la que vale: apuntar
`biblioteca.ts` al 3001 **no da ningún error** — responde 200, con datos
válidos, rodeando el gateway. *Un gateway no protege lo que se puede rodear.*

## Sobre las versiones

`package.json` fija las dependencias **exactas**, sin `^`, y el
`package-lock.json` está versionado. No es pedantería: con treinta forks del
mismo repositorio, un `^22.1.0` que un mes después resuelve a otra versión menor
convierte «en mi computador funciona» en un problema que no se puede ayudar a
distancia.

```bash
npm ci        # instala desde el lock, sin recalcular nada
```

## Si algo te falló

| Lo que ves | Qué pasó | Qué haces |
|---|---|---|
| `The Angular CLI requires a minimum Node.js version` | Tu Node es más viejo que lo que pide Angular 22 | Instala Node 24. Lo de L0 |
| La página dice **401** | El frontend no manda token todavía | Es lo correcto antes del tramo 8 |
| La página dice **403** | El token es válido y le falta el scope o el grupo | Tramo 8.5: ¿usaste `signInWithRedirect()`? |
| La página dice **código 0** | No hubo respuesta | ¿Está el gateway en el 8080? ¿Su CORS permite el 4200? |
| Vuelves del login con `?code=` y no pasa nada | Falta `import 'aws-amplify/auth/enable-oauth-listener'` | `src/main.ts`, tramo 8.3 |
| La URL del login sale con `https://https://` | Le pusiste el esquema al `domain` | Va solo el host. Tramo 8.3 |
| `redirect_mismatch` en la pantalla de Cognito | El callback no coincide **exacto** | `http://localhost:4200/callback`, sin barra final |
| `invalid_scope` | Escribiste `libros.leer` sin el prefijo | Es `biblioteca/libros.leer`. Tramo 3.3 |
| `EADDRINUSE` en el 4200 | Quedó otra copia corriendo | `lsof -ti:4200 \| xargs kill -9` en macOS y Linux; `netstat -ano \| findstr :4200` y `taskkill /PID <n> /F` en Windows |

Y antes de irte de la sala, **corta los procesos** con `Ctrl+C` en cada
terminal.
