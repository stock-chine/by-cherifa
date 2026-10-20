import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import * as icons from '../icons';
import { TPipe } from '../i18n/t.pipe';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive, FaIconComponent, TPipe],
  template: `
    <nav [attr.aria-label]="'nav.main' | t">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
        <span class="i"><fa-icon [icon]="i.faHouse" /></span>{{ 'nav.home' | t }}
      </a>
      <a routerLink="/categories" routerLinkActive="active"><span class="i"><fa-icon [icon]="i.faTableCellsLarge" /></span>{{ 'nav.categories' | t }}</a>
      <a routerLink="/produits" [queryParams]="{ flash: 1 }"><span class="i"><fa-icon [icon]="i.faBolt" /></span>{{ 'nav.flash' | t }}</a>
      <a routerLink="/panier" routerLinkActive="active">
        <span class="i"><fa-icon [icon]="i.faCartShopping" />@if (cart.count()) {<b>{{ cart.count() }}</b>}</span>{{ 'nav.cart' | t }}
      </a>
      <a routerLink="/compte" routerLinkActive="active"><span class="i"><fa-icon [icon]="i.faUser" /></span>{{ 'nav.me' | t }}</a>
    </nav>
  `,
  styles: `
    nav { position: fixed; bottom: 0; left: 0; right: 0; z-index: 60; height: var(--bottom-nav-h); padding-bottom: env(safe-area-inset-bottom); background: #fff; border-top: 1px solid var(--line); display: grid; grid-template-columns: repeat(5, 1fr); }
    a { display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 11px; color: var(--muted); gap: 2px; }
    a.active { color: var(--ink); font-weight: 700; }
    .i { font-size: 19px; position: relative; line-height: 1; }
    b { position: absolute; top: -6px; right: -12px; min-width: 16px; height: 16px; border-radius: 8px; background: var(--brand); color: #fff; font-size: 10px; display: grid; place-items: center; padding: 0 3px; }
    @media (min-width: 900px) { nav { display: none; } }
  `,
})
export class BottomNav {
  protected readonly cart = inject(CartService);
  protected readonly i = icons;
}
