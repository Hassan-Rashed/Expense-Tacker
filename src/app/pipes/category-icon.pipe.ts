import { Pipe, PipeTransform } from '@angular/core';
import { ExpenseCategory } from '../models/expense.model';

const ICONS: Record<ExpenseCategory, string> = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Bills: '💡',
  Entertainment: '🎬',
  Other: '📦',
};

@Pipe({ name: 'categoryIcon' })
export class CategoryIconPipe implements PipeTransform {
  transform(category: ExpenseCategory): string {
    return `${ICONS[category] ?? '📦'} ${category}`;
  }
}
