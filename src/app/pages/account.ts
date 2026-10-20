import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { LangSwitch } from '../components/lang-switch';
import { ProductCard } from '../components/product-card';
import * as icons from '../icons';
import { TPipe } from '../i18n/t.pipe';
import { CartService } from '../services/cart.service';
import { CatalogService } from '../services/catalog.service';
import { FavoritesService } from '../services/favorites.service';
import { HistoryService } from '../services/history.service';
import { SHOP, whatsappLink } from '../services/shop-info';

@Component({
  selector: 'app-account',
  imports: [RouterLink, ProductCard, FaIconComponent, TPipe, LangSwitch],
  template: `
    <div class="container page">
      <section class="hero">
        <div class="avatar"><fa-icon [icon]="i.faUser" /></div>
        <div>
          <h1>{{ 'acc.welcome' | t }}</h1>
          <p>{{ 'acc.tagline' | t }}</p>
        </div>
      </section>

      <div class="stats">
        <a routerLink="/panier"><b>{{ cart.count() }}</b>{{ 'acc.cart' | t }}</a>
        <a routerLink="/favoris"><b>{{ favs.count() }}</b>{{ 'acc.favorites' | t }}</a>
        <a routerLink="/produits"><b>{{ total() }}</b>{{ 'acc.items' | t }}</a>
      </div>

      <section class="section lang">
        <h2><fa-icon [icon]="i.faGlobe" /> {{ 'lang.label' | t }}</h2>
        <app-lang-switch />
      </section>

      <section class="section">
        <div class="section-head"><h2>{{ 'acc.contact' | t }}</h2></div>
        <div class="contacts">
          <a class="contact" [href]="wa" target="_blank" rel="noopener">
            <span class="badge-ic wa"><fa-icon [icon]="i.faWhatsapp" /></span>
            <div><b>{{ 'acc.waTitle' | t }}</b><span>{{ shop.whatsappDisplay }}</span></div>
            <span class="btn btn-wa">WhatsApp</span>
          </a>
          <div class="contact">
            <span class="badge-ic om"><fa-icon [icon]="i.faMoneyBillWave" /></span>
            <div><b>{{ 'acc.omTitle' | t }}</b><span>{{ shop.orangeMoney }}</span></div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-head"><h2>{{ 'acc.how' | t }}</h2></div>
        <ol class="steps">
          <li><b>{{ 'acc.step1b' | t }}</b> {{ 'acc.step1' | t }}</li>
          <li><b>{{ 'acc.step2b' | t }}</b> {{ 'acc.step2' | t }}</li>
          <li><b>{{ 'acc.step3b' | t }}</b> {{ 'acc.step3' | t: { om: shop.orangeMoney } }}</li>
          <li><b>{{ 'acc.step4b' | t }}</b> {{ 'acc.step4' | t }}</li>
        </ol>
        <p class="note">{{ 'acc.note' | t }}</p>
      </section>

      @if (history.products().length) {
        <section class="section">
          <div class="section-head"><h2>{{ 'acc.recent' | t }}</h2></div>
          <div class="h-scroll">
            @for (p of history.products(); track p.id) { <app-product-card [product]="p" /> }
          </div>
        </section>
      }

      <a routerLink="/admin" class="admin-link"><fa-icon [icon]="i.faUserGear" /> {{ 'acc.admin' | t }}</a>
    </div>
  `,
  styles: `
    .hero { display: flex; align-items: center; gap: 14px; margin-top: 12px; padding: 20px 16px; border-radius: var(--radius); background: linear-gradient(120deg, #161616, #4a1c1c); color: #fff; }
    .avatar { width: 56px; height: 56px; border-radius: 50%; background: #fff; display: grid; place-items: center; font-size: 24px; color: var(--ink); }
    h1 { margin: 0; font-size: 18px; }
    .hero p { margin: 2px 0 0; color: var(--gold); font-style: italic; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); background: #fff; border-radius: var(--radius); margin-top: 12px; }
    .stats a { display: flex; flex-direction: column; align-items: center; padding: 14px 0; font-size: 12px; color: var(--ink-2); }
    .stats b { font-size: 20px; color: var(--ink); }
    .lang { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .lang h2 { margin: 0; font-size: 15px; }
    .contacts { display: grid; gap: 10px; }
    @media (min-width: 700px) { .contacts { grid-template-columns: 1fr 1fr; } }
    .contact { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--line); border-radius: 10px; }
    .contact div { flex: 1; display: flex; flex-direction: column; }
    .contact div span { color: var(--ink-2); font-weight: 600; }
    .badge-ic { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; font-size: 20px; color: #fff; }
    .badge-ic.wa { background: #25d366; }
    .badge-ic.om { background: #ff7900; }
    .contact .btn { height: 36px; font-size: 13px; padding: 0 14px; }
    .steps { margin: 0; padding-left: 20px; display: grid; gap: 8px; color: var(--ink-2); }
    .admin-link { display: block; text-align: center; margin: 24px 0 8px; color: var(--muted); font-size: 13px; }
    .note { background: #fff6ef; padding: 10px 12px; border-radius: 8px; font-size: 13px; margin: 14px 0 0; }
  `,
})
export class Account {
  protected readonly shop = SHOP;
  protected readonly i = icons;
  protected readonly cart = inject(CartService);
  protected readonly favs = inject(FavoritesService);
  protected readonly history = inject(HistoryService);
  private readonly catalog = inject(CatalogService);
  protected readonly total = computed(() => this.catalog.products().length);
  protected readonly wa = whatsappLink('Bonjour Stock Chine by Cherifa !');
}
