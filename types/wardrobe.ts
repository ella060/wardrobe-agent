export type ClothingCategory = "top" | "bottom" | "outerwear" | "one-piece";

export type ClothingItem = {
  id: string;
  category: ClothingCategory;
  color: string;
  season: string;
  tags: string[];
  imageUrl: string;
};

export type OutfitPlan = {
  sceneName: string;
  itemIds: string[];
  reason: string;
};

export type BodyType = "lean" | "normal" | "athletic" | "plus";

export type StylePreference =
  | "法式"
  | "静奢"
  | "户外"
  | "极简"
  | "街头"
  | "复古"
  | "商务";

export type UserProfile = {
  skinTone: string;
  heightCm: number;
  bodyType: BodyType;
  stylePreference: StylePreference;
};

export type WeekOutfit = {
  day: string;
  itemIds: string[];
  note: string;
};

export const MOCK_WARDROBE_ITEMS: ClothingItem[] = [
  {
    id: "mock-white-tee",
    category: "top",
    color: "白色",
    season: "春夏",
    tags: ["基础款", "棉质", "百搭"],
    imageUrl: "https://picsum.photos/seed/wt-white-tee/400/560",
  },
  {
    id: "mock-black-trousers",
    category: "bottom",
    color: "黑色",
    season: "四季",
    tags: ["直筒", "通勤", "修身"],
    imageUrl: "https://picsum.photos/seed/wt-black-pants/400/560",
  },
  {
    id: "mock-blue-denim",
    category: "outerwear",
    color: "深蓝",
    season: "春秋",
    tags: ["牛仔", "休闲", "百搭"],
    imageUrl: "https://picsum.photos/seed/wt-denim-jacket/400/560",
  },
];
