import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Expense, ExpenseInput } from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private http = inject(HttpClient);
  private url = 'http://localhost:3000/expenses';

  expenses = signal<Expense[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  
  private normalize(e: Expense): Expense {
    return { ...e, amount: Number(e.amount) };
  }

  getAll(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.url).pipe(map(list => list.map(e => this.normalize(e))));
  }

  loadExpenses(): void {
    this.loading.set(true);
    this.error.set(null);
    this.getAll().subscribe({
      next: list => { this.expenses.set(list); this.loading.set(false); },
      error: () => {
        this.error.set('Could not load expenses. Is json-server running on port 3000?');
        this.loading.set(false);
      },
    });
  }

  getExpenseById(id: number | string): Observable<Expense> {
    return this.http.get<Expense>(`${this.url}/${id}`).pipe(map(e => this.normalize(e)));
  }

  addExpense(expense: ExpenseInput): Observable<Expense> {
    return this.http.post<Expense>(this.url, expense).pipe(tap(() => this.loadExpenses()));
  }

  updateExpense(id: number | string, expense: ExpenseInput): Observable<Expense> {
    return this.http.put<Expense>(`${this.url}/${id}`, { ...expense, id }).pipe(tap(() => this.loadExpenses()));
  }

  deleteExpense(id: number | string): Observable<unknown> {
    return this.http.delete(`${this.url}/${id}`).pipe(tap(() => this.loadExpenses()));
  }
}
