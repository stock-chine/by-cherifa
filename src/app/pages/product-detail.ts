import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { ProductCard } from '../components/product-card';
import * as icons from '../icons';
import { I18nService } from '../i18n/i18n.service';
import { TPipe } from '../i18n/t.pipe';
import { ShippingMode } from '../models/product';
import { CartService, unitPriceFor } from '../services/cart.service';
import { CatalogService } from '../services/catalog.service';
import { FavoritesService } from '../services/favorites.service';
import { FcfaPipe } from '../services/fcfa.pipe';
import { HistoryService } from '../services/history.service';
import { SHOP, whatsappLink } from '../services/shop-info';
import { ToastService } from '../services/toast.service';

const REVIEWERS = ['Aminata K.', 'Fatou O.', 'Mariam S.', 'Ibrahim T.', 'Awa D.', 'Salif Z.', 'Rasmata B.', 'Issouf C.'];
const COMMENTS = [
  'Très bonne qualité, conforme aux photos. Je recommande !',
  'Article bien emballé, arrivé en bon état.',
  'Bon rapport qualité/prix, je vais recommander.',
  'Belle matière, la coupe oversize est parfaite. Merci Cherifa !',
  'Conforme à la description, taille correcte.',
  'Service client au top sur WhatsApp, très réactive.',
];

/** Libellé du mode de livraison dans le message WhatsApp (destiné à la boutique, en français). */
const SHIPPING_LABEL: Record<ShippingMode, string> = {
  avion: 'Avion (3 à 4 semaines)',
  bateau: 'Bateau (3 à 4 mois)',
};

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, ProductCard, FcfaPipe, FaIconComponent, TPipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  /** Paramètre de route `:id` (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly catalog = inject(CatalogService);
  private readonly cart = inject(CartService);
  private readonly history = inject(HistoryService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  protected readonly favs = inject(FavoritesService);
  protected readonly i18n = inject(I18nService);
  protected readonly i = icons;
  protected readonly shop = SHOP;

  protected readonly product = computed(() => this.catalog.getProduct(Number(this.id())));
  protected readonly similar = computed(() => {
    const p = this.product();
    return p ? this.catalog.similar(p) : [];
  });

  protected readonly imageIdx = signal(0);
  protected readonly color = signal<string | undefined>(undefined);
  protected readonly size = signal<string | undefined>(undefined);
  protected readonly shipping = signal<ShippingMode | undefined>(undefined);
  protected readonly qty = signal(1);
  protected readonly tab = signal<'desc' | 'specs' | 'avis'>('desc');
  protected readonly needSize = signal(false);
  protected readonly needShipping = signal(false);

  protected readonly unitPrice = computed(() => {
    const p = this.product();
    return p ? unitPriceFor(p, this.qty()) : 0;
  });
  protected readonly discount = computed(() => {
    const p = this.product();
    return p?.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  });

  protected readonly reviews = computed(() => {
    const p = this.product();
    if (!p || !p.reviews) return [];
    return Array.from({ length: 4 }, (_, i) => {
      const k = (p.id + i * 3) % 97;
      return {
        name: REVIEWERS[k % REVIEWERS.length],
        rating: k % 5 === 0 ? 4 : 5,
        text: COMMENTS[k % COMMENTS.length],
        date: `${1 + (k % 27)}/${1 + (i % 9)}/2026`,
        variant: [this.i18n.colorName(p.colors?.[k % p.colors.length]?.name), p.sizes?.[k % p.sizes.length]]
          .filter(Boolean)
          .join(' / '),
      };
    });
  });

  /** Étoiles pleines / demi / vides pour une note sur 5. */
  protected stars(rating: number): IconDefinition[] {
    return [1, 2, 3, 4, 5].map((n) =>
      rating >= n ? icons.faStar : rating >= n - 0.5 ? icons.faStarHalfStroke : icons.faStarOutline,
    );
  }

  constructor() {
    // Réinitialise la sélection quand on passe d'un produit à l'autre.
    effect(() => {
      const p = this.product();
      this.imageIdx.set(0);
      this.qty.set(1);
      this.size.set(undefined);
      this.shipping.set(undefined);
      this.needSize.set(false);
      this.needShipping.set(false);
      this.color.set(p?.colors?.[0]?.name);
      if (p) this.history.track(p.id);
      window.scrollTo({ top: 0 });
    });
  }

  protected setQty(value: number): void {
    const p = this.product();
    if (!p || Number.isNaN(value)) return;
    this.qty.set(Math.min(Math.max(1, Math.floor(value)), p.stock));
  }

  /** Taille (si l'article en a) et mode de livraison sont obligatoires pour commander. */
  private validVariant(): boolean {
    const p = this.product();
    const missingSize = !!p?.sizes?.length && !this.size();
    const missingShipping = !this.shipping();
    this.needSize.set(missingSize);
    this.needShipping.set(missingShipping);
    if (missingSize) this.toast.show(this.i18n.t('toast.chooseSize'));
    else if (missingShipping) this.toast.show(this.i18n.t('ship.required'));
    return !missingSize && !missingShipping;
  }

  /** Empêche l'ouverture de WhatsApp tant que taille / livraison ne sont pas choisies. */
  protected checkBeforeWhatsapp(event: Event): void {
    if (!this.validVariant()) event.preventDefault();
  }

  private addCurrent(): boolean {
    const p = this.product();
    if (!p || !this.validVariant()) return false;
    this.cart.add({
      productId: p.id,
      qty: this.qty(),
      color: this.color(),
      size: this.size(),
      shipping: this.shipping(),
    });
    return true;
  }

  protected addToCart(): void {
    if (this.addCurrent()) this.toast.show(this.i18n.t('toast.added'));
  }

  protected buyNow(): void {
    if (this.addCurrent()) this.router.navigate(['/panier']);
  }

  protected whatsapp(): string {
    const p = this.product();
    if (!p) return '';
    const variant = [this.color(), this.size()].filter(Boolean).join(', ');
    const mode = this.shipping();
    return whatsappLink(
      `Bonjour Stock Chine by Cherifa,\nJe suis intéressé(e) par : ${p.title} (réf. SC-${p.id})` +
        `${variant ? `\nVariante : ${variant}` : ''}\nQuantité : ${this.qty()}` +
        `\nLivraison : ${mode ? SHIPPING_LABEL[mode] : '-'}\n${location.href}`,
    );
  }

  protected async share(): Promise<void> {
    const p = this.product();
    if (!p) return;
    const data = { title: p.title, text: this.i18n.t('detail.shareText', { t: p.title }), url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(location.href);
        this.toast.show(this.i18n.t('toast.linkCopied'));
      }
    } catch {
      // Partage annulé par l'utilisateur.
    }
  }
}
