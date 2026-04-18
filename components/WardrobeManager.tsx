"use client";

import type { ClothingItem } from "@/types/wardrobe";

const CATEGORY_LABEL: Record<ClothingItem["category"], string> = {
  top: "上装",
  bottom: "下装",
  outerwear: "外套",
  "one-piece": "连体",
};

interface Props {
  myWardrobe: ClothingItem[];
  onBack: () => void;
  onNext: () => void;
}

export function WardrobeManager({ myWardrobe, onBack, onNext }: Props) {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#86868B]">
          STEP 2
        </p>
        <h2 className="text-2xl font-semibold text-[#1C1C1E]">已有衣橱</h2>
        <p className="text-sm text-[#86868B]">
          当前共 {myWardrobe.length} 件单品，均为示例数据，可自行替换图片与属性。
        </p>
      </div>

      <div className="space-y-4">
        {myWardrobe.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-5 rounded-3xl border border-[#E5E5EA] bg-white p-4 transition-all hover:border-[#C7C7CC]"
          >
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#F5F5F7]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.color}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-medium text-[#1C1C1E]">
                {item.color} {CATEGORY_LABEL[item.category]}
              </p>
              <p className="mt-1 text-xs text-[#86868B]">
                {item.season} · {item.tags.join(" · ")}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#F5F5F7] px-2.5 py-0.5 text-[11px] text-[#86868B]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {myWardrobe.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[#D2D2D7] py-16 text-center text-sm text-[#86868B]">
          暂无单品，请添加衣服照片
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-full border border-[#E5E5EA] py-4 text-sm font-medium text-[#1C1C1E] transition-colors hover:border-[#86868B]"
        >
          ← 上一步
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 rounded-full bg-[#1C1C1E] py-4 text-sm font-semibold text-white transition-opacity hover:bg-black"
        >
          生成穿搭方案 →
        </button>
      </div>
    </div>
  );
}
