import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface WholesaleTier {
  min: number;
  price: number;
}

export interface Product {
  id: number;
  title: string;
  category: string;
  brand?: string;
  images: string[];
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  sold: number;
  stock: number;
  minOrder: number;
  wholesale: WholesaleTier[];
  colors?: ProductColor[];
  sizes?: string[];
  description: string;
  flash: boolean;
  isNew: boolean;
}

export interface Category {
  slug: string;
  name: string;
  icon: IconDefinition;
  image: string;
  /** Tailles proposées par défaut dans le formulaire d'ajout. */
  sizes?: string[];
}

/** Mode d'acheminement depuis la Chine (obligatoire pour commander). */
export type ShippingMode = 'avion' | 'bateau';

export interface CartItem {
  productId: number;
  qty: number;
  color?: string;
  size?: string;
  shipping?: ShippingMode;
}
