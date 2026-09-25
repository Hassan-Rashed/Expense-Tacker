import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <section class="hero">
      <h1>Know where your money goes</h1>
      <p>Log every expense in seconds, then filter, search and total them up.</p>
      <a routerLink="/add" class="cta">+ Add Expense</a>
    </section>
  `,
  styles: `
    .hero { text-align: center; padding: 96px 16px; max-width: 640px; margin: 0 auto; }
    h1 { font-size: 2.8rem; line-height: 1.1; margin: 0 0 16px; }
    p { font-size: 1.15rem; color: #4b5563; margin: 0 0 32px; }
    .cta { display: inline-block; background: #0f766e; color: #fff; text-decoration: none;
           padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 1.05rem; }
    .cta:hover { background: #115e59; }
  `,
})
export class HomeComponent {}
