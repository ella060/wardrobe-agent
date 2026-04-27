/**
 * generatePlan 核心逻辑
 *
 * 计算流程：
 *  1. List A  ← 用户已有单品（tags='已有'），按 category+color+season 去重
 *  2. List B  ← CAPSULE_WARDROBE_TEMPLATES 中筛选符合当前季节/风格的案例单品
 *  3. List C  ← List B 与 List A 做 Diff，category+color+season 无完全匹配则进入 List C
 *  4. 最优化   ← 两次模拟（不同案例组合），取 List C 更小的那个
 *  5. 合并     ← List A + List C → weeklyPlan 素材池
 *
 * 返回：{ missingItems: List C, weeklyPlan: 每日穿搭 }
 */

import type { BodyType, ClothingItem, StylePreference, UserProfile } from "@/types/wardrobe";
import type { WeekOutfit } from "@/types/wardrobe";
import { CAPSULE_WARDROBE_TEMPLATES, type CapsuleOutfit } from "@/utils/constants";
import { getAllItems } from "@/utils/wardrobeStore";

export type ProgressMessage =
  | "正在检索风格模板…"
  | "正在解析胶囊案例…"
  | "正在比对衣橱差值…"
  | "正在最优化求解…"
  | "完成";

export interface MissingItem {
  name: string;
  reason: string;
  /** 推荐新增单品的 key，用于比对去重 */
  key: string;
  /** 完整 ClothingItem 字段（5 字段） */
  category: string;
  color: string;
  season: string;
  tags: string[];
  image: string;
}

export interface PlanResult {
  missingItems: MissingItem[];
  weeklyPlan: WeekOutfit[];
  analysis: string;
}

// ─── 工具函数 ─────────────────────────────────────────────────

/** 从穿搭分析的"单品理由"段落中解析出单品列表 */
function parseItemsFromAnalysis(analysis: string): MissingItem[] {
  const results: MissingItem[] = [];
  // 找到【单品理由】部分
  const reasonSectionMatch = analysis.match(/【单品理由】([\s\S]*?)(?=【|$)/);
  if (!reasonSectionMatch) return results;

  const reasonSection = reasonSectionMatch[1];
  // 匹配格式：- 【单品名称】：选择理由
  const itemMatches = reasonSection.matchAll(/【(.+?)】[：:](.+)/g);
  let idx = 0;
  for (const match of itemMatches) {
    results.push({
      name: match[1].trim(),
      reason: match[2].trim(),
      key: `parsed-${idx++}`,
      category: "",
      color: "",
      season: "",
      tags: ["推荐新增"],
      image: "",
    });
  }
  return results;
}

/** 生成单品唯一比对 key：category|color|season */
function itemKey(item: Pick<ClothingItem, "category" | "color" | "season">): string {
  return `${item.category}|${item.color}|${item.season}`;
}

/**
 * List A：从 store 读取已有单品，按 category+color+season 去重
 * 返回 Set<"category|color|season">
 */
function buildExistingKeys(): Set<string> {
  const existing = getAllItems().filter((i) => i.tags.includes("已有"));
  const seen = new Set<string>();
  for (const item of existing) {
    seen.add(itemKey(item));
  }
  return seen;
}

/**
 * List B：从模板库筛选风格+季节匹配的最多 7 个案例，
 * 返回该 7 案例列表，以及这些案例去重后的单品集合。
 */
function buildTemplateItems(
  style: string,
  season: string
): { outfits: CapsuleOutfit[]; items: ClothingItem[] } {
  const outfits = CAPSULE_WARDROBE_TEMPLATES.filter(
    (o) => o.style === style && o.season === season
  ).slice(0, 7); // 最多取 7 个案例

  const map = new Map<string, ClothingItem>();
  for (const outfit of outfits) {
    for (const item of outfit.items) {
      const k = itemKey(item);
      if (!map.has(k)) map.set(k, item);
    }
  }
  return { outfits, items: Array.from(map.values()) };
}

/**
 * Diff：对比 List A 与 List B，输出 List C（不在 A 中的 B 单品）
 */
function diffAgainstExisting(
  templateItems: ClothingItem[],
  existingKeys: Set<string>
): MissingItem[] {
  const results: MissingItem[] = [];
  for (const item of templateItems) {
    if (existingKeys.has(itemKey(item))) continue; // 已有，跳过
    results.push({
      name: `${item.color}${item.category}`,
      reason: `${item.season} ${item.category}，完善${styleLabel(item.category)}衣橱`,
      key: itemKey(item),
      category: item.category,
      color: item.color,
      season: item.season,
      tags: ["推荐新增"],
      image: "",
    });
  }
  return results;
}

/** 辅助标签 */
function styleLabel(category: string): string {
  const map: Record<string, string> = {
    上装: "上装", 下装: "下装", 外套: "外套", 连衣裙: "连衣裙",
  };
  return map[category] ?? category;
}

/** 根据 category 推断适合的风格描述 */
function inferReason(item: ClothingItem, style: string): string {
  const reasons: Record<string, Record<string, string>> = {
    法式: {
      上装: "法式慵懒经典元素，与现有单品互补",
      下装: "法式高腰剪裁，拉长比例",
      外套: "春秋必备，搭所有内搭",
      连衣裙: "茶歇裙元素，慵懒优雅",
    },
    静奢: {
      上装: "高品质基础款，低饱和配色",
      下装: "阔腿/直筒剪裁，质感通勤",
      外套: "精致裁剪，提升整体气质",
      连衣裙: "缎面/丝绒，连贯风格",
    },
    复古: {
      上装: "格纹/条纹，复古氛围",
      下装: "高腰/灯芯绒，年代感",
      外套: "宽松廓形，复古轮廓",
      连衣裙: "碎花/波点，浪漫复古",
    },
    户外: {
      上装: "功能性面料，工装元素",
      下装: "工装/速干，户外适配",
      外套: "防风/抓绒，山系必备",
      连衣裙: "轻便连衣裙，透气舒适",
    },
    极简: {
      上装: "黑白灰基础款，经典不过时",
      下装: "合身直筒/锥形，利落干练",
      外套: "单色西装/风衣，永恒百搭",
      连衣裙: "纯色简约款，一件即风格",
    },
  };
  return reasons[style]?.[item.category] ?? `${item.category} 完善`;
}

// ─── 最优化求解 ────────────────────────────────────────────────

/**
 * 两次模拟，取 List C 更小的结果。
 * 模拟1：用全部 7 个案例的 items
 * 模拟2：只用前 3 个案例的 items
 */
function optimize(
  templateItems: ClothingItem[],
  existingKeys: Set<string>
): MissingItem[] {
  const all = diffAgainstExisting(templateItems, existingKeys);

  // 模拟2：只取前 3 个方案（代表不同子风格）
  const subset = templateItems.slice(0, 3);
  const subsetDiff = diffAgainstExisting(subset, existingKeys);

  return all.length <= subsetDiff.length ? all : subsetDiff;
}

// ─── 生成 weeklyPlan ────────────────────────────────────────────

const DAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

/**
 * 根据 List B 的 7 个匹配案例采样 week notes，生成周一到周日穿搭。
 * itemIds 使用 missingItems 数组的索引。
 */
function buildWeeklyPlan(
  matchedOutfits: CapsuleOutfit[],
  missingItems: MissingItem[]
): WeekOutfit[] {
  // 从这 7 个案例的 week 笔记中取前 7 天
  const allNotes = matchedOutfits.flatMap((o) => o.week).map((w) => w.note);

  return DAYS.map((day, i) => ({
    day,
    itemIds: missingItems.map((_, idx) => String(idx)),
    note: allNotes[i] ?? `${day}：基础搭配，日常实穿`,
  }));
}

// ─── 主入口 ───────────────────────────────────────────────────

export async function generatePlan(
  profile: UserProfile,
  season: "夏" | "春秋" | "冬"
): Promise<PlanResult> {
  // ── Step 1: List A ──────────────────────────────────────────
  const existingKeys = buildExistingKeys();

  // ── Step 2: List B（最多 7 个案例）──────────────────────────
  const { outfits, items: templateItems } = buildTemplateItems(profile.stylePreference, season);

  // ── 尝试调用 MiniMax API ───────────────────────────────────
  try {
    const res = await fetch("/api/generate-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listA: getAllItems().filter((i) => i.tags.includes("已有")),
        style: profile.stylePreference,
        season,
        skinTone: profile.skinTone,
        heightCm: profile.heightCm,
        bodyType: profile.bodyType,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      let missingItems: MissingItem[] = (data.missingItems ?? []).map(
        (item: ClothingItem & { reason?: string; name?: string }) => ({
          name: item.name ?? `${item.color} ${item.category}`,
          reason: item.reason ?? "",
          key: `${item.category}|${item.color}|${item.season}`,
          category: item.category,
          color: item.color,
          season: item.season,
          tags: item.tags,
          image: item.image,
        })
      );

      // 如果 missingItems 为空，从 analysis 的【单品理由】中解析
      if (missingItems.length === 0 && data.analysis) {
        missingItems = parseItemsFromAnalysis(data.analysis);
      }

      const weeklyPlan: WeekOutfit[] = (data.weeklyPlan ?? []).map(
        (w: { day: string; note: string; itemIds: number[] }) => ({
          day: w.day,
          note: w.note,
          itemIds: w.itemIds.map((id) => String(id)),
        })
      );

      return {
        missingItems,
        weeklyPlan,
        analysis: data.analysis ?? "",
      };
    }
  } catch {
    // API 调用失败或网络错误，走本地兜底逻辑
  }

  // ── 本地兜底逻辑 ────────────────────────────────────────────
  const listC = optimize(templateItems, existingKeys);
  const weeklyPlan = buildWeeklyPlan(outfits, listC);
  return { missingItems: listC, weeklyPlan, analysis: "" };
}
