"use client";

import { useState } from "react";
import {
  type BodyType,
  type StylePreference,
  type UserProfile,
} from "@/types/wardrobe";

const SKIN_TONES = [
  { value: "fair", label: "偏白" },
  { value: "natural", label: "自然" },
  { value: "tan", label: "小麦" },
  { value: "deep", label: "深肤色" },
] as const;

const BODY_TYPES: { value: BodyType; label: string; desc: string }[] = [
  { value: "lean", label: "偏瘦", desc: "纤细骨架" },
  { value: "normal", label: "标准", desc: "匀称健康" },
  { value: "athletic", label: "健壮", desc: "肌肉线条" },
  { value: "plus", label: "丰腴", desc: "柔和圆润" },
];

const STYLE_PREFERENCES: StylePreference[] = [
  "法式",
  "静奢",
  "户外",
  "极简",
  "街头",
  "复古",
  "商务",
];

interface Props {
  onNext: (profile: UserProfile) => void;
}

export function ProfileInput({ onNext }: Props) {
  const [skinTone, setSkinTone] = useState("natural");
  const [heightCm, setHeightCm] = useState("");
  const [bodyType, setBodyType] = useState<BodyType>("normal");
  const [stylePreference, setStylePreference] = useState<StylePreference>("极简");

  const canProceed = skinTone && heightCm && Number(heightCm) > 0;

  return (
    <div className="space-y-10">
      {/* 肤色 */}
      <div className="space-y-4">
        <label className="text-xs font-medium uppercase tracking-[0.2em] text-[#86868B]">
          肤色倾向
        </label>
        <div className="grid grid-cols-4 gap-2">
          {SKIN_TONES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSkinTone(opt.value)}
              className={[
                "rounded-2xl border py-4 text-center text-sm font-medium transition-all",
                skinTone === opt.value
                  ? "border-[#1C1C1E] bg-[#1C1C1E] text-white shadow-sm"
                  : "border-[#E5E5EA] bg-white text-[#1C1C1E] hover:border-[#86868B]",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 身高 */}
      <div className="space-y-4">
        <label className="text-xs font-medium uppercase tracking-[0.2em] text-[#86868B]">
          身高（cm）
        </label>
        <div className="flex items-center gap-3">
          <input
            inputMode="decimal"
            type="number"
            min={120}
            max={220}
            placeholder="，例如 168"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className="flex-1 rounded-2xl border border-[#E5E5EA] bg-white px-5 py-4 text-lg text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:border-[#1C1C1E] focus:outline-none transition-colors"
          />
          <span className="shrink-0 text-sm text-[#86868B]">cm</span>
        </div>
      </div>

      {/* 体型 */}
      <div className="space-y-4">
        <label className="text-xs font-medium uppercase tracking-[0.2em] text-[#86868B]">
          体型
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BODY_TYPES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setBodyType(opt.value)}
              className={[
                "rounded-2xl border p-4 text-left transition-all",
                bodyType === opt.value
                  ? "border-[#1C1C1E] bg-[#1C1C1E] text-white"
                  : "border-[#E5E5EA] bg-white text-[#1C1C1E] hover:border-[#86868B]",
              ].join(" ")}
            >
              <div className="text-sm font-medium">{opt.label}</div>
              <div
                className={[
                  "mt-1 text-xs",
                  bodyType === opt.value ? "text-[#E5E5EA]" : "text-[#86868B]",
                ].join(" ")}
              >
                {opt.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 风格偏好 */}
      <div className="space-y-4">
        <label className="text-xs font-medium uppercase tracking-[0.2em] text-[#86868B]">
          风格偏好
        </label>
        <div className="flex flex-wrap gap-2">
          {STYLE_PREFERENCES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStylePreference(s)}
              className={[
                "rounded-full border px-5 py-2.5 text-sm font-medium transition-all",
                stylePreference === s
                  ? "border-[#1C1C1E] bg-[#1C1C1E] text-white"
                  : "border-[#E5E5EA] bg-white text-[#1C1C1E] hover:border-[#86868B]",
              ].join(" ")}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Next */}
      <div className="pt-4">
        <button
          type="button"
          disabled={!canProceed}
          onClick={() =>
            onNext({
              skinTone,
              heightCm: Number(heightCm),
              bodyType,
              stylePreference,
            })
          }
          className="w-full rounded-full bg-[#1C1C1E] py-4 text-sm font-semibold text-white transition-opacity hover:bg-black disabled:cursor-not-allowed disabled:opacity-30"
        >
          下一步：查看衣橱 →
        </button>
      </div>
    </div>
  );
}
