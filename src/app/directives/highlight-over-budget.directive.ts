import { Directive, computed, input } from '@angular/core';

@Directive({
  selector: '[appHighlightOverBudget]',
  host: { '[style.background-color]': 'background()' },
})
export class HighlightOverBudgetDirective {
  /** The expense amount */
  appHighlightOverBudget = input.required<number>();
  threshold = input<number>(100);

  background = computed(() =>
    this.appHighlightOverBudget() > this.threshold() ? '#ffe2d1' : null,
  );
}
