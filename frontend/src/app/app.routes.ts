import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';
import { Dogs } from './dogs/dogs';
import { Applications } from './applications/applications';

export const routes: Routes = [
    { path: '', component: Home },        // default page
    { path: 'dogs', component: Dogs },  // /dogs
    { path: 'applications', component: Applications }, // /applications
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutes {}
