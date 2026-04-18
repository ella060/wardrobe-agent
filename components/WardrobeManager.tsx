"use client";

import { useRef, useState } from "react";
import { Plus, Loader2, Shirt, X } from "lucide-react";
import type { ClothingItem } from "@/types/wardrobe";
import { addExistingItem } from "@/utils/wardrobeStore";
import { compressImageToBase64 } from "@/utils/imageUtils";

const CATEGORY_LABEL: Record<ClothingItem["category"], string> = {
  上装: "上装",
  下装: "下装",
  外套: "外套",
  连衣裙: "连衣裙",
};

const TAG_STYLE: Record<string, string> = {
  已有: "bg-[#E8F5E9] text-[#2E7D32]",
  推荐新增: "bg-[#E3F2FD] text-[#1565C0]",
  希望新增: "bg-[#FFF3E0] text-[#E65100]",
};

interface Props {
  onBack: () => void;
  onNext: () => void;
}

export function WardrobeManager({ onBack, onNext }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);

    try {
      setProgress("正在压缩…");
      const { base64 } = await compressImageToBase64(file);

      setProgress("AI 正在识图中…");
      const res = await fetch("/api/recognize-clothing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
      }

      const data = (await res.json()) as Pick<ClothingItem, "category" | "color" | "season">;
      const objectUrl = URL.createObjectURL(file);

      const newItem: ClothingItem = {
        id: Date.now(),
        category: data.category,
        color: data.color,
        season: data.season,
        tags: ["已有"],
        image: objectUrl,
      };

      // 同步写入 wardrobeStore（让 generatePlan 能读到）
      addExistingItem({
        category: data.category,
        color: data.color,
        season: data.season,
        tags: ["已有"],
        image: objectUrl,
      });

      setItems((prev) => [newItem, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setUploading(false);
      setProgress("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeItem(id: number) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-10">
      {/* 页面标题 */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#86868B]">STEP 2</p>
        <h2 className="text-2xl font-semibold text-[#1C1C1E]">已有衣橱</h2>
        <p className="text-sm text-[#86868B]">
          {items.length === 0
            ? "上传照片，AI 自动识别衣服属性"
            : `已录入 ${items.length} 件单品，继续添加或生成方案`}
        </p>
      </div>

      {/* 上传区域 */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#86868B]">
          识图录入
        </p>

        {uploading ? (
          /* 上传 / 识别中 */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#E5E5EA] bg-white py-16 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#1C1C1E]" />
            <p className="text-base font-medium text-[#1C1C1E]">{progress}</p>
            <p className="text-xs text-[#86868B]">请稍候，AI 正在分析图片…</p>
          </div>
        ) : (
          /* 上传按钮 */
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#D2D2D7] bg-white py-14 w-full gap-4 transition-all hover:border-[#1C1C1E] hover:bg-[#FAFAF9]"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F7]">
              <Plus className="h-8 w-8 text-[#1C1C1E]" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-[#1C1C1E]">添加衣服照片</p>
              <p className="mt-1 text-xs text-[#86868B]">AI 自动识别品类、颜色、季节</p>
            </div>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />

        {/* 错误提示 */}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-[#FFF1F0] px-4 py-3">
            <p className="text-sm text-[#D93026]">识别失败：{error}</p>
          </div>
        )}
      </div>

      {/* 单品卡片列表 */}
      {items.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#86868B]">
            已录入 ({items.length})
          </p>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative flex items-center gap-5 rounded-3xl border border-[#E5E5EA] bg-white p-4 transition-all hover:border-[#C7C7CC]"
              >
                {/* 图片 */}
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#F5F5F7]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.color}
                    className="h-full w-full object-cover"
                  />
                  {/* 删除按钮 */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>

                {/* 信息 */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Shirt className="h-4 w-4 shrink-0 text-[#86868B]" strokeWidth={1.5} />
                    <p className="text-base font-semibold text-[#1C1C1E]">
                      {item.color} {CATEGORY_LABEL[item.category]}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-[#86868B]">{item.season}</p>

                  {/* 标签 */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${TAG_STYLE[tag] ?? "bg-[#F5F5F7] text-[#86868B]"}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {items.length === 0 && !uploading && (
        <div className="rounded-3xl border border-dashed border-[#D2D2D7] py-14 text-center">
          <p className="text-sm text-[#86868B]">暂无录入单品，点击上方按钮添加第一件</p>
        </div>
      )}

      {/* 底部导航 */}
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
          className="flex-1 rounded-full bg-[#1C1C1E] py-4 text-sm font-semibold text-white transition-opacity hover:bg-black disabled:opacity-30"
          disabled={items.length === 0}
        >
          生成穿搭方案 →
        </button>
      </div>
    </div>
  );
}
