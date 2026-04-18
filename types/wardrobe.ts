// ─── 枚举 ────────────────────────────────────────────────────────

export type ClothingCategory = "上装" | "下装" | "外套" | "连衣裙";

export type ClothingColor =
  | "白"
  | "黑"
  | "红"
  | "橙"
  | "黄"
  | "绿"
  | "青"
  | "蓝"
  | "紫";

export type ClothingSeason = "夏" | "春秋" | "冬";

export type ClothingTag = "已有" | "推荐新增" | "希望新增";

// ─── 接口 ────────────────────────────────────────────────────────

export interface ClothingItem {
  id: number;
  category: ClothingCategory;
  color: ClothingColor;
  season: ClothingSeason;
  tags: ClothingTag[];
  image: string;
}

// ─── 默认值映射 ─────────────────────────────────────────────────

const DEFAULT_COLOR: ClothingColor = "蓝";
const DEFAULT_CATEGORY: ClothingCategory = "上装";
const DEFAULT_SEASON: ClothingSeason = "春秋";
const DEFAULT_TAG: ClothingTag = "已有";

const COLOR_LIST: ClothingColor[] = ["白", "黑", "红", "橙", "黄", "绿", "青", "蓝", "紫"];
const CATEGORY_LIST: ClothingCategory[] = ["上装", "下装", "外套", "连衣裙"];
const SEASON_LIST: ClothingSeason[] = ["夏", "春秋", "冬"];
const TAG_LIST: ClothingTag[] = ["已有", "推荐新增", "希望新增"];

function nearest<T>(value: string, list: readonly T[]): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((list as any).includes(value)) return value as unknown as T;
  return list[0];
}

// ─── 校验并修正 ─────────────────────────────────────────────────

export function validateItem(raw: Partial<ClothingItem>): ClothingItem {
  return {
    id: typeof raw.id === "number" && !Number.isNaN(raw.id) ? raw.id : 0,
    category: nearest(raw.category ?? "", CATEGORY_LIST),
    color: nearest(raw.color ?? "", COLOR_LIST),
    season: nearest(raw.season ?? "", SEASON_LIST),
    tags: Array.isArray(raw.tags) && raw.tags.length > 0
      ? (raw.tags.map((t) => nearest(t, TAG_LIST)))
      : [DEFAULT_TAG],
    image: typeof raw.image === "string" && raw.image.length > 0 ? raw.image : "",
  };
}

// ─── 旧接口兼容（供 utils/planner 等内部模块使用）───────────────

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

// ─── Mock 数据（已按新接口重写）─────────────────────────────────

export const MOCK_WARDROBE_ITEMS: ClothingItem[] = [
  {
    id: 1,
    category: "上装",
    color: "白",
    season: "春秋",
    tags: ["已有"],
    image: "https://picsum.photos/seed/wt-white-tee/400/560",
  },
  {
    id: 2,
    category: "下装",
    color: "黑",
    season: "春秋",
    tags: ["已有"],
    image: "https://picsum.photos/seed/wt-black-pants/400/560",
  },
  {
    id: 3,
    category: "外套",
    color: "蓝",
    season: "春秋",
    tags: ["已有"],
    image: "https://picsum.photos/seed/wt-denim-jacket/400/560",
  },
];
