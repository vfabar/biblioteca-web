import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * La ruta a la que Cognito devuelve el navegador después del login.
 *
 * Es la misma URL que registraste como **Allowed callback URL** en el app
 * client: `http://localhost:4200/callback`. Coincidencia exacta, carácter por
 * carácter.
 *
 * ── Por qué esta ruta existe pero está casi vacía ──
 *
 * En el tramo 6 hiciste el flujo a mano y esta dirección te dio un error de
 * conexión, porque no había nada escuchando en el 4200. Ahora sí hay algo: esta
 * página. Lo que **no** hace todavía es canjear el código.
 *
 * Y no lo va a hacer este componente. Lo hace Amplify, cuando agregas en
 * `main.ts` la línea:
 *
 *     import 'aws-amplify/auth/enable-oauth-listener';
 *
 * Ese listener ve el `?code=` en la barra de direcciones, hace el POST a
 * `/oauth2/token` con el `code_verifier` que guardó, y deja la sesión lista.
 * Es literalmente tu `token.mjs` del tramo 6.5, escrito por otra persona.
 *
 * 🔨 Lo que te queda por hacer acá (tramo 8): cuando la sesión exista, navegar
 *    a `/libros`. Hoy este componente solo espera y te lo cuenta.
 */
@Component({
  selector: 'app-callback',
  imports: [RouterLink],
  templateUrl: './callback.html',
})
export class Callback {
  /** ¿Volvimos con un código en la URL? Es lo único que este componente sabe. */
  protected readonly conCodigo = signal(
    new URLSearchParams(window.location.search).has('code'),
  );
}
