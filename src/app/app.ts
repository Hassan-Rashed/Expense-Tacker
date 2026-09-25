import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ChatbotComponent],
  template: `
    <nav>
      <strong>Expense Tracker</strong>
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
      <a routerLink="/add" routerLinkActive="active">Add Expense</a>
      <a routerLink="/expenses" routerLinkActive="active">View Expenses</a>
    </nav>
    <router-outlet />
    <app-chatbot />
  `,
  styles: `
    nav { display: flex; align-items: center; gap: 20px; padding: 14px 24px; background: #134e4a; }
    strong { color: #fff; margin-right: auto; }
    a { color: #99f6e4; text-decoration: none; padding: 4px 2px; }
    a.active { color: #fff; border-bottom: 2px solid #fff; }
  `,
})
export class App {}
