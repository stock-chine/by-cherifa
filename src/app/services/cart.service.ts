import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { CartItem, Product, ShippingMode } from '../models/product';
import { CatalogService } from './catalog.service';
import { loadJson, saveJson } from './storage';

export interface CartLine extends CartItem {
  product: Product;
  unitPrice: number;
  total: number;
}

/** Prix unitaire selon la quantité (tarifs dégressifs façon grossiste). */
export function unitPriceFor(product: Product, qty: number): number {
  let price = product.price;
  for (const tier of product.wholesale) {
    if (qty >= tier.min) price = tier.price;
  }
  return price;
}

const sameVariant = (a: CartItem, b: CartItem) =>
  a.productId === b.productId && a.color === b.color && a.size === b.size && a.shipping === b.shipping;

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly catalog = inject(CatalogService);
  private readonly items = signal<CartItem[]>(loadJson('sc-cart', []));

  readonly lines = computed<CartLine[]>(() =>
    this.items()
      .map((item) => {
        const product = this.catalog.getProduct(item.productId);
        if (!product) return null;
        const unitPrice = unitPriceFor(product, item.qty);
        return { ...item, product, unitPrice, total: unitPrice * item.qty };
      })
      .filter((l): l is CartLine => l !== null),
  );

  /** Vrai si au moins un article n'a pas encore de mode de livraison (anciens paniers). */
  readonly missingShipping = computed(() => this.items().some((i) => !i.shipping));

  readonly count = computed(() => this.items().reduce((n, i) => n + i.qty, 0));
  readonly subtotal = computed(() => this.lines().reduce((s, l) => s + l.total, 0));
  readonly savings = computed(() =>
    this.lines().reduce(
      (s, l) => s + ((l.product.oldPrice ?? l.product.price) - l.unitPrice) * l.qty,
      0,
    ),
  );

  constructor() {
    effect(() => saveJson('sc-cart', this.items()));
  }

  add(item: CartItem): void {
    this.items.update((list) => {
      const existing = list.find((i) => sameVariant(i, item));
      return existing
        ? list.map((i) => (i === existing ? { ...i, qty: i.qty + item.qty } : i))
        : [...list, item];
    });
  }

  setQty(item: CartItem, qty: number): void {
    if (qty < 1) return this.remove(item);
    this.items.update((list) => list.map((i) => (sameVariant(i, item) ? { ...i, qty } : i)));
  }

  /** Change le mode de livraison d'une ligne (fusionne avec une ligne identique existante). */
  setShipping(item: CartItem, shipping: ShippingMode): void {
    const target = { ...item, shipping };
    this.items.update((list) => {
      const rest = list.filter((i) => !sameVariant(i, item));
      const twin = rest.find((i) => sameVariant(i, target));
      return twin
        ? rest.map((i) => (i === twin ? { ...i, qty: i.qty + item.qty } : i))
        : list.map((i) => (sameVariant(i, item) ? { ...i, shipping } : i));
    });
  }

  remove(item: CartItem): void {
    this.items.update((list) => list.filter((i) => !sameVariant(i, item)));
  }

  clear(): void {
    this.items.set([]);
  }
}
