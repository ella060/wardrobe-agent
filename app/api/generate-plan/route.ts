import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { validateItem, type ClothingItem, type StylePreference } from "@/types/wardrobe";

const client = new OpenAI({
  baseURL: "https://api.minimaxi.com/v1",
  apiKey: process.env.MINIMAX_API_KEY ?? "",
});

const SYSTEM_PROMPT = `你是一个逻辑严密的衣橱算法助手。
任务：对比 List B（预设案例）与 List A（用户已有）。
核心算法：
1. 识别 List A 中缺少的单品（Category + Color + Season 组合）。
2. 你的目标是最小化 List C（建议新增单品）的数量。如果用户已有单品可以平替（如颜色非常接近），则不要新增。
3. 进行两次逻辑推演，选择新增单品最少的方案。
输出格式：
返回严格 JSON。包含 missingItems 列表和 weeklyPlan 列表。每个单品必须包含 category, color, season, tags, image。`;

interface GeneratePlanRequest {
  listA: ClothingItem[]; // 用户已有单品
  style: StylePreference;
  season: "夏" | "春秋" | "冬";
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

  const { listA, style, season } = body;

  if (!listA || !style || !season) {
    return NextResponse.json({ error: "缺少 listA、style 或 season 参数" }, { status: 400 });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "MiniMax-M2.7",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `List A（用户已有单品）：${JSON.stringify(listA, null, 2)}\n风格偏好：${style}\n当前季节：${season}`,
            },
          ],
        },
      ],
      max_tokens: 2048,
      temperature: 0.3,
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

    let parsed: {
      missingItems: ClothingItem[];
      weeklyPlan: { day: string; note: string; itemIds: number[] }[];
    };

    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ error: "AI 返回格式解析失败" }, { status: 502 });
    }

    // 后端强制校验并修正每个单品
    const validatedItems: ClothingItem[] = (parsed.missingItems ?? []).map(
      (raw: Partial<ClothingItem>) => {
        const v = validateItem({ ...raw, tags: ["推荐新增"] });
        // 保留 AI 返回的 image，若为空则置空字符串
        return { ...v, image: raw.image ?? "" };
      }
    );

    return NextResponse.json({
      missingItems: validatedItems,
      weeklyPlan: parsed.weeklyPlan ?? [],
    });
  } catch (err) {
    console.error("[generate-plan] MiniMax API error:", err);
    return NextResponse.json({ error: "生成穿搭方案失败，请重试" }, { status: 502 });
  }
}
