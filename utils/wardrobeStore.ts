/**
 * 衣橱单品中央存储
 *
 * 生命周期与标签语义：
 *  已有   — 用户通过拍照/上传已有衣物，由 AI 识图录入
 *  推荐新增 — generatePlan 推理出的缺失单品，自动推入
 *  希望新增 — 用户手动点击「想要这件」而添加的意向单品
 *
 * ID 策略：新加入的单品始终为 allClothingItems.length + 1
 */

import type { ClothingItem, ClothingTag } from "@/types/wardrobe";
import { validateItem } from "@/types/wardrobe";

export { type ClothingItem } from "@/types/wardrobe";

let _nextId = 4; // Mock 数据已有 id 1~3，后续从 4 开始

// ─── 状态（模块内单例，跨组件共享）──────────────────────────────

const _store: ClothingItem[] = [
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

// ─── 读取 ─────────────────────────────────────────────────────

export function getAllItems(): ClothingItem[] {
  return [..._store];
}

export function getNextId(): number {
  return _nextId;
}

// ─── 写入 ─────────────────────────────────────────────────────

/**
 * 将一件单品推入 allClothingItems。
 * tag 必须为 ClothingTag 三值之一，否则自动修正。
 * ID 始终 = _nextId++（调用前外部已确定，或由本函数分配）。
 */
export function addClothingItem(
  raw: Partial<ClothingItem> & { tags: ClothingTag[] }
): ClothingItem {
  const item: ClothingItem = {
    ...validateItem(raw),
    id: raw.id ?? _nextId++,
    tags: raw.tags,
  };
  _store.push(item);
  return item;
}

/**
 * 批量添加（用于 generatePlan 推荐新增）。
 * 自动给每件打上 '推荐新增' tag。
 */
export function addRecommendedItems(
  items: Array<Partial<ClothingItem>>
): ClothingItem[] {
  return items.map((raw) =>
    addClothingItem({ ...raw, tags: ["推荐新增"] })
  );
}

/**
 * 手动添加希望新增的单品。
 * 默认 tag 为 '希望新增'，ID 由本函数分配。
 */
export function addWishItem(raw: Partial<ClothingItem>): ClothingItem {
  return addClothingItem({ ...raw, tags: ["希望新增"] });
}

/**
 * 识图录入：用户上传已有衣物，返回打上 '已有' tag 的单品。
 */
export function addExistingItem(raw: Partial<ClothingItem>): ClothingItem {
  return addClothingItem({ ...raw, tags: ["已有"] });
}
