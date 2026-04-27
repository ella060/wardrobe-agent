import type { ClothingItem } from "@/types/wardrobe";

export interface MockClothingItem {
  category: ClothingItem["category"];
  color: ClothingItem["color"];
  season: ClothingItem["season"];
  image: string;
  tags: ClothingItem["tags"];
}

export const MOCK_CLOTHING_ITEMS: MockClothingItem[] = [
  
  {
    category: "连衣裙",
    color: "白",
    season: "夏",
    image: "/mock-photos/1.png",
    tags: ["已有"],
  },
  {
    category: "下装",
    color: "黑",
    season: "夏",
    image: "/mock-photos/2.png",
    tags: ["已有"],
  },
  
  {
    category: "上装",
    color: "绿",
    season: "春秋",
    image: "/mock-photos/3.png",
    tags: ["已有"],
  },
  {
    category: "上装",
    color: "黑",
    season: "春秋",
    image: "/mock-photos/4.png",
    tags: ["已有"],
  },
  
  {
    category: "上装",
    color: "蓝",
    season: "春秋",
    image: "/mock-photos/5.png",
    tags: ["已有"],
  },
  
  {
    category: "下装",
    color: "黑",
    season: "春秋",
    image: "/mock-photos/6.png",
    tags: ["已有"],
  },
  
  {
    category: "外套",
    color: "黄",
    season: "春秋",
    image: "/mock-photos/7.png",
    tags: ["已有"],
  },
];

export const CATEGORY_FILTERS = ["全部", "上装", "下装", "外套", "连衣裙"] as const;
export const SEASON_FILTERS = ["全部", "夏", "春秋", "冬"] as const;