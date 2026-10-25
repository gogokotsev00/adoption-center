import {Component, OnInit} from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import {RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {NotificationsService} from "./service/notifications.service";

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
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Owners</a>
      <a routerLink="/dogs" routerLinkActive="active">Dogs</a>
      <a routerLink="/applications" routerLinkActive="active">Applications</a>
      <a routerLink="/notifications" routerLinkActive="active" class="notifications-link">
        Notifications
        @if (unreadCount() > 0) {
          <span class="unread-badge">{{ unreadCount() }}</span>
        }
      </a>
    </nav>

    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  title = 'adoption-center';
  unreadCount = this.notificationsService.unreadCount;

  constructor(private notificationsService: NotificationsService) {}

  ngOnInit() {
    this.notificationsService.loadNotifications();
  }
}
