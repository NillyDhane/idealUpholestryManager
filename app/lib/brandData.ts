export const brands = ["Shann"] as const;

export const brandColors = {
  Shann: [
    "Ash",
    "Black",
    "Charcoal",
    "Chocolate",
    "Cream",
    "Grey",
    "Navy",
    "Stone",
    "Tan",
  ],
} as const;

export type Brand = (typeof brands)[number];
export type BrandColors = typeof brandColors;
export type BrandColor<B extends Brand> = (typeof brandColors)[B][number];
