import { Routes } from '@angular/router';
import { ExpenseFormComponent } from './components/expense-form/expense-form.component';
import { ExpenseListComponent } from './components/expense-list/expense-list.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'add', component: ExpenseFormComponent },
  { path: 'expenses', component: ExpenseListComponent },
  { path: 'edit/:id', component: ExpenseFormComponent },
  { path: '**', redirectTo: '' },
];
