import { DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import { loadJson, saveJson } from '../services/storage';
import { EN } from './en';
import { Dictionary, FR, TranslationKey } from './fr';
import { ZH } from './zh';

export type Lang = 'fr' | 'en' | 'zh';

export const LANGUAGES: { code: Lang; label: string; html: string }[] = [
  { code: 'fr', label: 'FR', html: 'fr' },
  { code: 'en', label: 'EN', html: 'en' },
  { code: 'zh', label: '中文', html: 'zh-CN' },
];

const DICTIONARIES: Record<Lang, Dictionary> = { fr: FR, en: EN, zh: ZH };

/** Noms des couleurs de la palette (les couleurs personnalisées restent telles que saisies). */
const COLOR_NAMES: Record<string, { en: string; zh: string }> = {
  'Noir': { en: 'Black', zh: '黑色' },
  'Blanc': { en: 'White', zh: '白色' },
  'Beige': { en: 'Beige', zh: '米色' },
  'Gris chiné': { en: 'Heather grey', zh: '麻灰色' },
  'Crème': { en: 'Cream', zh: '奶油色' },
  'Marron': { en: 'Brown', zh: '棕色' },
  'Kaki': { en: 'Khaki', zh: '卡其色' },
  'Bleu marine': { en: 'Navy blue', zh: '藏青色' },
  'Bleu jean': { en: 'Denim blue', zh: '牛仔蓝' },
  'Vert sauge': { en: 'Sage green', zh: '鼠尾草绿' },
  'Rose poudré': { en: 'Powder pink', zh: '粉色' },
  'Rouge': { en: 'Red', zh: '红色' },
};

function detectLang(): Lang {
  const saved = loadJson<Lang | null>('sc-lang', null);
  if (saved && saved in DICTIONARIES) return saved;
  const nav = (typeof navigator !== 'undefined' ? navigator.language : 'fr').toLowerCase();
  if (nav.startsWith('zh')) return 'zh';
  if (nav.startsWith('en')) return 'en';
  return 'fr';
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>(detectLang());

  constructor() {
    const doc = inject(DOCUMENT);
    effect(() => {
      const lang = this.lang();
      saveJson('sc-lang', lang);
      doc.documentElement.lang = LANGUAGES.find((l) => l.code === lang)!.html;
    });
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
  }

  /** Traduit une clé ; `{x}` dans le texte est remplacé par `params.x`. */
  t(key: TranslationKey | string, params?: Record<string, string | number>): string {
    const dict = DICTIONARIES[this.lang()] as Record<string, string>;
    let text = dict[key] ?? (FR as Record<string, string>)[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) text = text.replaceAll(`{${k}}`, String(v));
    }
    return text;
  }

  categoryName(slug: string): string {
    return this.t(`cat.${slug}`);
  }

  colorName(name: string | undefined): string {
    if (!name) return '';
    const lang = this.lang();
    return lang === 'fr' ? name : COLOR_NAMES[name]?.[lang] ?? name;
  }
}

/** Tous les noms de catégorie, toutes langues confondues (pour la recherche). */
export function allCategoryNames(slug: string): string {
  return Object.values(DICTIONARIES)
    .map((d) => (d as Record<string, string>)[`cat.${slug}`] ?? '')
    .join(' ');
}
