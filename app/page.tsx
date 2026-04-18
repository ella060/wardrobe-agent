"use client";

import { useState } from "react";
import { ProfileInput } from "@/components/ProfileInput";
import { WardrobeManager } from "@/components/WardrobeManager";
import { PlanningResult } from "@/components/PlanningResult";
import { MOCK_WARDROBE_ITEMS, type ClothingItem, type UserProfile } from "@/types/wardrobe";

type Step = "profile" | "wardrobe" | "result";

export default function Home() {
  const [step, setStep] = useState<Step>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myWardrobe] = useState<ClothingItem[]>(MOCK_WARDROBE_ITEMS);

  return (
    <div className="min-h-dvh bg-[#FAFAF9] text-[#1C1C1E] antialiased">
      {/* Header */}
      <header className="mx-auto max-w-3xl px-6 pt-16 pb-10 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#86868B]">
          长期主义衣橱
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#1C1C1E]">
          衣橱规划 Agent
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#86868B]">
          填完资料 → 查看衣橱 → 生成穿搭方案
        </p>
      </header>

      {/* Step indicator */}
      <div className="mx-auto mb-14 flex max-w-3xl items-center justify-center gap-2 px-6">
        {(["profile", "wardrobe", "result"] as Step[]).map((s, i) => {
          const labels = ["个人资料", "已有衣橱", "穿搭方案"];
          const done =
            step === "profile"
              ? s === "profile"
              : step === "wardrobe"
                ? s === "profile" || s === "wardrobe"
                : true;
          const current = step === s;
          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={[
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-all",
                  done
                    ? "bg-[#1C1C1E] text-white"
                    : current
                      ? "border border-[#1C1C1E] text-[#1C1C1E]"
                      : "border border-[#D2D2D7] text-[#D2D2D7]",
                ].join(" ")}
              >
                {i + 1}
              </div>
              <span
                className={[
                  "text-xs transition-all",
                  done || current ? "text-[#1C1C1E]" : "text-[#D2D2D7]",
                ].join(" ")}
              >
                {labels[i]}
              </span>
              {i < 2 && (
                <div
                  className={[
                    "h-px w-8 transition-all",
                    step === "wardrobe" && s === "profile"
                      ? "bg-[#1C1C1E]"
                      : step === "result"
                        ? "bg-[#1C1C1E]"
                        : "bg-[#D2D2D7]",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 pb-24">
        {step === "profile" && (
          <ProfileInput
            onNext={(p) => {
              setProfile(p);
              setStep("wardrobe");
            }}
          />
        )}
        {step === "wardrobe" && (
          <WardrobeManager
            myWardrobe={myWardrobe}
            onBack={() => setStep("profile")}
            onNext={() => setStep("result")}
          />
        )}
        {step === "result" && (
          <PlanningResult
            profile={profile!}
            onBack={() => setStep("wardrobe")}
            onRestart={() => {
              setStep("profile");
              setProfile(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
