import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { validateItem, type ClothingItem, type StylePreference, type BodyType } from "@/types/wardrobe";

const client = new OpenAI({
  baseURL: "https://api.minimaxi.com/v1",
  apiKey: process.env.MINIMAX_API_KEY ?? "",
});

const SYSTEM_PROMPT = `你是一个专业的私人穿搭顾问。

用户资料：
- 身高：{heightCm}cm
- 体型：{bodyType}（lean=偏瘦, normal=标准, athletic=健壮, plus=丰满）
- 肤色：{skinTone}
- 风格偏好：{style}
- 当前季节：{season}

用户已有衣橱（List A）：{listA}

任务：
1. 识别 List A 中缺少的单品（Category + Color + Season 组合）
2. 最小化建议新增单品数量，能平替的不新增
3. 生成一份详细的穿搭建议分析

穿搭分析要求（analysis 字段必须严格按以下格式输出，每部分单独一行）：
【体型分析】
（根据身高和体型，给出穿搭廓形、腰线、配饰建议）

【颜色搭配】
（根据肤色，分析适合的主色调和配色方案）

【风格解读】
（解释{style}风格的核心搭配逻辑和必备元素）

【单品理由】
（从 missingItems 中提取单品名称，逐一说明选择理由，每件单品格式如下）
- 【单品名称】：选择理由
- 【单品名称】：选择理由
（如：卡其工装裤：这件裤子高腰设计能拉长比例...）

输出格式：
返回严格 JSON，包含：
- missingItems: 建议新增的单品列表（可为空数组或包含3-5个核心单品）
  - 每个单品包含 name, category, color, season, tags, image, reason
- weeklyPlan: 一周七天每天的穿搭备注（day, note, itemIds）
- analysis: 完整的穿搭分析文字（必须包含【单品理由】部分，格式如下）
  【体型分析】...
  【颜色搭配】...
  【风格解读】...
  【单品理由】(从missingItems中提取单品名称，逐一说明选择理由)
  - 【单品名称】：选择理由
  - 【单品名称】：选择理由
  ...

注意：missingItems 可以精简，但 analysis 中的【单品理由】必须详细列出所有需要的单品名称和理由。`;

interface GeneratePlanRequest {
  listA: ClothingItem[]; // 用户已有单品
  style: StylePreference;
  season: "夏" | "春秋" | "冬";
  skinTone: string;
  heightCm: number;
  bodyType: BodyType;
}

interface GeneratePlanResponse {
  missingItems: ClothingItem[];
  weeklyPlan: { day: string; note: string; itemIds: number[] }[];
  analysis: string;
}

export async function POST(req: NextRequest) {
  if (!process.env.MINIMAX_API_KEY) {
    return NextResponse.json({ error: "服务器未配置 MINIMAX_API_KEY" }, { status: 500 });
  }

  let body: GeneratePlanRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体解析失败" }, { status: 400 });
  }

  const { listA, style, season, skinTone, heightCm, bodyType } = body;

  if (!listA || !style || !season) {
    return NextResponse.json({ error: "缺少 listA、style 或 season 参数" }, { status: 400 });
  }

  // 替换 System Prompt 中的占位符
  const systemPrompt = SYSTEM_PROMPT
    .replace("{heightCm}", String(heightCm))
    .replace("{bodyType}", bodyType)
    .replace("{skinTone}", skinTone)
    .replace("{style}", style)
    .replace("{season}", season)
    .replace("{listA}", JSON.stringify(listA, null, 2));

  try {
    const completion = await client.chat.completions.create({
      model: "MiniMax-M2.7",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: [{ type: "text", text: "请根据以上用户资料和已有衣橱，生成穿搭方案。" }] },
      ],
      max_tokens: 4096,
      temperature: 0.5,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";

    // 提取 JSON
    let jsonStr = raw;
    const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();
    const firstBrace = jsonStr.indexOf("{");
    const lastBrace = jsonStr.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
    }

    let parsed: GeneratePlanResponse;

    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ error: "AI 返回格式解析失败" }, { status: 502 });
    }

    // 后端强制校验并修正每个单品
    const validatedItems: ClothingItem[] = (parsed.missingItems ?? []).map(
      (raw: Partial<ClothingItem>) => {
        const v = validateItem({ ...raw, tags: ["推荐新增"] });
        // 保留 AI 返回的 image 和 name
        return { ...v, image: raw.image ?? "", name: raw.name };
      }
    );

    return NextResponse.json({
      missingItems: validatedItems,
      weeklyPlan: parsed.weeklyPlan ?? [],
      analysis: parsed.analysis ?? "",
    });
  } catch (err) {
    console.error("[generate-plan] MiniMax API error:", err);
    return NextResponse.json({ error: "生成穿搭方案失败，请重试" }, { status: 502 });
  }
}
