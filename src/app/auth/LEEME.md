# Esta carpeta está vacía a propósito

Acá van los **dos archivos que escribes tú** en el tramo 8 de L3. No están
puestos porque son el laboratorio, no el andamio.

```
src/app/auth/
├── sesion.guard.ts       ← tramo 8.6
└── token.interceptor.ts  ← tramo 8.7
```

## `sesion.guard.ts` — tramo 8.6

Amplify no trae guard de Angular: es un tipo de Angular, no de AWS. Son seis
líneas, y para cuando llegues acá entiendes cada una.

Lo que hace: pregunta si hay sesión. Si hay, deja pasar. Si no hay, manda al
login. `fetchAuthSession()` devuelve la sesión actual **y renueva el token solo
si hace falta** — esa es la adquisición silenciosa de D4, pasando sin que la
hayas programado.

Se registra en `app.routes.ts`, con `canActivate`.

## `token.interceptor.ts` — tramo 8.7

Adjunta el `Authorization: Bearer <jwt>` a las peticiones que salen. Se
registra **una vez** en `app.config.ts` y aplica a todas: por eso
`biblioteca.ts` no tiene un solo header adentro.

Y lleva una **lista blanca**, que es la línea que más se copia mal:

```ts
const PERMITIDOS = ['http://localhost:8080'];   // solo tu gateway
```

No es cosmética. Un interceptor que adjunta el `Authorization` a **toda**
petición se lo manda también al CDN de las fuentes, a la API del clima del pie
de página, y a cualquier tercero al que tu app le pida algo. **Regalar un
access token a un tercero es regalarle la identidad del usuario.** Las listas
blancas se escriben cortas, y esta tiene una sola entrada.

## Lo que no va acá

El `Amplify.configure` **no** va en esta carpeta: va en `src/main.ts`, antes de
arrancar la aplicación. Está ahí, comentado, con los cuatro valores que tienes
que pegar de tu `ficha.txt`.
