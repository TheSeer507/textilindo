export const CONFIG = {
  storeName: "Textilindo",
  whatsappNumber: "50769413385", // número de WhatsApp Business de la tienda
  currency: "$",
  yappyHandle: "@textilindo", // ← still a placeholder, swap for your real Yappy handle
  freeShippingOver: 50,
  shippingFlat: 3.5,
};

export const money = (n) => CONFIG.currency + n.toFixed(2);
