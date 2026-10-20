import { inject, Pipe, PipeTransform } from '@angular/core';
import { I18nService } from './i18n.service';

/**
 * `{{ 'cart.title' | t }}` ou `{{ 'list.items' | t: { n: 12 } }}`.
 * Impure : la langue est un signal lu pendant le rendu, la vue se met à jour quand elle change.
 */
@Pipe({ name: 't', pure: false })
export class TPipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
