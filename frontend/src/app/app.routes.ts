import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Owners } from './owners/owners';
import { Dogs } from './dogs/dogs';
import { Applications } from './applications/applications';
import { Notifications } from './notifications/notifications';

export const routes: Routes = [
    { path: '', component: Owners },        // default page
    { path: 'owners', component: Owners },  // /owners
    { path: 'dogs', component: Dogs },  // /dogs
    { path: 'applications', component: Applications }, // /applications
    { path: 'notifications', component: Notifications }, // /notifications
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutes {}
