
export enum StylePreset {
  Studio = "Professional Studio",
  Lifestyle = "Outdoor Lifestyle",
  Social = "Social Media Aesthetic",
  Ecommerce = "E-commerce Plain Background",
}

export enum AspectRatio {
  Landscape = "16:9 (Landscape)",
  Portrait = "9:16 (Portrait)",
  Square = "1:1 (Square)",
}

export interface StockModel {
    id: number;
    url: string;
    name: string;
}
