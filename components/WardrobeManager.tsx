"use client";

import { useRef, useState } from "react";
import { Plus, Loader2, Shirt, X, Grid3X3 } from "lucide-react";
import type { ClothingItem } from "@/types/wardrobe";
import { addExistingItem } from "@/utils/wardrobeStore";
import { compressImageToBase64 } from "@/utils/imageUtils";
import { MOCK_CLOTHING_ITEMS, CATEGORY_FILTERS, SEASON_FILTERS } from "@/utils/mockWardrobe";

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
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [presetCategory, setPresetCategory] = useState<typeof CATEGORY_FILTERS[number]>("全部");
  const [presetSeason, setPresetSeason] = useState<typeof SEASON_FILTERS[number]>("全部");
  const [selectedPresets, setSelectedPresets] = useState<Set<number>>(new Set());

  const filteredPresets = MOCK_CLOTHING_ITEMS.filter((item) => {
    const categoryMatch = presetCategory === "全部" || item.category === presetCategory;
    const seasonMatch = presetSeason === "全部" || item.season === presetSeason;
    return categoryMatch && seasonMatch;
  });

  function togglePresetSelection(idx: number) {
    setSelectedPresets((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  }

  function confirmPresetSelection() {
    selectedPresets.forEach((idx) => {
      const preset = filteredPresets[idx];
      if (!preset) return;
      const newItem: ClothingItem = {
        id: Date.now() + idx,
        category: preset.category,
        color: preset.color,
        season: preset.season,
        tags: ["已有"],
        image: preset.image,
      };
      addExistingItem({
        category: preset.category,
        color: preset.color,
        season: preset.season,
        tags: ["已有"],
        image: preset.image,
      });
      setItems((prev) => [newItem, ...prev]);
    });
    setSelectedPresets(new Set());
    setShowPresetPicker(false);
  }

  function closePresetPicker() {
    setSelectedPresets(new Set());
    setShowPresetPicker(false);
  }

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

        {/* 预设选择按钮 */}
        {!uploading && (
          <button
            type="button"
            onClick={() => setShowPresetPicker(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border border-[#E5E5EA] bg-white py-3 w-full text-sm font-medium text-[#1C1C1E] transition-colors hover:border-[#1C1C1E] hover:bg-[#FAFAF9]"
          >
            <Grid3X3 className="h-4 w-4" />
            从预设衣橱选择
          </button>
        )}
      </div>

      {/* 预设选择弹窗 */}
      {showPresetPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5EA]">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-[#1C1C1E]">选择预设衣物</h3>
                {selectedPresets.size > 0 && (
                  <span className="rounded-full bg-[#1C1C1E] px-3 py-1 text-xs font-medium text-white">
                    已选 {selectedPresets.size} 件
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedPresets.size > 0 && (
                  <button
                    type="button"
                    onClick={confirmPresetSelection}
                    className="rounded-full bg-[#1C1C1E] px-4 py-2 text-sm font-medium text-white hover:bg-black"
                  >
                    确认添加
                  </button>
                )}
                <button
                  type="button"
                  onClick={closePresetPicker}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F5F7] text-[#86868B] hover:bg-[#E5E5EA]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 筛选器 */}
            <div className="flex gap-4 px-6 py-3 border-b border-[#E5E5EA]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#86868B]">品类</span>
                <div className="flex gap-1">
                  {CATEGORY_FILTERS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPresetCategory(cat)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        presetCategory === cat
                          ? "bg-[#1C1C1E] text-white"
                          : "bg-[#F5F5F7] text-[#86868B] hover:bg-[#E5E5EA]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#86868B]">季节</span>
                <div className="flex gap-1">
                  {SEASON_FILTERS.map((season) => (
                    <button
                      key={season}
                      type="button"
                      onClick={() => setPresetSeason(season)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        presetSeason === season
                          ? "bg-[#1C1C1E] text-white"
                          : "bg-[#F5F5F7] text-[#86868B] hover:bg-[#E5E5EA]"
                      }`}
                    >
                      {season}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 预设网格 */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-3 gap-3">
                {filteredPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => togglePresetSelection(idx)}
                    className={`relative group flex flex-col items-center rounded-2xl border-2 overflow-hidden transition-all ${
                      selectedPresets.has(idx)
                        ? "border-[#1C1C1E] bg-[#FAFAF9]"
                        : "border-[#E5E5EA] bg-white hover:border-[#1C1C1E]"
                    }`}
                  >
                    <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#F5F5F7]">
                      <img
                        src={preset.image}
                        alt={`${preset.color}${preset.category}`}
                        className="h-full w-full object-cover"
                      />
                      {selectedPresets.has(idx) && (
                        <div className="absolute inset-0 bg-black/10" />
                      )}
                      {selectedPresets.has(idx) && (
                        <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#1C1C1E] text-white">
                          <X className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <div className="w-full px-3 py-2 text-left">
                      <p className="text-sm font-medium text-[#1C1C1E]">
                        {preset.color} {preset.category}
                      </p>
                      <p className="text-xs text-[#86868B]">{preset.season}</p>
                    </div>
                  </button>
                ))}
              </div>
              {filteredPresets.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-[#86868B]">当前条件下没有可用的预设衣物</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
