import { effect, inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { I18nService } from './i18n.service';

/** Les titres de route sont des clés de traduction (`title.home`…) ; retraduits au changement de langue. */
@Injectable({ providedIn: 'root' })
export class I18nTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly i18n = inject(I18nService);
  private current = 'title.home';

  constructor() {
    super();
    effect(() => {
      this.i18n.lang();
      this.title.setTitle(this.i18n.t(this.current));
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.current = this.buildTitle(snapshot) ?? 'title.home';
    this.title.setTitle(this.i18n.t(this.current));
  }
}
