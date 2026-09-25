import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CATEGORIES, ExpenseCategory } from '../../models/expense.model';
import { ExpenseService } from '../../services/expense.service';

/** Custom validator: date cannot be in the future. */
export function notFutureDate(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return control.value > today ? { futureDate: true } : null;
}

@Component({
  selector: 'app-expense-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h2>{{ isEdit() ? 'Edit Expense' : 'Add Expense' }}</h2>

    @if (error()) { <p class="error">{{ error() }}</p> }

    <form [formGroup]="form" (ngSubmit)="submit()">
      <label>Amount
        <input type="number" step="0.01" formControlName="amount" />
      </label>
      @if (invalid('amount')) {
        <small class="error">
          @if (form.controls.amount.hasError('required')) { Amount is required. }
          @else { Amount must be greater than 0. }
        </small>
      }

      <label>Category
        <select formControlName="category">
          <option value="">Select a category</option>
          @for (c of categories; track c) { <option [value]="c">{{ c }}</option> }
        </select>
      </label>
      @if (invalid('category')) { <small class="error">Please choose a category.</small> }

      <label>Date
        <input type="date" formControlName="date" />
      </label>
      @if (invalid('date')) {
        <small class="error">
          @if (form.controls.date.hasError('required')) { Date is required. }
          @else { Date cannot be in the future. }
        </small>
      }

      <label>Note (optional)
        <textarea rows="3" formControlName="note"></textarea>
      </label>
      @if (invalid('note')) { <small class="error">Note can be at most 200 characters.</small> }

      <div class="actions">
        <button type="submit" [disabled]="form.invalid || saving()">
          {{ isEdit() ? 'Update Expense' : 'Add Expense' }}
        </button>
        <a routerLink="/expenses" class="cancel">Cancel</a>
      </div>
    </form>
  `,
  styles: `
    :host { display: block; max-width: 480px; margin: 32px auto; padding: 0 16px; }
    form { display: flex; flex-direction: column; gap: 6px; }
    label { display: flex; flex-direction: column; gap: 4px; font-weight: 600; margin-top: 10px; }
    input, select, textarea { padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font: inherit; }
    .error { color: #b91c1c; font-size: .85rem; font-weight: 400; }
    .actions { display: flex; align-items: center; gap: 16px; margin-top: 20px; }
    button { background: #0f766e; color: #fff; border: 0; padding: 10px 22px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    button:disabled { background: #94a3b8; cursor: not-allowed; }
    .cancel { color: #475569; }
  `,
})
export class ExpenseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ExpenseService);

  categories = CATEGORIES;
  editId = signal<string | null>(null);
  isEdit = computed(() => this.editId() !== null);
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    amount: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    category: this.fb.control<ExpenseCategory | ''>('', Validators.required),
    date: this.fb.control('', [Validators.required, notFutureDate]),
    note: this.fb.control('', Validators.maxLength(200)),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      this.service.getExpenseById(id).subscribe({
        next: e => this.form.patchValue({ amount: e.amount, category: e.category, date: e.date, note: e.note ?? '' }),
        error: () => this.error.set('Could not load this expense.'),
      });
    }
  }

  invalid(name: 'amount' | 'category' | 'date' | 'note'): boolean {
    const c = this.form.controls[name];
    return c.invalid && c.touched;
  }

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const payload = {
      amount: Number(v.amount),
      category: v.category as ExpenseCategory,
      date: v.date ?? '',
      note: v.note ?? '',
    };
    this.saving.set(true);
    const id = this.editId();
    const request$ = id ? this.service.updateExpense(id, payload) : this.service.addExpense(payload);
    request$.subscribe({
      next: () => this.router.navigate(['/expenses']),
      error: () => { this.error.set('Save failed. Is json-server running?'); this.saving.set(false); },
    });
  }
}
