import {Component} from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import {RouterLink, RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-root',
  imports: [NgOptimizedImage, RouterLink, RouterOutlet],
  template: `
    <main>
      <header class="brand-name">
        <img class="brand-logo" ngSrc="../assets/logo.svg" alt="logo" aria-hidden="true" height="44" width="151"/>
      </header>
    </main>

    <nav>
      <a style="margin: 10px" routerLink="/">Home</a>
      <a routerLink="/dogs">Dogs</a>
    </nav>

    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.css'],
})
export class App {
  title = 'homes';
}
