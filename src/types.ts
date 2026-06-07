export interface TgUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  photoUrl: string | null;
  isPremium: boolean;
  langCode: string;
}

export interface Plate {
  id: string;
  letters: string;
  digits: string;
  series: string;
  region: string;
  price: number;
  desc: string;
  seller: string;
  sellerName: string;
  fav: boolean;
  sellerId?: number;
}

export interface PlateFilters {
  search: string;
  filterRegion: string;
  minPrice: string;
  maxPrice: string;
  filterLetters: string;
  filterDigits: string;
}

export interface NewPlateData {
  letters: string;
  digits: string;
  series: string;
  region: string;
  price: number;
  desc: string;
}
