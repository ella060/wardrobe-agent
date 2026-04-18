import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  validateItem,
  type ClothingCategory,
  type ClothingColor,
  type ClothingSeason,
  type ClothingTag,
} from "@/types/wardrobe";

// ─── MiniMax OpenAI-compatible SDK ──────────────────────────────

const client = new OpenAI({
  baseURL: "https://api.minimaxi.com/v1",
  apiKey: process.env.MINIMAX_API_KEY ?? "",
});

// ─── 严格 System Prompt ──────────────────────────────────────────

const SYSTEM_PROMPT =
  `你是一个时尚单品解析专家。你必须分析图片并仅返回一个 JSON 对象，不得有任何额外文字。` +
  `必须且只能从以下枚举值中选择（不得添加或省略任何字段）：\n` +
  `{ "category": "上装" | "下装" | "外套" | "连衣裙", ` +
  `"color": "白" | "黑" | "红" | "橙" | "黄" | "绿" | "青" | "蓝" | "紫", ` +
  `"season": "夏" | "春秋" | "冬", "tags": ["已有"] }` +
  `请严格返回上述格式 JSON，禁止添加 description、name 或任何其他字段。`;

// ─── POST handler ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let imageBase64: string;

  try {
    const body = await req.json();
    imageBase64 = body.image as string;
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json({ error: "缺少 image 字段" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "请求体解析失败" }, { status: 400 });
  }

  if (!process.env.MINIMAX_API_KEY) {
    return NextResponse.json({ error: "服务器未配置 MINIMAX_API_KEY" }, { status: 500 });
  }

  // 拼成 data URI（MiniMax / OpenAI vision 接受 data URI）
  const imageUri = imageBase64.startsWith("data:")
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`;

  try {
    const completion = await client.chat.completions.create({
      model: "abab6.5s-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imageUri, detail: "high" },
            },
            {
              type: "text",
              text: "请分析这件时尚单品的属性，严格按枚举格式返回 JSON。",
            },
          ],
        },
      ],
      max_tokens: 256,
      temperature: 0.1,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";

    // 尝试从 ```json ... ``` 中提取 JSON
    let jsonStr = raw;
    const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();
    // 也处理纯 `{` 开头的情况
    const firstBrace = jsonStr.indexOf("{");
    const lastBrace = jsonStr.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // JSON 解析失败时，用 validateItem 做安全降级
      parsed = {};
    }

    // 后端强制校验 + 修正
    const validated = validateItem({
      category: (parsed["category"] as ClothingCategory | undefined) ?? undefined,
      color: (parsed["color"] as ClothingColor | undefined) ?? undefined,
      season: (parsed["season"] as ClothingSeason | undefined) ?? undefined,
      tags: Array.isArray(parsed["tags"]) ? (parsed["tags"] as ClothingTag[]) : ["已有"],
    });

    return NextResponse.json({
      category: validated.category,
      color: validated.color,
      season: validated.season,
      tags: validated.tags,
      // id / image 由前端处理
    });
  } catch (err) {
    console.error("[recognize-clothing] MiniMax API error:", err);
    return NextResponse.json(
      { error: "图片识别失败，请重试" },
      { status: 502 }
    );
  }
}
