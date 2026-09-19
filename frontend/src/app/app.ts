import {Component} from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import {RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-root',
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <main>
      <header class="brand-name">
        <img class="brand-logo" ngSrc="../assets/logo.svg" alt="logo" aria-hidden="true" height="44" width="151"/>
      </header>
    </main>

    <nav>
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
      <a routerLink="/dogs" routerLinkActive="active">Dogs</a>
      <a routerLink="/applications" routerLinkActive="active">Applications</a>
    </nav>

    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.css'],
})
export class App {
  title = 'homes';
}
