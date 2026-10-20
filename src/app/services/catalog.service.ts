import { computed, inject, Injectable, signal } from '@angular/core';
import { CATEGORIES } from '../data/categories.data';
import { PRODUCTS } from '../data/products.data';
import { allCategoryNames } from '../i18n/i18n.service';
import { Category, Product } from '../models/product';
import { loadJson, saveJson } from './storage';
import { ProductRow, rowToProduct, SupabaseService } from './supabase.service';

export type SortKey = 'pertinence' | 'prix-asc' | 'prix-desc' | 'ventes' | 'note' | 'nouveautes';

export interface ProductQuery {
  category?: string | null;
  search?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  minRating?: number | null;
  flashOnly?: boolean;
  sort?: SortKey;
}

const CACHE_KEY = 'sc-products-cache';

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly supabase = inject(SupabaseService);

  readonly categories = CATEGORIES;

  /**
   * Catalogue affiché. Avec Supabase : dernier catalogue mis en cache (affichage instantané),
   * remplacé dès que la base répond. Sans Supabase : catalogue embarqué.
   */
  readonly products = signal<Product[]>(
    this.supabase.enabled ? loadJson<Product[]>(CACHE_KEY, []) : PRODUCTS,
  );
  /** Vrai tant que le catalogue n'a jamais été chargé sur cet appareil. */
  readonly loading = signal(this.supabase.enabled && this.products().length === 0);

  private readonly byId = computed(() => new Map(this.products().map((p) => [p.id, p])));

  readonly flashSales = computed(() => this.products().filter((p) => p.flash && p.oldPrice));
  readonly newArrivals = computed(() => this.products().filter((p) => p.isNew));
  readonly bestSellers = computed(() =>
    [...this.products()].sort((a, b) => b.sold - a.sold).slice(0, 12),
  );

  constructor() {
    this.refresh();
  }

  /** Recharge le catalogue depuis Supabase (articles en ligne uniquement). */
  async refresh(): Promise<void> {
    const client = this.supabase.client;
    if (!client) return;
    const { data, error } = await client
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });
    if (error || !data) {
      console.error('Catalogue indisponible', error);
      // Hors ligne et jamais chargé : on affiche le catalogue embarqué.
      if (!this.products().length) this.products.set(PRODUCTS);
    } else {
      const list = (data as ProductRow[]).map((r) => {
        const { active: _active, ...product } = rowToProduct(r);
        return product;
      });
      this.products.set(list);
      saveJson(CACHE_KEY, list);
    }
    this.loading.set(false);
  }

  getProduct(id: number): Product | undefined {
    return this.byId().get(id);
  }

  getCategory(slug: string | null | undefined): Category | undefined {
    return this.categories.find((c) => c.slug === slug);
  }

  similar(product: Product, limit = 12): Product[] {
    return this.products()
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, limit);
  }

  query(q: ProductQuery): Product[] {
    const terms = q.search ? normalize(q.search).split(/\s+/).filter(Boolean) : [];
    let list = this.products().filter((p) => {
      if (q.category && p.category !== q.category) return false;
      if (q.minPrice != null && p.price < q.minPrice) return false;
      if (q.maxPrice != null && p.price > q.maxPrice) return false;
      if (q.minRating != null && p.rating < q.minRating) return false;
      if (q.flashOnly && !p.flash) return false;
      if (terms.length) {
        const cat = allCategoryNames(p.category);
        const hay = normalize(`${p.title} ${p.brand ?? ''} ${cat}`);
        if (!terms.every((t) => hay.includes(t))) return false;
      }
      return true;
    });
    switch (q.sort) {
      case 'prix-asc': list = [...list].sort((a, b) => a.price - b.price); break;
      case 'prix-desc': list = [...list].sort((a, b) => b.price - a.price); break;
      case 'ventes': list = [...list].sort((a, b) => b.sold - a.sold); break;
      case 'note': list = [...list].sort((a, b) => b.rating - a.rating); break;
      case 'nouveautes': list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew)); break;
    }
    return list;
  }
}
