import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import * as icons from '../icons';
import { I18nService } from '../i18n/i18n.service';
import { TPipe } from '../i18n/t.pipe';
import { ShippingMode } from '../models/product';
import { CartService } from '../services/cart.service';
import { FcfaPipe } from '../services/fcfa.pipe';
import { SHOP, whatsappLink } from '../services/shop-info';
import { ToastService } from '../services/toast.service';

/** Libellés du message WhatsApp (destiné à la boutique, en français). */
const SHIPPING_LABEL: Record<ShippingMode, string> = {
  avion: 'Avion (3 à 4 semaines)',
  bateau: 'Bateau (3 à 4 mois)',
};

@Component({
  selector: 'app-cart',
  imports: [RouterLink, FormsModule, FcfaPipe, FaIconComponent, TPipe],
  template: `
    <div class="container page">
      <h1>{{ 'cart.title' | t }} @if (cart.count()) { <small>{{ 'cart.count' | t: { n: cart.count() } }}</small> }</h1>

      @if (cart.lines().length) {
        <div class="layout">
          <div>
            <div class="info-bar">
              <span><fa-icon [icon]="i.faPlane" /> {{ 'ship.air' | t }} : {{ 'ship.airDelay' | t }}</span>
              <span><fa-icon [icon]="i.faShip" /> {{ 'ship.sea' | t }} : {{ 'ship.seaDelay' | t }}</span>
            </div>
            @for (l of cart.lines(); track l.productId + (l.color ?? '') + (l.size ?? '') + (l.shipping ?? '')) {
              <article class="line" [class.missing]="!l.shipping">
                <a [routerLink]="['/produit', l.productId]"><img [src]="l.product.images[0]" [alt]="l.product.title" /></a>
                <div class="body">
                  <a [routerLink]="['/produit', l.productId]" class="title">{{ l.product.title }}</a>
                  @if (l.color || l.size) {
                    <span class="variant">{{ i18n.colorName(l.color) }}{{ l.color && l.size ? ' / ' : '' }}{{ l.size }}</span>
                  }
                  <div class="ship-pick" role="group" [attr.aria-label]="'ship.label' | t">
                    <button type="button" [class.on]="l.shipping === 'avion'" (click)="cart.setShipping(l, 'avion')"><fa-icon [icon]="i.faPlane" /> {{ 'ship.air' | t }}</button>
                    <button type="button" [class.on]="l.shipping === 'bateau'" (click)="cart.setShipping(l, 'bateau')"><fa-icon [icon]="i.faShip" /> {{ 'ship.sea' | t }}</button>
                  </div>
                  <div class="row">
                    <span class="price">{{ l.unitPrice | fcfa }}</span>
                    @if (l.unitPrice < l.product.price) { <span class="badge badge-gold">{{ 'cart.wholesale' | t }}</span> }
                  </div>
                  <div class="row">
                    <div class="qty">
                      <button type="button" (click)="cart.setQty(l, l.qty - 1)" [attr.aria-label]="'detail.decrease' | t"><fa-icon [icon]="i.faMinus" /></button>
                      <input type="number" [value]="l.qty" min="1" (change)="cart.setQty(l, +$any($event.target).value || 1)" [attr.aria-label]="'cart.quantity' | t" />
                      <button type="button" (click)="cart.setQty(l, l.qty + 1)" [attr.aria-label]="'detail.increase' | t"><fa-icon [icon]="i.faPlus" /></button>
                    </div>
                    <button type="button" class="del" (click)="cart.remove(l)" [attr.aria-label]="'cart.remove' | t"><fa-icon [icon]="i.faTrashCan" /></button>
                  </div>
                </div>
              </article>
            }
          </div>

          <aside class="summary">
            <h2>{{ 'cart.summary' | t }}</h2>
            <label>{{ 'cart.name' | t }}
              <input [(ngModel)]="name" name="name" [placeholder]="'cart.namePh' | t" autocomplete="name" />
            </label>
            <label>{{ 'cart.phone' | t }}
              <input [(ngModel)]="phone" name="phone" type="tel" placeholder="+226 ..." autocomplete="tel" />
            </label>
            <label>{{ 'cart.address' | t }}
              <input [(ngModel)]="address" name="address" [placeholder]="'cart.addressPh' | t" autocomplete="address-level2" />
            </label>

            <dl>
              <dt>{{ 'cart.subtotal' | t }}</dt><dd>{{ cart.subtotal() | fcfa }}</dd>
              @if (cart.savings() > 0) { <dt>{{ 'cart.savings' | t }}</dt><dd class="save">−{{ cart.savings() | fcfa }}</dd> }
              <dt>{{ 'cart.transport' | t }}</dt><dd class="muted-dd">{{ 'cart.transportOnArrival' | t }}</dd>
              <dt class="tot">{{ 'cart.total' | t }}</dt><dd class="tot">{{ cart.subtotal() | fcfa }}</dd>
            </dl>

            <div class="om">
              <fa-icon [icon]="i.faMoneyBillWave" />
              <div><b>{{ 'pay.only' | t }}</b><span>{{ shop.orangeMoney }}</span></div>
            </div>

            @if (cart.missingShipping()) {
              <p class="warn"><fa-icon [icon]="i.faCircleExclamation" /> {{ 'cart.missingShipping' | t }}</p>
            }
            <a class="btn btn-wa btn-block" [class.disabled]="cart.missingShipping()" [href]="orderLink()" target="_blank" rel="noopener" (click)="order($event)">
              <fa-icon [icon]="i.faWhatsapp" /> {{ 'cart.order' | t }}
            </a>
            <p class="hint">{{ 'cart.hint' | t: { wa: shop.whatsappDisplay, om: shop.orangeMoney } }}</p>
            @if (ordered()) {
              <button type="button" class="btn btn-outline btn-block" (click)="cart.clear(); ordered.set(false)">{{ 'cart.clear' | t }}</button>
            }
          </aside>
        </div>
      } @else {
        <div class="empty">
          <div class="emoji"><fa-icon [icon]="i.faCartShopping" /></div>
          <h3>{{ 'cart.empty' | t }}</h3>
          <p>{{ 'cart.emptyHint' | t }}</p>
          <a routerLink="/" class="btn btn-dark">{{ 'cart.continue' | t }}</a>
        </div>
      }
    </div>
  `,
  styles: `
    h1 { font-size: 20px; margin: 16px 0 12px; }
    h1 small { font-size: 13px; color: var(--muted); font-weight: 400; }
    .layout { display: grid; gap: 16px; }
    @media (min-width: 900px) { .layout { grid-template-columns: 1fr 360px; align-items: start; } .summary { position: sticky; top: calc(var(--header-h) + 12px); } }
    .info-bar { display: flex; flex-wrap: wrap; gap: 6px 16px; background: #eef4ff; color: #1e4fb3; padding: 10px 12px; border-radius: 8px; font-size: 13px; margin-bottom: 10px; }
    .line { display: flex; gap: 12px; background: #fff; border-radius: var(--radius); padding: 10px; margin-bottom: 10px; border: 1.5px solid transparent; }
    .line.missing { border-color: var(--brand); }
    .line img { width: 92px; height: 122px; object-fit: cover; border-radius: 6px; background: #f4f4f4; }
    .body { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
    .title { font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .variant { font-size: 12px; color: var(--muted); background: var(--bg); align-self: flex-start; padding: 1px 8px; border-radius: 4px; }
    .ship-pick { display: flex; gap: 6px; }
    .ship-pick button { flex: 1; height: 30px; border: 1px solid var(--line); border-radius: 999px; font-size: 12px; background: #fff; color: var(--ink-2); }
    .ship-pick button.on { background: var(--ink); border-color: var(--ink); color: #fff; font-weight: 700; }
    .line.missing .ship-pick button { border-color: var(--brand); }
    .row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .del { font-size: 16px; padding: 6px; color: var(--muted); }
    .summary { background: #fff; border-radius: var(--radius); padding: 16px; }
    .summary h2 { margin: 0 0 12px; font-size: 17px; }
    label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--ink-2); margin-bottom: 10px; }
    input { height: 40px; border: 1px solid var(--line); border-radius: 8px; padding: 0 10px; background: #fff; font-size: 14px; }
    dl { display: grid; grid-template-columns: 1fr auto; gap: 8px; margin: 16px 0; }
    dt { color: var(--ink-2); } dd { margin: 0; text-align: right; font-weight: 600; }
    .muted-dd { color: var(--muted); font-weight: 500; }
    .save { color: var(--ok); }
    .tot { font-size: 17px; font-weight: 800; padding-top: 8px; border-top: 1px solid var(--line); }
    dd.tot { color: var(--brand); }
    .om { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; background: #fff4e5; color: #b35900; margin-bottom: 12px; font-size: 18px; }
    .om div { display: flex; flex-direction: column; font-size: 13px; }
    .om span { font-weight: 800; font-size: 15px; }
    .warn { color: var(--brand); font-size: 13px; font-weight: 600; margin: 0 0 10px; }
    .disabled { opacity: .5; }
    .hint { font-size: 12px; color: var(--muted); }
  `,
})
export class Cart {
  protected readonly cart = inject(CartService);
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  protected readonly i = icons;
  protected readonly shop = SHOP;

  protected readonly name = signal('');
  protected readonly phone = signal('');
  protected readonly address = signal('');
  protected readonly ordered = signal(false);

  protected readonly orderLink = computed(() => {
    const fcfa = (n: number) => n.toLocaleString('fr-FR').replace(/[  ]/g, ' ') + ' FCFA';
    const lines = this.cart.lines().map((l, i) => {
      const variant = [l.color, l.size].filter(Boolean).join(' / ');
      const mode = l.shipping ? SHIPPING_LABEL[l.shipping] : '-';
      return `${i + 1}. ${l.product.title} (réf. SC-${l.productId})${variant ? ` [${variant}]` : ''} × ${l.qty} = ${fcfa(l.total)}\n   Livraison : ${mode}`;
    });
    const msg = [
      '*Nouvelle commande — Stock Chine by Cherifa*',
      '',
      ...lines,
      '',
      `*Total articles : ${fcfa(this.cart.subtotal())}*`,
      'Transport : payé à l\'arrivée du colis',
      '',
      `Nom : ${this.name() || '-'}`,
      `Téléphone : ${this.phone() || '-'}`,
      `Ville / quartier : ${this.address() || '-'}`,
      '',
      `Paiement Orange Money : ${SHOP.orangeMoney}`,
    ].join('\n');
    return whatsappLink(msg);
  });

  /** La commande ne part que si chaque article a un mode de livraison (avion ou bateau). */
  protected order(event: Event): void {
    if (this.cart.missingShipping()) {
      event.preventDefault();
      this.toast.show(this.i18n.t('ship.required'));
      return;
    }
    this.ordered.set(true);
  }
}
