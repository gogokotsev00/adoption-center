import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';
import { Dogs } from './dogs/dogs';

export const routes: Routes = [
    { path: '', component: Home },        // default page
    { path: 'dogs', component: Dogs },  // /dogs
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutes {}
