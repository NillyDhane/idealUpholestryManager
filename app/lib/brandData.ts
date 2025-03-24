export const brands = ["Shann"] as const;

export const brandColors = {
  Shann: [
    "Bison",
    "Cashmere",
    "Cement",
    "Cherry",
    "Cigar",
    "Clay",
    "Flint",
    "Glacier",
    "Mahogany",
    "Maize",
    "Metal",
    "Oasis",
    "Vanilla",
    "Volcano",
    "Zodiac"
  ],
} as const;

export type Brand = (typeof brands)[number];
export type BrandColors = typeof brandColors;
export type BrandColor<B extends Brand> = (typeof brandColors)[B][number];
