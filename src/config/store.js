export const CONFIG = {
  storeName: "Textilindo",
  whatsappNumber: "50760000000", // ← your number, digits only
  currency: "$",
  yappyHandle: "@textilindo", // ← still a placeholder, swap for your real Yappy handle
  freeShippingOver: 50,
  shippingFlat: 3.5,
};

export const money = (n) => CONFIG.currency + n.toFixed(2);
