import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { fetchAuthSession, signInWithRedirect } from 'aws-amplify/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected esBibliotecario = signal(false);

  async ngOnInit() {
    try {
      const { tokens } = await fetchAuthSession();
      const grupos = (tokens?.accessToken?.payload['cognito:groups'] ?? []) as string[];
      this.esBibliotecario.set(grupos.includes('bibliotecarios'));
    } catch {
      this.esBibliotecario.set(false);
    }
  }

  protected async entrar() {
    await signInWithRedirect();
  }
}