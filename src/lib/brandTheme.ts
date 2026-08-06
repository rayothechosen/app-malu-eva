export type BrandId = "eva" | "malu";

export interface BrandTheme {
  id: BrandId;
  name: string;
  logoUrl: string;
  homeImageUrl: string;
  searchImageUrl: string;
  editingImageUrl: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  cardDark: string;
  channels: { name: string; logoUrl: string; color: string }[];
}

const R2_EVA = "https://pub-0b252875d435478a830daa595535d16c.r2.dev";

export const BRAND_THEMES: Record<BrandId, BrandTheme> = {
  eva: {
    id: "eva",
    name: "Eva",
    logoUrl: `${R2_EVA}/logo%20topo%20(1).png`,
    homeImageUrl: `${R2_EVA}/tela%20inicial.png`,
    searchImageUrl: `${R2_EVA}/buscando%20produtos.png`,
    editingImageUrl: `${R2_EVA}/editando%20videos.png`,
    primary: "#7A2BF5",
    secondary: "#EC4899",
    accent: "#B9F227",
    background: "#F4EFE6",
    cardDark: "#16130E",
    channels: [
      { name: "TikTok Shop", logoUrl: "https://cdn.simpleicons.org/tiktok/000000", color: "#000000" },
    ],
  },
  malu: {
    id: "malu",
    name: "Malu",
    logoUrl: `${R2_EVA}/malu/logo%20malu%20topo.png`,
    homeImageUrl: `${R2_EVA}/malu/malu%20tela%20inicial.png`,
    searchImageUrl: `${R2_EVA}/malu/malu%20buscando%20produto.png`,
    editingImageUrl: `${R2_EVA}/malu/maulo%20editando%20videos.png`,
    primary: "#F97316",
    secondary: "#C2410C",
    accent: "#FFD8A8",
    background: "#FFF7ED",
    cardDark: "#5A2A12",
    channels: [
      { name: "Shopee", logoUrl: "https://cdn.simpleicons.org/shopee/EE4D2D", color: "#EE4D2D" },
      { name: "TikTok", logoUrl: "https://cdn.simpleicons.org/tiktok/000000", color: "#000000" },
      { name: "Instagram", logoUrl: "https://cdn.simpleicons.org/instagram/E4405F", color: "#E4405F" },
    ],
  },
};

export function getBrandTheme(brand: BrandId = "eva") {
  return BRAND_THEMES[brand];
}
