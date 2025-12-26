/*
 *  Protractor support is deprecated in Angular.
 *  Protractor is used in this example for compatibility with Angular documentation tools.
 */
import { bootstrapApplication, provideProtractorTestingSupport } from '@angular/platform-browser';
import { provideHttpClient } from "@angular/common/http";
import { provideApollo } from 'apollo-angular';
import { inject, provideZoneChangeDetection } from '@angular/core';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client';
import { App } from './app/app';
import { routes } from './app/app.routes';
import {provideRouter} from "@angular/router";
import { environment } from "./environments/environment";

bootstrapApplication(App, {providers: [provideRouter(routes), provideZoneChangeDetection(),provideProtractorTestingSupport(), provideHttpClient(), provideApollo(() => {
      const httpLink = inject(HttpLink);

      return {
        link: httpLink.create({
          uri: environment.graphqlUrl,
        }),
        cache: new InMemoryCache(),
      };
    })]}).catch((err) =>
  console.error(err),
);
