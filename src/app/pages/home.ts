import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ProductCard } from '../components/product-card';
import * as icons from '../icons';
import { TPipe } from '../i18n/t.pipe';
import { CatalogService } from '../services/catalog.service';
import { HistoryService } from '../services/history.service';
import { whatsappLink } from '../services/shop-info';

interface Slide {
  /** Préfixe des clés de traduction : `home.slideN`. */
  key: string;
  link: string[];
  query?: Record<string, string | number>;
  image: string;
  bg: string;
}

const PAGE_SIZE = 20;
const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=70`;

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCard, FaIconComponent, TPipe],
  template: `
    <div class="container page">
      <!-- Bannière -->
      <section class="hero" aria-roledescription="carrousel">
        @for (s of slides; track s.key; let n = $index) {
          <a class="slide" [class.on]="n === slide()" [style.background]="s.bg" [routerLink]="s.link" [queryParams]="s.query">
            <div class="txt">
              <span class="kicker">STOCK CHINE by Cherifa</span>
              <h1>{{ s.key + '.title' | t }}</h1>
              <p>{{ s.key + '.sub' | t }}</p>
              <span class="btn btn-dark">{{ s.key + '.cta' | t }} <fa-icon [icon]="i.faArrowRight" /></span>
            </div>
            <img [src]="s.image" [alt]="s.key + '.title' | t" />
          </a>
        }
        <div class="dots">
          @for (s of slides; track s.key; let n = $index) {
            <button type="button" [class.on]="n === slide()" (click)="slide.set(n)" [attr.aria-label]="'home.slideAria' | t: { n: n + 1 }"></button>
          }
        </div>
      </section>

      <!-- Avantages -->
      <div class="perks">
        <span><fa-icon [icon]="i.faPlane" /> {{ 'home.perk.air' | t }}</span>
        <span><fa-icon [icon]="i.faShip" /> {{ 'home.perk.sea' | t }}</span>
        <span><fa-icon [icon]="i.faMoneyBillWave" /> {{ 'home.perk.payment' | t }}</span>
        <span><fa-icon [icon]="i.faBoxesStacked" /> {{ 'home.perk.wholesale' | t }}</span>
      </div>

      <!-- Catégories -->
      <section class="section">
        <div class="section-head"><h2>{{ 'home.categories' | t }}</h2><a routerLink="/categories">{{ 'home.seeAll' | t }} ›</a></div>
        <div class="cat-grid">
          @for (c of catalog.categories; track c.slug) {
            <a [routerLink]="['/categorie', c.slug]" class="cat">
              <img [src]="c.image" [alt]="'cat.' + c.slug | t" loading="lazy" />
              <span>{{ 'cat.' + c.slug | t }}</span>
            </a>
          }
        </div>
      </section>

      <!-- Ventes flash -->
      <section class="section flash">
        <div class="section-head">
          <h2><fa-icon class="hot" [icon]="i.faBolt" /> {{ 'home.flash' | t }}
            <span class="timer">{{ 'home.endsIn' | t }} <b>{{ countdown().h }}</b>:<b>{{ countdown().m }}</b>:<b>{{ countdown().s }}</b></span>
          </h2>
          <a routerLink="/produits" [queryParams]="{ flash: 1 }">{{ 'home.seeAll' | t }} ›</a>
        </div>
        <div class="h-scroll">
          @for (p of flash(); track p.id) { <app-product-card [product]="p" /> }
        </div>
      </section>

      <!-- Grossiste -->
      <a class="wholesale" [href]="waWholesale" target="_blank" rel="noopener">
        <div>
          <b>{{ 'home.reseller.title' | t }}</b>
          <span>{{ 'home.reseller.text' | t }}</span>
        </div>
        <span class="btn btn-wa"><fa-icon [icon]="i.faWhatsapp" /> WhatsApp</span>
      </a>

      <!-- Meilleures ventes -->
      <section class="section">
        <div class="section-head"><h2><fa-icon class="hot" [icon]="i.faFire" /> {{ 'home.best' | t }}</h2><a routerLink="/produits" [queryParams]="{ tri: 'ventes' }">{{ 'home.seeAll' | t }} ›</a></div>
        <div class="h-scroll">
          @for (p of best(); track p.id) { <app-product-card [product]="p" /> }
        </div>
      </section>

      <!-- Nouveautés -->
      <section class="section">
        <div class="section-head"><h2><fa-icon class="hot" [icon]="i.faWandMagicSparkles" /> {{ 'home.new' | t }}</h2><a routerLink="/produits" [queryParams]="{ tri: 'nouveautes' }">{{ 'home.seeAll' | t }} ›</a></div>
        <div class="h-scroll">
          @for (p of fresh(); track p.id) { <app-product-card [product]="p" /> }
        </div>
      </section>

      @if (history.products().length) {
        <section class="section">
          <div class="section-head"><h2><fa-icon class="hot" [icon]="i.faEye" /> {{ 'home.recent' | t }}</h2></div>
          <div class="h-scroll">
            @for (p of history.products(); track p.id) { <app-product-card [product]="p" /> }
          </div>
        </section>
      }

      <!-- Pour vous -->
      <div class="section-head foryou"><h2>{{ 'home.forYou' | t }}</h2></div>
      <div class="product-grid">
        @for (p of forYou(); track p.id) { <app-product-card [product]="p" /> }
      </div>
      @if (forYou().length < feed().length) {
        <div class="more"><button class="btn btn-outline" type="button" (click)="shown.update(n => n + 20)">{{ 'home.more' | t }}</button></div>
      }
    </div>
  `,
  styles: `
    .hero { position: relative; margin-top: 12px; border-radius: 14px; overflow: hidden; height: 230px; }
    @media (min-width: 900px) { .hero { height: 340px; } }
    .slide { position: absolute; inset: 0; display: flex; align-items: center; justify-content: space-between; padding: 0 6%; opacity: 0; transition: opacity .6s; pointer-events: none; }
    .slide.on { opacity: 1; pointer-events: auto; }
    .txt { max-width: 55%; z-index: 1; }
    .kicker { font-size: 11px; letter-spacing: 2px; font-weight: 700; color: var(--brand); }
    h1 { margin: 6px 0; font-size: clamp(20px, 4vw, 40px); line-height: 1.1; font-weight: 900; }
    .txt p { margin: 0 0 14px; color: var(--ink-2); }
    .txt .btn { height: 38px; font-size: 13px; }
    .slide img { position: absolute; right: 0; top: 0; height: 100%; width: 50%; object-fit: cover; -webkit-mask-image: linear-gradient(90deg, transparent, #000 35%); mask-image: linear-gradient(90deg, transparent, #000 35%); }
    .dots { position: absolute; bottom: 10px; left: 0; right: 0; display: flex; justify-content: center; gap: 6px; }
    .dots button { width: 8px; height: 8px; border-radius: 4px; background: rgba(0,0,0,.25); transition: width .3s; }
    .dots button.on { width: 22px; background: var(--ink); }
    .perks { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 12px; }
    @media (min-width: 700px) { .perks { grid-template-columns: repeat(4, 1fr); } }
    .perks fa-icon, .hot { color: var(--brand); }
    .perks span { background: #fff; border-radius: 8px; padding: 8px 10px; font-size: 12px; font-weight: 600; text-align: center; }
    .cat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px 8px; }
    @media (min-width: 900px) { .cat-grid { grid-template-columns: repeat(10, 1fr); } }
    .cat { display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; font-size: 11px; }
    .cat img { width: 100%; max-width: 76px; aspect-ratio: 1; border-radius: 50%; object-fit: cover; background: #f2f2f2; border: 1px solid var(--line); }
    .flash { background: linear-gradient(180deg, #fff1ec, #fff 120px); }
    .timer { font-size: 12px; font-weight: 500; margin-left: 8px; color: var(--ink-2); }
    .timer b { background: var(--ink); color: #fff; border-radius: 4px; padding: 1px 4px; }
    .wholesale { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: linear-gradient(90deg, #161616, #3a1d1d); color: #fff; border-radius: var(--radius); padding: 16px; }
    .wholesale div { display: flex; flex-direction: column; gap: 4px; }
    .wholesale span:not(.btn) { color: #ddd; font-size: 13px; }
    .foryou { margin-top: 20px; justify-content: center; }
    .more { display: flex; justify-content: center; margin-top: 20px; }
  `,
})
export class Home {
  protected readonly catalog = inject(CatalogService);
  protected readonly i = icons;
  protected readonly history = inject(HistoryService);

  protected readonly flash = this.catalog.flashSales;
  protected readonly best = this.catalog.bestSellers;
  protected readonly fresh = this.catalog.newArrivals;
  protected readonly feed = computed(() =>
    [...this.catalog.products()].sort((a, b) => ((a.id * 7919) % 97) - ((b.id * 7919) % 97)),
  );
  protected readonly shown = signal(PAGE_SIZE);
  protected readonly forYou = computed(() => this.feed().slice(0, this.shown()));
  protected readonly waWholesale = whatsappLink('Bonjour, je suis revendeur et je souhaite commander en gros.');

  protected readonly slides: Slide[] = [
    { key: 'home.slide1', link: ['/categorie', 'pulls-sweats'], image: img('1564557287817-3785e38ec1f5'), bg: 'linear-gradient(120deg,#efe9e1,#e2d8cb)' },
    { key: 'home.slide2', link: ['/categorie', 'cargos'], image: img('1511794322962-129ddbd0af38'), bg: 'linear-gradient(120deg,#e9e4d8,#d6cfbf)' },
    { key: 'home.slide3', link: ['/categorie', 't-shirts'], image: img('1521572163474-6864f9cf17ab'), bg: 'linear-gradient(120deg,#f4f4f2,#e4e4e0)' },
    { key: 'home.slide4', link: ['/produits'], query: { flash: 1 }, image: img('1597350584914-55bb62285896'), bg: 'linear-gradient(120deg,#ffe5e5,#ffd1d1)' },
  ];
  protected readonly slide = signal(0);

  private readonly flashEnd = (() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  })();
  private readonly now = signal(Date.now());
  protected readonly countdown = computed(() => {
    const left = Math.max(0, this.flashEnd - this.now());
    const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');
    return { h: pad(left / 3.6e6), m: pad((left / 6e4) % 60), s: pad((left / 1e3) % 60) };
  });

  constructor() {
    let ticks = 0;
    const id = setInterval(() => {
      this.now.set(Date.now());
      if (++ticks % 5 === 0) this.slide.update((i) => (i + 1) % this.slides.length);
    }, 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(id));
  }
}
