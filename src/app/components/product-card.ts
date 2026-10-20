import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../models/product';
import { FavoritesService } from '../services/favorites.service';
import { FcfaPipe } from '../services/fcfa.pipe';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faBolt, faHeart, faHeartOutline, faStar } from '../icons';
import { TPipe } from '../i18n/t.pipe';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, FcfaPipe, FaIconComponent, TPipe],
  template: `
    @let p = product();
    <a class="card" [routerLink]="['/produit', p.id]">
      <div class="thumb">
        <img [src]="p.images[0]" [alt]="p.title" loading="lazy" />
        @if (discount(); as d) { <span class="badge off">-{{ d }}%</span> }
        @if (p.isNew) { <span class="badge badge-new tag">{{ 'card.new' | t }}</span> }
        <button
          type="button"
          class="fav"
          [class.on]="favs.has(p.id)"
          [attr.aria-label]="(favs.has(p.id) ? 'card.favRemove' : 'card.favAdd') | t"
          (click)="toggleFav($event)"
        ><fa-icon [icon]="favs.has(p.id) ? icons.faHeart : icons.faHeartOutline" /></button>
      </div>
      <div class="info">
        <h3>{{ p.title }}</h3>
        <div class="prices">
          <span class="price">{{ p.price | fcfa }}</span>
          @if (p.oldPrice) { <span class="old-price">{{ p.oldPrice | fcfa }}</span> }
        </div>
        <div class="meta">
          <span><fa-icon class="stars" [icon]="icons.faStar" /> {{ p.rating }}</span>
          <span>{{ 'card.sold' | t: { n: soldLabel() } }}</span>
        </div>
        @if (p.flash) { <div class="flash"><fa-icon [icon]="icons.faBolt" /> {{ 'card.flash' | t }}</div> }
      </div>
    </a>
  `,
  styles: `
    .card { display: flex; flex-direction: column; height: 100%; background: #fff; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); transition: transform .15s; }
    .card:hover { transform: translateY(-2px); }
    .thumb { position: relative; aspect-ratio: 3 / 4; background: #f2f2f2; }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .off { position: absolute; top: 8px; left: 0; border-radius: 0 4px 4px 0; }
    .tag { position: absolute; bottom: 8px; left: 8px; }
    .fav { position: absolute; top: 6px; right: 6px; width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,.92); font-size: 16px; line-height: 1; color: var(--ink); }
    .fav.on { color: var(--brand); }
    .info { padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 4px; }
    h3 { margin: 0; font-size: 13px; font-weight: 500; color: var(--ink-2); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.9em; }
    .prices { display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
    .price { font-size: 15px; }
    .meta { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted); }
    .flash { font-size: 11px; color: var(--accent); font-weight: 700; }
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();
  protected readonly favs = inject(FavoritesService);
  protected readonly icons = { faBolt, faHeart, faHeartOutline, faStar };

  protected readonly discount = computed(() => {
    const p = this.product();
    return p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  });

  protected readonly soldLabel = computed(() => {
    const n = this.product().sold;
    return n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')}k+` : `${n}`;
  });

  protected toggleFav(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favs.toggle(this.product().id);
  }
}
