import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import * as icons from '../icons';
import { TPipe } from '../i18n/t.pipe';
import { CatalogService } from '../services/catalog.service';
import { SHOP, whatsappLink } from '../services/shop-info';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, FaIconComponent, TPipe],
  template: `
    <footer>
      <div class="container grid">
        <div>
          <div class="logo">STOCK CHINE <i>by Cherifa</i></div>
          <p>{{ 'footer.about' | t }}</p>
        </div>
        <div>
          <h4>{{ 'nav.categories' | t }}</h4>
          @for (c of catalog.categories.slice(0, 6); track c.slug) {
            <a [routerLink]="['/categorie', c.slug]">{{ 'cat.' + c.slug | t }}</a>
          }
        </div>
        <div>
          <h4>{{ 'footer.service' | t }}</h4>
          <a routerLink="/compte">{{ 'footer.account' | t }}</a>
          <a routerLink="/panier">{{ 'footer.cart' | t }}</a>
          <a routerLink="/favoris">{{ 'footer.favorites' | t }}</a>
          <a [href]="wa" target="_blank" rel="noopener"><fa-icon [icon]="i.faWhatsapp" /> {{ 'footer.orderWa' | t }}</a>
        </div>
        <div>
          <h4>{{ 'footer.contact' | t }}</h4>
          <a [href]="wa" target="_blank" rel="noopener"><fa-icon [icon]="i.faWhatsapp" /> WhatsApp : {{ shop.whatsappDisplay }}</a>
          <p class="pay"><fa-icon [icon]="i.faMoneyBillWave" /> {{ 'pay.only' | t }} : {{ shop.orangeMoney }}</p>
          <p class="pay"><fa-icon [icon]="i.faPlane" /> {{ 'ship.air' | t }} : {{ 'ship.airDelay' | t }}<br />
            <fa-icon [icon]="i.faShip" /> {{ 'ship.sea' | t }} : {{ 'ship.seaDelay' | t }}</p>
          <p class="pay">{{ 'ship.paidOnArrival' | t }}</p>
        </div>
      </div>
      <div class="copy">© {{ year }} Stock Chine by Cherifa — {{ 'footer.rights' | t }}</div>
    </footer>
  `,
  styles: `
    footer { background: var(--ink); color: #cfcfcf; margin-top: 24px; padding: 32px 0 calc(var(--bottom-nav-h) + 16px); font-size: 13px; }
    @media (min-width: 900px) { footer { padding-bottom: 16px; } }
    .grid { display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
    .logo { color: #fff; font-weight: 900; font-size: 18px; letter-spacing: 1px; }
    .logo i { font-family: Georgia, serif; font-weight: 400; font-size: 13px; color: var(--gold); }
    h4 { color: #fff; margin: 0 0 10px; }
    a { display: block; padding: 3px 0; }
    a:hover { color: #fff; }
    .pay { color: #9a9a9a; margin: 8px 0 0; }
    .copy { text-align: center; border-top: 1px solid #2c2c2c; margin-top: 24px; padding-top: 16px; color: #8a8a8a; }
  `,
})
export class Footer {
  protected readonly shop = SHOP;
  protected readonly i = icons;
  protected readonly catalog = inject(CatalogService);
  protected readonly wa = whatsappLink('Bonjour Stock Chine by Cherifa, je souhaite passer une commande.');
  protected readonly year = new Date().getFullYear();
}
