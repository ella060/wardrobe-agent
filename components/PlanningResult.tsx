"use client";

import { useEffect, useState } from "react";
import {
  generatePlan,
  type PlanResult,
  type ProgressMessage,
} from "@/utils/planner";
import type { UserProfile, WeekOutfit } from "@/types/wardrobe";

const PROGRESS_STEPS: { msg: ProgressMessage; sub: string }[] = [
  { msg: "正在检索风格模板…", sub: "匹配你的「法式慵懒」胶囊案例库" },
  { msg: "正在解析 7 个胶囊案例…", sub: "覆盖工作 / 约会 / 周末 / 差旅场景" },
  { msg: "正在比对衣橱差值…", sub: "白 T · 黑裤 · 深蓝牛仔外套" },
  { msg: "正在最优化求解新增清单…", sub: "选出最少数量的高适配单品" },
];

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
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [weekOutfits, setWeekOutfits] = useState<WeekOutfit[]>([]);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // 4 步进度轮播
      for (let i = 0; i < PROGRESS_STEPS.length; i++) {
        if (cancelled) return;
        setProgressIdx(i);
        await new Promise((r) => setTimeout(r, 500));
      }

      if (cancelled) return;

      const result: PlanResult = await generatePlan(profile.stylePreference, []);
      if (cancelled) return;

      setShoppingList(result.missingItems.map((m) => `${m.name}：${m.reason}`));
      setWeekOutfits(result.weeklyPlan);
      setPhase("done");
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [profile.stylePreference]);

  const styleNotes = STYLE_NOTES[profile.stylePreference] ?? STYLE_NOTES["极简"];
  const currentStep = PROGRESS_STEPS[progressIdx];

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
            {PROGRESS_STEPS.map((_, i) => {
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
                  {i < PROGRESS_STEPS.length - 1 && (
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
            <ol className="space-y-3">
              {shoppingList.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-[#E5E5EA]"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F5F5F7] text-xs font-semibold text-[#86868B]">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-[#1C1C1E]">{item}</span>
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
              {weekOutfits.map((outfit, i) => (
                <div
                  key={outfit.day ?? i}
                  className="flex items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-[#E5E5EA]"
                >
                  <span className="mt-0.5 w-10 shrink-0 text-xs font-semibold uppercase text-[#86868B]">
                    {outfit.day}
                  </span>
                  <span className="text-sm leading-relaxed text-[#1C1C1E]">
                    {outfit.note}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
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
