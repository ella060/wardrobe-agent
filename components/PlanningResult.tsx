"use client";

import { useEffect, useState } from "react";
import {
  generatePlan,
  type PlanResult,
  type ProgressMessage,
  type MissingItem,
} from "@/utils/planner";
import { getAllItems } from "@/utils/wardrobeStore";
import type { ClothingItem, UserProfile, WeekOutfit } from "@/types/wardrobe";

function buildProgressSteps(wardrobe: { color: string; category: string }[]): { msg: ProgressMessage; sub: string }[] {
  const summary = wardrobe.map((i) => `${i.color}${i.category}`).join(" · ");
  return [
    { msg: "正在检索风格模板…", sub: "匹配你的「法式慵懒」胶囊案例库" },
    { msg: "正在解析胶囊案例…", sub: "覆盖工作 / 约会 / 周末 / 差旅场景" },
    { msg: "正在比对衣橱差值…", sub: summary || "空衣橱" },
    { msg: "正在最优化求解…", sub: "选出最少数量的高适配单品" },
  ];
}

/** 根据 category + color 生成确定性 picsum 占位图 URL */
function getPlaceholderImage(category: string, color: string): string {
  const seeds: Record<string, string> = {
    "上装-白": "top-white",   "上装-黑": "top-black",   "上装-红": "top-red",
    "上装-橙": "top-orange",   "上装-黄": "top-yellow",  "上装-绿": "top-green",
    "上装-青": "top-teal",    "上装-蓝": "top-blue",    "上装-紫": "top-purple",
    "下装-白": "bottom-white", "下装-黑": "bottom-black","下装-红": "bottom-red",
    "下装-橙": "bottom-orange","下装-黄": "bottom-yellow","下装-绿": "bottom-green",
    "下装-青": "bottom-teal",  "下装-蓝": "bottom-blue", "下装-紫": "bottom-purple",
    "外套-白": "outer-white",  "外套-黑": "outer-black",  "外套-红": "outer-red",
    "外套-橙": "outer-orange", "外套-黄": "outer-yellow", "外套-绿": "outer-green",
    "外套-青": "outer-teal",  "外套-蓝": "outer-blue",  "外套-紫": "outer-purple",
    "连衣裙-白": "dress-white","连衣裙-黑": "dress-black","连衣裙-红": "dress-red",
    "连衣裙-橙": "dress-orange","连衣裙-黄": "dress-yellow","连衣裙-绿": "dress-green",
    "连衣裙-青": "dress-teal", "连衣裙-蓝": "dress-blue", "连衣裙-紫": "dress-purple",
  };
  const seed = seeds[`${category}-${color}`] ?? `generic-${category}`;
  return `https://picsum.photos/seed/${seed}/400/560`;
}

const STYLE_NOTES: Record<string, string[]> = {
  法式: ["慵懒优雅", "碎花/条纹元素", "珍珠/丝巾点缀", "草编包"],
  静奢: ["高品质基础款", "低饱和配色", "精致裁剪", "质感配饰"],
  户外: ["功能性面料", "工装/山系元素", "防风外套", "舒适徒步鞋"],
  极简: ["黑白灰为主", "利落线条", "无多余装饰", "经典廓形"],
  街头: ["宽松版型", "图案卫衣/tee", "运动鞋", "棒球帽/项链"],
  复古: ["高腰单品", "格纹/波点", "做旧牛仔", "乐福鞋/玛丽珍"],
  商务: ["深色西装", "白衬衫", "皮革皮带", "简约手表"],
};

interface Props {
  profile: UserProfile;
  onBack: () => void;
  onRestart: () => void;
}

export function PlanningResult({ profile, onBack, onRestart }: Props) {
  const [phase, setPhase] = useState<"loading" | "done">("loading");
  const [progressIdx, setProgressIdx] = useState(0);
  const [shoppingList, setShoppingList] = useState<MissingItem[]>([]);
  const [weekOutfits, setWeekOutfits] = useState<WeekOutfit[]>([]);
  const [showTips, setShowTips] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const wardrobe = getAllItems();
      const steps = buildProgressSteps(wardrobe);

      // 4 步进度轮播
      for (let i = 0; i < steps.length; i++) {
        if (cancelled) return;
        setProgressIdx(i);
        await new Promise((r) => setTimeout(r, 500));
      }

      if (cancelled) return;

      // 季节暂用"春秋"（后续可从用户资料或季节选择器获取）
      try {
        const result: PlanResult = await generatePlan(profile.stylePreference, "春秋");
        if (cancelled) return;
        setShoppingList(result.missingItems as MissingItem[]);
        setWeekOutfits(result.weeklyPlan);
        setPhase("done");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "生成穿搭方案失败，请重试");
        setPhase("done");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [profile.stylePreference]);

  const wardrobe = getAllItems();
  const styleNotes = STYLE_NOTES[profile.stylePreference] ?? STYLE_NOTES["极简"];
  const progressSteps = buildProgressSteps(wardrobe);
  const currentStep = progressSteps[progressIdx];

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#86868B]">
          STEP 3
        </p>
        <h2 className="text-2xl font-semibold text-[#1C1C1E]">穿搭方案</h2>
        <p className="text-sm text-[#86868B]">
          基于你的 {profile.stylePreference} 风格与 {profile.heightCm}cm 身形推荐
        </p>
      </div>

      {/* 风格标签 */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#86868B]">
          {profile.stylePreference} 风格关键词
        </p>
        <div className="flex flex-wrap gap-2">
          {styleNotes.map((note) => (
            <span
              key={note}
              className="rounded-full bg-white px-4 py-2 text-sm text-[#1C1C1E] ring-1 ring-[#E5E5EA]"
            >
              {note}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowTips(!showTips)}
          className="text-xs text-[#86868B] underline underline-offset-2"
        >
          {showTips ? "收起说明" : `什么是${profile.stylePreference}风格？`}
        </button>
        {showTips && (
          <p className="rounded-2xl bg-[#F5F5F7] p-4 text-xs leading-relaxed text-[#86868B]">
            {profile.stylePreference === "法式"
              ? "法式慵懒（French Chic）讲究effortless elegance，不过度打扮却处处精致。核心单品包括条纹衫、茶歇裙、高腰裤、针织开衫，配饰偏好珍珠、丝巾、草编包，色彩以蓝白、黑白、驼白为主。"
              : profile.stylePreference === "静奢"
                ? "静奢（Quiet Luxury）指低调内敛却质感十足的设计，不追求 logo 显眼，用顶级面料与精准剪裁传递高级感。色彩以米、灰、驼、藏青为主，款式强调合身与经典。"
                : `${profile.stylePreference} 风格的核心是简约克制的美学，强调剪裁、面料与搭配的层次感。`}
          </p>
        )}
      </div>

      {/* 进度 / 结果 */}
      {phase === "loading" ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          {/* 4 个进度气泡 */}
          <div className="mb-10 flex items-center gap-3">
            {progressSteps.map((_, i) => {
              const done = i < progressIdx;
              const active = i === progressIdx;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={[
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                      done
                        ? "bg-[#1C1C1E] text-white"
                        : active
                          ? "border-2 border-[#1C1C1E] text-[#1C1C1E] animate-pulse"
                          : "border-2 border-[#D2D2D7] text-[#D2D2D7]",
                    ].join(" ")}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  {i < progressSteps.length - 1 && (
                    <div
                      className={[
                        "h-0.5 w-6 transition-all duration-300",
                        done ? "bg-[#1C1C1E]" : "bg-[#D2D2D7]",
                      ].join(" ")}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-base font-medium text-[#1C1C1E]">
            {currentStep.msg}
          </p>
          <p className="mt-2 text-sm text-[#86868B]">{currentStep.sub}</p>
        </div>
      ) : (
        <>
          {/* 购买清单 */}
          <div className="space-y-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#86868B]">
              建议新增清单
            </p>
            <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {shoppingList.map((item, i) => (
                <li
                  key={item.key ?? i}
                  className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-[#E5E5EA]"
                >
                  {/* 图片或占位图 */}
                  <div className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-xl bg-[#F5F5F7]">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getPlaceholderImage(item.category, item.color)}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                    {/* 标签角标 */}
                    <span className="absolute right-2 top-2 rounded-full bg-[#1C1C1E] px-2 py-0.5 text-[10px] font-medium text-white">
                      推荐新增
                    </span>
                  </div>
                  {/* 5 字段信息 */}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#1C1C1E]">{item.name}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[#86868B]">
                      <span>分类：{item.category}</span>
                      <span>颜色：{item.color}</span>
                      <span>季节：{item.season}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#86868B]">{item.reason}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="h-px bg-[#E5E5EA]" />

          {/* 一周穿搭 */}
          <div className="space-y-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#86868B]">
              一周穿搭
            </p>
            <div className="space-y-3">
              {weekOutfits.map((outfit, i) => {
                // itemIds 现在是 shoppingList 数组的字符串索引
                const outfitItems = outfit.itemIds
                  .map((id) => {
                    const idx = Number(id);
                    const fromMissing = shoppingList[idx];
                    const fromStore = getAllItems().find((it) => it.id === idx);
                    return fromMissing ?? fromStore;
                  })
                  .filter((item) => item !== undefined) as (MissingItem | ClothingItem)[];

                return (
                  <div
                    key={outfit.day ?? i}
                    className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-[#E5E5EA]"
                  >
                    {/* 星期 */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-widest text-[#86868B]">
                        {outfit.day}
                      </span>
                      <span className="text-xs text-[#86868B]">{outfit.note}</span>
                    </div>
                    {/* 每日单品 */}
                    {outfitItems.length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {outfitItems.map((item) => (
                          <div
                            key={(item as MissingItem).key ?? (item as ClothingItem).id}
                            className="flex shrink-0 flex-col items-center gap-1.5"
                          >
                            <div className="relative flex h-20 w-16 items-center justify-center overflow-hidden rounded-xl bg-[#F5F5F7]">
                              {(item as MissingItem).image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={(item as MissingItem).image}
                                  alt={(item as MissingItem).name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={getPlaceholderImage(
                                    (item as MissingItem).category ?? (item as ClothingItem).category,
                                    (item as MissingItem).color ?? (item as ClothingItem).color
                                  )}
                                  alt={(item as MissingItem).name ?? (item as ClothingItem).color}
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                            <div className="w-16 text-center">
                              <p className="truncate text-[10px] font-medium text-[#1C1C1E]">
                                {(item as MissingItem).name ?? (item as ClothingItem).color}
                              </p>
                              <p className="truncate text-[10px] text-[#86868B]">
                                {(item as MissingItem).season ?? (item as ClothingItem).season}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#86868B]">单品信息加载中…</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 操作区 */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-full border border-[#E5E5EA] py-4 text-sm font-medium text-[#1C1C1E] transition-colors hover:border-[#86868B]"
        >
          ← 修改衣橱
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="flex-1 rounded-full bg-white py-4 text-sm font-medium text-[#86868B] ring-1 ring-[#E5E5EA] transition-colors hover:text-[#1C1C1E]"
        >
          重新开始
        </button>
      </div>
    </div>
  );
}
