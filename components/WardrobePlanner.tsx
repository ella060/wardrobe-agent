"use client";

import { useCallback, useMemo, useState } from "react";

type WardrobeImage = {
  id: string;
  url: string;
  name: string;
};

const SKIN_OPTIONS = [
  { value: "fair", label: "偏白" },
  { value: "natural", label: "自然" },
  { value: "tan", label: "小麦" },
  { value: "deep", label: "深肤色" },
] as const;

const SCENE_PRESETS = ["通勤", "约会", "运动", "旅行", "居家"] as const;

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function WardrobePlanner() {
  const [heightCm, setHeightCm] = useState("");
  const [skinTone, setSkinTone] = useState<(typeof SKIN_OPTIONS)[number]["value"]>("natural");
  const [scene, setScene] = useState("");
  const [images, setImages] = useState<WardrobeImage[]>([]);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [weekOutfits, setWeekOutfits] = useState<{ day: string; idea: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const heightLabel = useMemo(() => {
    const n = Number(heightCm);
    if (!heightCm || Number.isNaN(n)) return "—";
    return `${n} cm`;
  }, [heightCm]);

  const onFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    const next: WardrobeImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      next.push({
        id: uid(),
        url: URL.createObjectURL(file),
        name: file.name,
      });
    }
    setImages((prev) => [...prev, ...next]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const item = prev.find((x) => x.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((x) => x.id !== id);
    });
  }, []);

  const generate = useCallback(() => {
    setBusy(true);
    window.setTimeout(() => {
      const skin = SKIN_OPTIONS.find((s) => s.value === skinTone)?.label ?? "自然";
      const sceneText = scene.trim() || "日常";
      setShoppingList([
        `${sceneText}场景下的中性色基础款上装（与你的${skin}肤色协调）`,
        "一条合身直筒裤，拉长腿部比例",
        "轻薄外套应对温差",
        "与现有衣橱互补的鞋履（低饱和）",
      ]);
      setWeekOutfits([
        { day: "周一", idea: "基础 T + 直筒裤 + 小白鞋，清爽开场。" },
        { day: "周二", idea: "衬衫外搭 + 同色系下装，利落通勤。" },
        { day: "周三", idea: "用现有单品做层次叠穿，点缀小配饰。" },
        { day: "周四", idea: "上浅下深，强调腰线与鞋履统一。" },
        { day: "周五", idea: "略放松的剪裁，为周末过渡。" },
        { day: "周六", idea: "舒适面料 + 轻松配色，适合外出。" },
        { day: "周日", idea: "居家或散步：柔软针织 + 宽松裤。" },
      ]);
      setBusy(false);
    }, 650);
  }, [scene, skinTone]);

  return (
    <main className="mx-auto min-h-dvh max-w-[1400px] px-6 py-16 sm:px-10 sm:py-20 lg:px-14">
      <header className="mb-16 max-w-2xl">
        <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-inkMuted">
          Wardrobe
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          衣橱规划
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-inkMuted">
          输入你的特征与现有单品，生成购买清单与一周穿搭灵感。界面留白较多，便于专注思考。
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
        {/* Column 1 — Profile */}
        <section className="rounded-[28px] bg-white p-8 shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] sm:p-10">
          <div className="mb-10">
            <h2 className="text-xl font-semibold tracking-tight text-ink">个人特征</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-inkMuted">
              身高、肤色与主要穿着场景，用于约束配色与廓形。
            </p>
          </div>

          <div className="space-y-10">
            <label className="block">
              <span className="text-[13px] font-medium uppercase tracking-wide text-inkMuted">
                身高
              </span>
              <div className="mt-3 flex items-baseline gap-3">
                <input
                  inputMode="decimal"
                  type="number"
                  min={120}
                  max={220}
                  placeholder="例如 168"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full rounded-2xl border border-hairline bg-canvas/60 px-4 py-3.5 text-[17px] text-ink outline-none ring-0 transition placeholder:text-inkMuted/70 focus:border-[#C7C7CC] focus:bg-white"
                />
                <span className="shrink-0 text-[15px] text-inkMuted">cm</span>
              </div>
              <p className="mt-2 text-[13px] text-inkMuted">当前：{heightLabel}</p>
            </label>

            <div>
              <span className="text-[13px] font-medium uppercase tracking-wide text-inkMuted">
                肤色倾向
              </span>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {SKIN_OPTIONS.map((opt) => {
                  const active = skinTone === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSkinTone(opt.value)}
                      className={[
                        "rounded-2xl px-3 py-3 text-[15px] font-medium transition",
                        active
                          ? "bg-ink text-white shadow-sm"
                          : "bg-canvas/80 text-ink hover:bg-canvas",
                      ].join(" ")}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <span className="text-[13px] font-medium uppercase tracking-wide text-inkMuted">
                场景
              </span>
              <input
                type="text"
                value={scene}
                onChange={(e) => setScene(e.target.value)}
                placeholder="例如：春季通勤、周末户外…"
                className="mt-3 w-full rounded-2xl border border-hairline bg-canvas/60 px-4 py-3.5 text-[17px] text-ink outline-none transition placeholder:text-inkMuted/70 focus:border-[#C7C7CC] focus:bg-white"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {SCENE_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setScene(p)}
                    className="rounded-full border border-hairline bg-white px-3 py-1.5 text-[13px] text-inkMuted transition hover:border-[#C7C7CC] hover:text-ink"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </label>
          </div>
        </section>

        {/* Column 2 — Wardrobe photos */}
        <section className="rounded-[28px] bg-white p-8 shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] sm:p-10">
          <div className="mb-10">
            <h2 className="text-xl font-semibold tracking-tight text-ink">已有衣橱</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-inkMuted">
              上传多件单品照片，便于对照缺口与重复购买。
            </p>
          </div>

          <label
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              if (e.currentTarget.contains(e.relatedTarget as Node)) return;
              setDragActive(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              onFiles(e.dataTransfer.files);
            }}
            className={[
              "flex cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed px-6 py-14 text-center transition",
              dragActive
                ? "border-ink/25 bg-canvas"
                : "border-hairline bg-canvas/50 hover:bg-canvas",
            ].join(" ")}
          >
            <span className="text-[15px] font-medium text-ink">点击或拖入照片</span>
            <span className="mt-2 text-[13px] text-inkMuted">支持多选 · JPG / PNG / WEBP</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => onFiles(e.target.files)}
            />
          </label>

          {images.length > 0 ? (
            <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {images.map((img) => (
                <li
                  key={img.id}
                  className="group relative overflow-hidden rounded-2xl bg-canvas ring-1 ring-black/[0.06]"
                >
                  <div className="relative aspect-[3/4]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- blob: URLs from createObjectURL */}
                    <img
                      src={img.url}
                      alt={img.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute right-2 top-2 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white opacity-0 backdrop-blur transition group-hover:opacity-100"
                  >
                    移除
                  </button>
                  <p className="truncate px-3 py-2 text-[12px] text-inkMuted">{img.name}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-12 text-center text-[14px] text-inkMuted">尚未添加照片</p>
          )}
        </section>

        {/* Column 3 — AI output */}
        <section className="rounded-[28px] bg-white p-8 shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] sm:p-10">
          <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ink">AI 建议</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-inkMuted">
                购买清单与一周穿搭草案。后续可接入真实模型与天气数据。
              </p>
            </div>
            <button
              type="button"
              onClick={generate}
              disabled={busy}
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-ink px-7 text-[15px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "生成中…" : "生成建议"}
            </button>
          </div>

          <div className="space-y-14">
            <div>
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-inkMuted">
                建议购买清单
              </h3>
              {shoppingList.length === 0 ? (
                <p className="mt-8 text-[15px] leading-relaxed text-inkMuted">
                  点击「生成建议」查看基于当前输入的示例清单。接入 API 后可替换为真实推理结果。
                </p>
              ) : (
                <ol className="mt-8 space-y-5">
                  {shoppingList.map((item, i) => (
                    <li key={i} className="flex gap-4 text-[16px] leading-relaxed text-ink">
                      <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-canvas text-[13px] font-semibold text-inkMuted">
                        {i + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="h-px bg-hairline" />

            <div>
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-inkMuted">
                一周穿搭
              </h3>
              {weekOutfits.length === 0 ? (
                <p className="mt-8 text-[15px] leading-relaxed text-inkMuted">
                  生成后将在此展示 7 天搭配思路，保持轻量文字描述，方便你自行微调。
                </p>
              ) : (
                <ul className="mt-8 space-y-6">
                  {weekOutfits.map((row) => (
                    <li key={row.day} className="flex gap-5">
                      <div className="w-14 shrink-0 pt-0.5 text-[13px] font-semibold uppercase tracking-wide text-inkMuted">
                        {row.day}
                      </div>
                      <p className="text-[16px] leading-relaxed text-ink">{row.idea}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-20 text-center text-[12px] text-inkMuted">
        本地预览图仅在浏览器中暂存，不会上传。
      </footer>
    </main>
  );
}
