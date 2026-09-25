import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, delay, map, of, switchMap } from 'rxjs';
import { CATEGORIES, Expense } from '../models/expense.model';
import { ExpenseService } from './expense.service';

@Injectable({ providedIn: 'root' })
export class AiChatbotService {
  private http = inject(HttpClient);
  private expenseService = inject(ExpenseService);

  /**
   * Put the URL of the AI agent / webhook you built in the lecture here.
   * It receives POST { message, expenses } and should answer { reply: string }.
   * While empty, a built-in local assistant answers from your expense data.
   */
  private readonly agentUrl = '';

  ask(message: string): Observable<string> {
    return this.expenseService.getAll().pipe(
      switchMap(expenses => {
        if (!this.agentUrl) return of(this.localAnswer(message, expenses)).pipe(delay(600));
        return this.http
          .post<{ reply: string }>(this.agentUrl, { message, expenses })
          .pipe(map(r => r.reply));
      }),
      catchError(() => of('Sorry, I could not reach the expense data or the AI agent. Please try again.')),
    );
  }

  private money(n: number): string {
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  private sum(list: Expense[]): number {
    return list.reduce((s, e) => s + e.amount, 0);
  }

  private localAnswer(question: string, list: Expense[]): string {
    const t = question.toLowerCase();
    if (list.length === 0) return 'You have no expenses yet. Add one and ask me again!';

    const cat = CATEGORIES.find(c => t.includes(c.toLowerCase()));
    if (cat) {
      const l = list.filter(e => e.category === cat);
      return `${cat}: ${l.length} expense(s) totalling ${this.money(this.sum(l))}.`;
    }
    if (/(biggest|largest|highest|most expensive)/.test(t)) {
      const m = list.reduce((a, b) => (b.amount > a.amount ? b : a));
      return `Your biggest expense is ${this.money(m.amount)} on ${m.category} (${m.date}).`;
    }
    if (/(latest|recent|last)/.test(t)) {
      const m = [...list].sort((a, b) => b.date.localeCompare(a.date))[0];
      return `Your latest expense is ${this.money(m.amount)} on ${m.category} (${m.date}).`;
    }
    if (/(how many|count|number)/.test(t)) return `You have ${list.length} expense(s).`;
    if (/(total|spent|spend|sum)/.test(t)) return `You have spent ${this.money(this.sum(list))} across ${list.length} expense(s).`;
    return 'Try asking: "What is my total?", "How much on Food?", "What is my biggest expense?" or "What was my latest expense?"';
  }
}
