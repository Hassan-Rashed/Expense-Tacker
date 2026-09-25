import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HighlightOverBudgetDirective } from '../../directives/highlight-over-budget.directive';
import { CATEGORIES, Expense, ExpenseCategory } from '../../models/expense.model';
import { CategoryIconPipe } from '../../pipes/category-icon.pipe';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-expense-list',
  imports: [CurrencyPipe, CategoryIconPipe, HighlightOverBudgetDirective],
  template: `
    <h2>Expenses</h2>

    <div class="controls">
      <label>Category
        <select [value]="category()" (change)="category.set($any($event.target).value)">
          <option value="All">All</option>
          @for (c of categories; track c) { <option [value]="c">{{ c }}</option> }
        </select>
      </label>
      <label>Search notes
        <input type="search" [value]="search()" (input)="search.set($any($event.target).value)" placeholder="e.g. lunch" />
      </label>
      <label>Sort by
        <select [value]="sortBy()" (change)="sortBy.set($any($event.target).value)">
          <option value="date">Date</option>
          <option value="amount">Amount</option>
        </select>
      </label>
      <label>Direction
        <select [value]="sortDir()" (change)="sortDir.set($any($event.target).value)">
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </label>
      <label>Flag over
        <input type="number" min="0" [value]="threshold()" (input)="threshold.set(+$any($event.target).value)" />
      </label>
    </div>

    <p class="total">Total shown: <strong>{{ total() | currency }}</strong></p>

    @if (service.loading()) { <p>Loading…</p> }
    @if (service.error()) { <p class="error">{{ service.error() }}</p> }

    @if (filteredExpenses().length === 0 && !service.loading()) {
      <p class="empty">
        {{ service.expenses().length === 0 ? 'No expenses yet. Add your first one from the menu.' : 'No expenses match your filters.' }}
      </p>
    } @else {
      <table>
        <thead>
          <tr><th>Category</th><th>Amount</th><th>Date</th><th>Note</th><th>Actions</th></tr>
        </thead>
        <tbody>
          @for (e of filteredExpenses(); track e.id) {
            <tr [appHighlightOverBudget]="e.amount" [threshold]="threshold()">
              <td>{{ e.category | categoryIcon }}</td>
              <td>{{ e.amount | currency }}</td>
              <td>{{ e.date }}</td>
              <td>{{ e.note }}</td>
              <td>
                <button (click)="edit(e)">Edit</button>
                <button class="danger" (click)="remove(e)">Delete</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
  styles: `
    :host { display: block; max-width: 900px; margin: 24px auto; padding: 0 16px; }
    .controls { display: flex; flex-wrap: wrap; gap: 12px; }
    .controls label { display: flex; flex-direction: column; font-size: .85rem; font-weight: 600; gap: 4px; }
    input, select { padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font: inherit; }
    .total { font-size: 1.1rem; margin: 16px 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 10px; border-bottom: 1px solid #e2e8f0; }
    button { padding: 6px 12px; border: 1px solid #cbd5e1; background: #fff; border-radius: 6px; cursor: pointer; margin-right: 6px; }
    button.danger { color: #b91c1c; border-color: #fca5a5; }
    .error { color: #b91c1c; } .empty { color: #64748b; padding: 24px 0; }
  `,
})
export class ExpenseListComponent implements OnInit {
  service = inject(ExpenseService);
  private router = inject(Router);

  categories = CATEGORIES;
  category = signal<'All' | ExpenseCategory>('All');
  search = signal('');
  sortBy = signal<'date' | 'amount'>('date');
  sortDir = signal<'asc' | 'desc'>('desc');
  threshold = signal(100);

  filteredExpenses = computed(() => {
    let list = [...this.service.expenses()];
    const cat = this.category();
    const q = this.search().trim().toLowerCase();
    if (cat !== 'All') list = list.filter(e => e.category === cat);
    if (q) list = list.filter(e => (e.note ?? '').toLowerCase().includes(q));

    const dir = this.sortDir() === 'asc' ? 1 : -1;
    list.sort((a, b) =>
      this.sortBy() === 'amount' ? (a.amount - b.amount) * dir : a.date.localeCompare(b.date) * dir,
    );
    return list;
  });

  total = computed(() => this.filteredExpenses().reduce((sum, e) => sum + e.amount, 0));

  ngOnInit(): void {
    this.service.loadExpenses();
  }

  edit(e: Expense): void {
    this.router.navigate(['/edit', e.id]);
  }

  remove(e: Expense): void {
    if (confirm('Delete this expense?')) {
      this.service.deleteExpense(e.id).subscribe();
    }
  }
}
