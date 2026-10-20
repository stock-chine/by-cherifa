export const SHOP = {
  name: 'Stock Chine',
  owner: 'by Cherifa',
  /** Seul numéro WhatsApp de la boutique (commandes et questions). */
  whatsapp: '8618339267415',
  whatsappDisplay: '+86 183 3926 7415',
  /** Seul moyen de paiement. */
  orangeMoney: '+226 57 49 77 71',
};

export function whatsappLink(message: string): string {
  return `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(message)}`;
}
