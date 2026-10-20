import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ProductCard } from '../components/product-card';
import { CatalogService, SortKey } from '../services/catalog.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import * as icons from '../icons';
import { I18nService } from '../i18n/i18n.service';
import { TPipe } from '../i18n/t.pipe';


const PRICE_RANGES = [
  { label: 'list.price0', min: null, max: 5000 },
  { label: 'list.price1', min: 5000, max: 10000 },
  { label: 'list.price2', min: 10000, max: 20000 },
  { label: 'list.price3', min: 20000, max: null },
];

@Component({
  selector: 'app-product-list',
  imports: [RouterLink, ProductCard, FaIconComponent, TPipe],
  template: `
    <div class="container page">
      <nav class="crumbs">
        <a routerLink="/">{{ 'nav.home' | t }}</a> ›
        <span>{{ title() }}</span>
      </nav>
      <div class="head">
        <h1>{{ title() }} <small>({{ 'list.items' | t: { n: results().length } }})</small></h1>
        <button class="btn btn-outline filter-btn" type="button" (click)="showFilters.set(!showFilters())"><fa-icon [icon]="i.faSliders" /> {{ 'list.filters' | t }}</button>
      </div>

      <div class="sorts">
        @for (s of sorts; track s.key) {
          <button type="button" class="chip" [class.active]="sort() === s.key" (click)="setParam('tri', s.key === 'pertinence' ? null : s.key)">{{ 'list.sort.' + s.key | t }}</button>
        }
      </div>

      <div class="layout">
        <aside [class.open]="showFilters()">
          <h3>{{ 'list.category' | t }}</h3>
          <a class="opt" [class.on]="!category()" routerLink="/produits" [queryParams]="{ q: search() || null }">{{ 'list.all' | t }}</a>
          @for (c of catalog.categories; track c.slug) {
            <a class="opt" [class.on]="category() === c.slug" [routerLink]="['/categorie', c.slug]" queryParamsHandling="merge"><fa-icon class="ci" [icon]="c.icon" /> {{ 'cat.' + c.slug | t }}</a>
          }
          <h3>{{ 'list.price' | t }}</h3>
          @for (r of priceRanges; track r.label; let n = $index) {
            <button type="button" class="opt" [class.on]="priceIdx() === n" (click)="setParam('prix', priceIdx() === n ? null : n)">{{ r.label | t }}</button>
          }
          <h3>{{ 'list.rating' | t }}</h3>
          @for (n of [4.5, 4]; track n) {
            <button type="button" class="opt" [class.on]="minRating() === n" (click)="setParam('note', minRating() === n ? null : n)"><fa-icon class="stars" [icon]="i.faStar" /> {{ 'list.ratingMin' | t: { n: n } }}</button>
          }
          <h3>{{ 'list.offers' | t }}</h3>
          <button type="button" class="opt" [class.on]="flashOnly()" (click)="setParam('flash', flashOnly() ? null : 1)"><fa-icon [icon]="i.faBolt" /> {{ 'list.flashOnly' | t }}</button>
          <button type="button" class="btn btn-dark btn-block reset" (click)="reset()">{{ 'list.reset' | t }}</button>
        </aside>

        <div class="results">
          @if (results().length) {
            <div class="product-grid">
              @for (p of results(); track p.id) { <app-product-card [product]="p" /> }
            </div>
          } @else {
            <div class="empty">
              <div class="emoji"><fa-icon [icon]="i.faMagnifyingGlass" /></div>
              <h3>{{ 'list.empty' | t }}</h3>
              <p>{{ 'list.emptyHint' | t }}</p>
              <button class="btn btn-dark" type="button" (click)="reset()">{{ 'list.seeAll' | t }}</button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .crumbs { padding: 12px 0 4px; font-size: 12px; color: var(--muted); }
    .head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    h1 { font-size: 20px; margin: 4px 0 10px; }
    h1 small { font-size: 13px; color: var(--muted); font-weight: 400; }
    .filter-btn { height: 36px; font-size: 13px; }
    .sorts { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; padding-bottom: 12px; }
    .layout { display: grid; gap: 16px; }
    aside { display: none; background: #fff; border-radius: var(--radius); padding: 12px 16px 16px; }
    aside.open { display: block; }
    aside h3 { font-size: 13px; margin: 14px 0 6px; text-transform: uppercase; letter-spacing: .5px; }
    .opt { display: block; width: 100%; text-align: left; padding: 6px 8px; border-radius: 6px; font-size: 13px; color: var(--ink-2); }
    .opt:hover { background: var(--bg); }
    .opt.on { background: var(--ink); color: #fff; }
    .ci { display: inline-block; width: 18px; text-align: center; }
    .reset { margin-top: 16px; height: 38px; }
    @media (min-width: 900px) {
      .layout { grid-template-columns: 230px 1fr; align-items: start; }
      aside { display: block; position: sticky; top: calc(var(--header-h) + 12px); }
      .filter-btn { display: none; }
    }
  `,
})
export class ProductList {
  protected readonly catalog = inject(CatalogService);
  protected readonly i = icons;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly priceRanges = PRICE_RANGES;
  protected readonly sorts: { key: SortKey }[] = [
    { key: 'pertinence' },
    { key: 'ventes' },
    { key: 'nouveautes' },
    { key: 'prix-asc' },
    { key: 'prix-desc' },
    { key: 'note' },
  ];
  protected readonly showFilters = signal(false);
  private readonly i18n = inject(I18nService);

  private readonly params = toSignal(this.route.paramMap.pipe(map((p) => p.get('slug'))));
  private readonly qp = toSignal(this.route.queryParamMap, { requireSync: true });

  protected readonly category = computed(() => this.params() ?? null);
  protected readonly search = computed(() => this.qp().get('q'));
  protected readonly sort = computed(() => (this.qp().get('tri') as SortKey) || 'pertinence');
  protected readonly priceIdx = computed(() => {
    const v = this.qp().get('prix');
    return v == null ? null : Number(v);
  });
  protected readonly minRating = computed(() => {
    const v = this.qp().get('note');
    return v == null ? null : Number(v);
  });
  protected readonly flashOnly = computed(() => this.qp().get('flash') === '1');

  protected readonly title = computed(() => {
    const t = (k: string, p?: Record<string, string>) => this.i18n.t(k, p);
    if (this.search()) return t('list.resultsFor', { q: this.search()! });
    if (this.category()) return t('cat.' + this.category());
    if (this.flashOnly()) return t('home.flash');
    return t('list.allTitle');
  });

  protected readonly results = computed(() => {
    const range = this.priceIdx() != null ? PRICE_RANGES[this.priceIdx()!] : null;
    return this.catalog.query({
      category: this.category(),
      search: this.search(),
      sort: this.sort(),
      minPrice: range?.min,
      maxPrice: range?.max,
      minRating: this.minRating(),
      flashOnly: this.flashOnly(),
    });
  });

  protected setParam(key: string, value: string | number | null): void {
    this.router.navigate([], { queryParams: { [key]: value }, queryParamsHandling: 'merge' });
  }

  protected reset(): void {
    this.router.navigate(['/produits']);
  }
}
