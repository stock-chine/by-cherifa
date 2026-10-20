import { Routes } from '@angular/router';
import { adminGuard } from './services/admin.guard';

export const routes: Routes = [
  { path: '', title: 'title.home', loadComponent: () => import('./pages/home').then((m) => m.Home) },
  { path: 'produits', title: 'title.products', loadComponent: () => import('./pages/product-list').then((m) => m.ProductList) },
  { path: 'categorie/:slug', title: 'title.category', loadComponent: () => import('./pages/product-list').then((m) => m.ProductList) },
  { path: 'produit/:id', title: 'title.product', loadComponent: () => import('./pages/product-detail').then((m) => m.ProductDetail) },
  { path: 'categories', title: 'title.categories', loadComponent: () => import('./pages/categories').then((m) => m.Categories) },
  { path: 'panier', title: 'title.cart', loadComponent: () => import('./pages/cart').then((m) => m.Cart) },
  { path: 'favoris', title: 'title.favorites', loadComponent: () => import('./pages/favorites').then((m) => m.Favorites) },
  { path: 'compte', title: 'title.account', loadComponent: () => import('./pages/account').then((m) => m.Account) },
  { path: 'admin/connexion', title: 'Espace gérante — Stock Chine', loadComponent: () => import('./pages/admin/admin-login').then((m) => m.AdminLogin) },
  { path: 'admin', title: 'Mes articles — Stock Chine', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/admin-products').then((m) => m.AdminProducts) },
  { path: 'admin/article/nouveau', title: 'Nouvel article — Stock Chine', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/admin-product-form').then((m) => m.AdminProductForm) },
  { path: 'admin/article/:id', title: 'Modifier un article — Stock Chine', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/admin-product-form').then((m) => m.AdminProductForm) },
  { path: '**', redirectTo: '' },
];
