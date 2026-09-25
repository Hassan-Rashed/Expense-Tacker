import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AiChatbotService } from '../../services/ai-chatbot.service';

interface ChatMessage { role: 'user' | 'ai'; text: string; }

@Component({
  selector: 'app-chatbot',
  imports: [ReactiveFormsModule],
  template: `
    @if (open()) {
      <section class="panel">
        <header>
          Expense Assistant
          <button class="close" (click)="open.set(false)" aria-label="Close chat">×</button>
        </header>

        <div class="history" #history>
          @for (m of messages(); track $index) {
            <div class="msg" [class.user]="m.role === 'user'" [class.ai]="m.role === 'ai'">{{ m.text }}</div>
          }
          @if (loading()) { <div class="msg ai typing">Thinking…</div> }
        </div>

        <div class="input">
          <input [formControl]="input" placeholder="Ask about your expenses…" (keydown.enter)="send()" />
          <button (click)="send()" [disabled]="loading() || !input.value.trim()">Send</button>
        </div>
      </section>
    } @else {
      <button class="fab" (click)="open.set(true)">💬 Ask AI</button>
    }
  `,
  styles: `
    :host { position: fixed; right: 20px; bottom: 20px; z-index: 10; }
    .fab { background: #0f766e; color: #fff; border: 0; padding: 12px 18px; border-radius: 999px; cursor: pointer; font-weight: 600; }
    .panel { width: 340px; height: 460px; background: #fff; border: 1px solid #cbd5e1; border-radius: 12px;
             display: flex; flex-direction: column; box-shadow: 0 8px 30px rgba(0,0,0,.15); overflow: hidden; }
    header { background: #0f766e; color: #fff; padding: 12px; font-weight: 600; display: flex; justify-content: space-between; }
    .close { background: none; border: 0; color: #fff; font-size: 1.2rem; cursor: pointer; }
    .history { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
    .msg { max-width: 80%; padding: 8px 12px; border-radius: 12px; white-space: pre-wrap; }
    .msg.user { align-self: flex-end; background: #0f766e; color: #fff; }
    .msg.ai { align-self: flex-start; background: #f1f5f9; }
    .typing { font-style: italic; color: #64748b; }
    .input { display: flex; gap: 8px; padding: 10px; border-top: 1px solid #e2e8f0; }
    .input input { flex: 1; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; font: inherit; }
    .input button { background: #0f766e; color: #fff; border: 0; border-radius: 8px; padding: 8px 14px; cursor: pointer; }
    .input button:disabled { background: #94a3b8; cursor: not-allowed; }
  `,
})
export class ChatbotComponent {
  private chatbot = inject(AiChatbotService);
  private historyEl = viewChild<ElementRef<HTMLDivElement>>('history');

  open = signal(false);
  loading = signal(false);
  input = new FormControl('', { nonNullable: true });
  messages = signal<ChatMessage[]>([
    { role: 'ai', text: 'Hi! Ask me about your expenses, e.g. "What is my total?"' },
  ]);

  send(): void {
    const text = this.input.value.trim();
    if (!text || this.loading()) return;

    this.messages.update(m => [...m, { role: 'user', text }]);
    this.input.reset('');
    this.loading.set(true);
    this.scrollDown();

    this.chatbot.ask(text).subscribe(reply => {
      this.messages.update(m => [...m, { role: 'ai', text: reply }]);
      this.loading.set(false);
      this.scrollDown();
    });
  }

  private scrollDown(): void {
    setTimeout(() => {
      const el = this.historyEl()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}
