import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../services/catalog.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChevronRight } from '../icons';
import { TPipe } from '../i18n/t.pipe';

/** Vue catégories façon application Shein : menu latéral + sous-grille. */
@Component({
  selector: 'app-categories',
  imports: [RouterLink, FaIconComponent, TPipe],
  template: `
    <div class="container page">
      <div class="wrap">
        <nav class="side">
          @for (c of catalog.categories; track c.slug) {
            <button type="button" [class.on]="active() === c.slug" (click)="active.set(c.slug)">{{ 'cat.' + c.slug | t }}</button>
          }
        </nav>
        <section class="panel">
          @if (current(); as c) {
            <a class="banner" [routerLink]="['/categorie', c.slug]">
              <span><fa-icon [icon]="c.icon" /> {{ 'cat.' + c.slug | t }}</span><b>{{ 'home.seeAll' | t }} <fa-icon [icon]="chevron" /></b>
            </a>
            <div class="grid">
              @for (p of items(); track p.id) {
                <a [routerLink]="['/produit', p.id]" class="item">
                  <img [src]="p.images[0]" [alt]="p.title" loading="lazy" />
                  <span>{{ p.title }}</span>
                </a>
              }
            </div>
          }
        </section>
      </div>
    </div>
  `,
  styles: `
    .wrap { display: grid; grid-template-columns: 110px 1fr; gap: 0; margin-top: 12px; background: #fff; border-radius: var(--radius); overflow: hidden; min-height: 70vh; }
    @media (min-width: 900px) { .wrap { grid-template-columns: 220px 1fr; } }
    .side { background: var(--bg); display: flex; flex-direction: column; }
    .side button { text-align: left; padding: 14px 10px; font-size: 12px; color: var(--ink-2); border-left: 3px solid transparent; }
    .side button.on { background: #fff; color: var(--ink); font-weight: 700; border-left-color: var(--brand); }
    .panel { padding: 12px; }
    .banner { display: flex; justify-content: space-between; align-items: center; padding: 14px; border-radius: 8px; background: linear-gradient(90deg, #fde2e4, #fff3e0); font-weight: 700; margin-bottom: 12px; }
    .banner b { font-size: 12px; color: var(--ink-2); }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px 8px; }
    @media (min-width: 900px) { .grid { grid-template-columns: repeat(6, 1fr); } }
    .item { display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; font-size: 11px; color: var(--ink-2); }
    .item img { width: 100%; aspect-ratio: 3 / 4; object-fit: cover; border-radius: 8px; background: #f4f4f4; }
    .item span { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  `,
})
export class Categories {
  protected readonly catalog = inject(CatalogService);
  protected readonly chevron = faChevronRight;
  protected readonly active = signal(this.catalog.categories[0].slug);
  protected readonly current = computed(() => this.catalog.getCategory(this.active()));
  protected readonly items = computed(() => this.catalog.query({ category: this.active() }));
}
