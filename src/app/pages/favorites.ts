import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCard } from '../components/product-card';
import { FavoritesService } from '../services/favorites.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import * as icons from '../icons';
import { TPipe } from '../i18n/t.pipe';


@Component({
  selector: 'app-favorites',
  imports: [RouterLink, ProductCard, FaIconComponent, TPipe],
  template: `
    <div class="container page">
      <h1>{{ 'fav.title' | t }} @if (favs.count()) { <small>({{ favs.count() }})</small> }</h1>
      @if (favs.products().length) {
        <div class="product-grid">
          @for (p of favs.products(); track p.id) { <app-product-card [product]="p" /> }
        </div>
      } @else {
        <div class="empty">
          <div class="emoji"><fa-icon [icon]="i.faHeartOutline" /></div>
          <h3>{{ 'fav.empty' | t }}</h3>
          <p>{{ 'fav.emptyHint' | t }}</p>
          <a routerLink="/" class="btn btn-dark">{{ 'fav.discover' | t }}</a>
        </div>
      }
    </div>
  `,
  styles: `
    h1 { font-size: 20px; margin: 16px 0 12px; }
    h1 small { font-size: 13px; color: var(--muted); font-weight: 400; }
  `,
})
export class Favorites {
  protected readonly favs = inject(FavoritesService);
  protected readonly i = icons;
}
