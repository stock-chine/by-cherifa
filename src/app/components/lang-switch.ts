import { Component, inject, input } from '@angular/core';
import { I18nService, LANGUAGES } from '../i18n/i18n.service';
import { TPipe } from '../i18n/t.pipe';

/** Boutons FR / EN / 中文. */
@Component({
  selector: 'app-lang-switch',
  imports: [TPipe],
  template: `
    <div class="switch" role="group" [attr.aria-label]="'lang.label' | t" [class.dark]="dark()">
      @for (l of languages; track l.code) {
        <button type="button" [class.on]="i18n.lang() === l.code" [attr.lang]="l.html" (click)="i18n.setLang(l.code)">{{ l.label }}</button>
      }
    </div>
  `,
  styles: `
    .switch { display: inline-flex; border: 1px solid var(--line); border-radius: 999px; overflow: hidden; background: #fff; }
    button { padding: 4px 10px; font-size: 12px; font-weight: 600; color: var(--ink-2); line-height: 1.4; }
    button.on { background: var(--ink); color: #fff; }
    .dark { border-color: #444; background: transparent; }
    .dark button { color: #ccc; padding: 2px 8px; font-size: 11px; }
    .dark button.on { background: #fff; color: var(--ink); }
  `,
})
export class LangSwitch {
  /** Variante pour fond sombre (bandeau du haut). */
  readonly dark = input(false);
  protected readonly i18n = inject(I18nService);
  protected readonly languages = LANGUAGES;
}
