import type { ClothingItem, StylePreference, WeekOutfit } from "@/types/wardrobe";

// ─── 知识库：7 个经典胶囊衣橱案例 ───────────────────────────────
// 每一套覆盖周一到周日一个场景，所有案例集合即完整风格模板。

type CapsuleCase = {
  id: string;
  name: string;
  items: string[]; // 所需单品描述（供 Diff 比对）
  week: { day: string; note: string }[];
};

const CAPSULE_WARDROBE: Record<StylePreference, CapsuleCase[]> = {
  法式: [
    {
      id: "fr-case-1",
      name: "条纹衫 × 直筒裤",
      items: ["条纹衫（蓝白/黑白）", "高腰直筒牛仔裤", "芭蕾平底鞋"],
      week: [
        { day: "周一", note: "条纹衫 + 直筒牛仔裤 + 芭蕾平底鞋，慵懒优雅" },
        { day: "周二", note: "换成黑色直筒裤 + 玛丽珍鞋，通勤切换" },
        { day: "周三", note: "外搭牛仔外套，层次感更丰富" },
        { day: "周四", note: "换一件彩色条纹衫，提亮整体" },
        { day: "周五", note: "条纹衫 + 迷笛裙，约会感" },
        { day: "周六", note: "换休闲短裤 + 草编底鞋" },
        { day: "周日", note: "米白条纹 + 亚麻裤 + 编织包" },
      ],
    },
    {
      id: "fr-case-2",
      name: "西装 × 丝绸裙",
      items: ["黑色修身西装", "丝绸连衣裙", "尖头细高跟鞋"],
      week: [
        { day: "周一", note: "黑色西装 + 白色丝绸裙 + 细高跟，干练不失女人味" },
        { day: "周二", note: "西装 + 针织裙 + 乐福鞋" },
        { day: "周三", note: "单穿丝绸裙，外搭轻薄风衣" },
        { day: "周四", note: "西装 + 碎花裙，柔中带刚" },
        { day: "周五", note: "换成缎面半身裙 + 精致皮带" },
        { day: "周六", note: "脱掉西装，换针织开衫 + 伞裙" },
        { day: "周日", note: "全白丝绸套装 + 裸色尖头鞋" },
      ],
    },
    {
      id: "fr-case-3",
      name: "针织 × 阔腿裤",
      items: ["针织开衫（米/驼）", "高腰阔腿裤", "草编包"],
      week: [
        { day: "周一", note: "驼色针织开衫 + 黑色阔腿裤 + 草编包" },
        { day: "周二", note: "换成米白针织 + 白裤，清爽" },
        { day: "周三", note: "针织叠穿 T 恤，下摆打结增加层次" },
        { day: "周四", note: "换一件燕麦色针织，半塞裤腰" },
        { day: "周五", note: "针织 + 牛仔阔腿裤 + 皮质草编鞋" },
        { day: "周六", note: "针织 + 亚麻短裤 + 渔夫鞋" },
        { day: "周日", note: "全针织套装 + 大号草编托特包" },
      ],
    },
    {
      id: "fr-case-4",
      name: "白衬衫 × 伞裙",
      items: ["经典白衬衫", "高腰伞裙", "小猫跟"],
      week: [
        { day: "周一", note: "白衬衫 + 黑色伞裙 + 小猫跟，法式通勤" },
        { day: "周二", note: "衬衫袖口卷起，伞裙换成卡其" },
        { day: "周三", note: "衬衫下摆全塞，搭棕色皮带" },
        { day: "周四", note: "换成浅蓝衬衫 + 藏青伞裙" },
        { day: "周五", note: "全白造型 + 金色细细腰链" },
        { day: "周六", note: "大衬衫当外套，内搭背心 + 伞裙" },
        { day: "周日", note: "亚麻白衬衫 + 浅卡其伞裙 + 帆布鞋" },
      ],
    },
    {
      id: "fr-case-5",
      name: "风衣 × 踝靴",
      items: ["经典卡其风衣", "九分裤", "皮质踝靴"],
      week: [
        { day: "周一", note: "卡其风衣 + 九分牛仔裤 + 黑色踝靴" },
        { day: "周二", note: "换成军绿风衣 + 黑色九分裤 + 驼色踝靴" },
        { day: "周三", note: "风衣当披肩，内搭高领 + 九分西裤" },
        { day: "周四", note: "换一件浅沙色轻薄风衣" },
        { day: "周五", note: "风衣 + 白色九分裤 + 裸色踝靴" },
        { day: "周六", note: "风衣 + 锥形裤 + 帆布鞋" },
        { day: "周日", note: "长风衣 + 亚麻长裤 + 平底靴" },
      ],
    },
    {
      id: "fr-case-6",
      name: "茶歇裙 × 玛丽珍",
      items: ["茶歇裙（碎花/纯色）", "玛丽珍鞋", "小型手拿包"],
      week: [
        { day: "周一", note: "深色茶歇裙 + 黑色玛丽珍 + 手拿包" },
        { day: "周二", note: "换成浅碎花 + 裸色玛丽珍" },
        { day: "周三", note: "外搭亚麻西装外套，平衡甜度" },
        { day: "周四", note: "纯色茶歇裙 + 金属扣玛丽珍" },
        { day: "周五", note: "换一条红色碎花茶歇裙，明艳" },
        { day: "周六", note: "茶歇裙 + 草编底玛丽珍鞋" },
        { day: "周日", note: "米白纯茶歇裙 + 裸色细带玛丽珍" },
      ],
    },
    {
      id: "fr-case-7",
      name: "高领 × 大衣",
      items: ["黑色高领衫", "双排扣大衣", "麂皮靴"],
      week: [
        { day: "周一", note: "黑色高领 + 深蓝双排扣大衣 + 麂皮靴" },
        { day: "周二", note: "换成灰色大衣 + 同色系高领" },
        { day: "周三", note: "高领叠穿白衬衫，下摆露出来" },
        { day: "周四", note: "换一件焦糖色大衣，暖调优雅" },
        { day: "周五", note: "高领 + 超长大衣 + 袜靴式踝靴" },
        { day: "周六", note: "脱掉大衣，高领 + 牛仔裤 + 麂皮乐福鞋" },
        { day: "周日", note: "米白大衣 + 炭灰高领 + 驼色麂皮靴" },
      ],
    },
  ],

  静奢: [
    {
      id: "ql-case-1",
      name: "羊绒 × 羊毛阔腿裤",
      items: ["羊绒衫（米/灰）", "羊毛阔腿裤", "皮革乐福鞋"],
      week: [
        { day: "周一", note: "米白羊绒衫 + 炭灰阔腿裤 + 黑色乐福鞋，低调质感" },
        { day: "周二", note: "换成燕麦色羊绒 + 同色系阔腿裤" },
        { day: "周三", note: "叠穿高领羊绒，外披羊毛大衣" },
        { day: "周四", note: "浅灰羊绒 + 深炭阔腿裤 + 驼色皮底鞋" },
        { day: "周五", note: "换成炭黑羊绒 + 中灰阔腿裤 + 黑色乐福" },
        { day: "周六", note: "羊绒大毛衣 + 白色阔腿裤 + 帆布便鞋" },
        { day: "周日", note: "米灰羊绒 + 浅米阔腿裤 + 精致芭蕾鞋" },
      ],
    },
    {
      id: "ql-case-2",
      name: "真丝衬衫 × 西裤",
      items: ["真丝衬衫（象牙白）", "定制西裤", "简约手表"],
      week: [
        { day: "周一", note: "象牙白真丝衬衫 + 深蓝西裤 + 简约皮手表" },
        { day: "周二", note: "换成浅灰衬衫 + 炭灰西裤" },
        { day: "周三", note: "衬衫袖口卷起，搭金色细腰带" },
        { day: "周四", note: "换成淡粉真丝衬衫 + 藏青西裤" },
        { day: "周五", note: "全白造型，真丝衬衫 + 白色西裤 + 金色配饰" },
        { day: "周六", note: "真丝衬衫当外套，内搭高领针织" },
        { day: "周日", note: "亚麻真丝衬衫 + 卡其裤 + 编织皮带" },
      ],
    },
  ],

  极简: [
    {
      id: "mn-case-1",
      name: "白T × 黑裤",
      items: ["白T（合身）", "黑色直筒裤", "小白鞋"],
      week: [
        { day: "周一", note: "白T + 黑裤 + 小白鞋，经典极简" },
        { day: "周二", note: "换成圆领白 Tee + 黑色锥形裤" },
        { day: "周三", note: "外搭黑色西装外套，正式感" },
        { day: "周四", note: "换成 V 领白 Tee，修饰脖颈线条" },
        { day: "周五", note: "全黑造型，内搭白 Tee 露出下摆" },
        { day: "周六", note: "白 Tee + 灰色休闲裤 + 黑色便鞋" },
        { day: "周日", note: "宽松白衬衫 + 黑裤 + 极简凉鞋" },
      ],
    },
    {
      id: "mn-case-2",
      name: "黑西装 × 白衬衫",
      items: ["黑色西装", "白色衬衫", "黑色皮鞋"],
      week: [
        { day: "周一", note: "黑西装 + 白衬衫 + 黑皮鞋，精准干练" },
        { day: "周二", note: "西装不解扣，内搭高领黑衫" },
        { day: "周三", note: "换灰色西装 + 白衬衫 + 黑色踝靴" },
        { day: "周四", note: "白色高领衫 + 黑色西裤 + 棕色皮鞋" },
        { day: "周五", note: "黑色单西 + 白 Tee + 黑色便鞋" },
        { day: "周六", note: "脱掉西装，黑 Tee + 牛仔 + 黑皮靴" },
        { day: "周日", note: "白色亚麻西装 + 白裤 + 同色系帆布鞋" },
      ],
    },
  ],

  户外: [
    {
      id: "ot-case-1",
      name: "工装裤 × 卫衣",
      items: ["纯色连帽卫衣", "工装休闲裤", "徒步靴"],
      week: [
        { day: "周一", note: "军绿卫衣 + 卡其工装裤 + 徒步靴" },
        { day: "周二", note: "换成深灰卫衣 + 黑色工装裤" },
        { day: "周三", note: "卫衣叠穿白 Tee，下摆露出来" },
        { day: "周四", note: "换成藏青色工装裤 + 白色运动鞋" },
        { day: "周五", note: "山系夹克 + 工装裤 + 防水徒步靴" },
        { day: "周六", note: "全山系造型，抓绒衣 + 工装 + 登山鞋" },
        { day: "周日", note: "轻薄防风衣 + 速干工装短裤 + 溯溪鞋" },
      ],
    },
  ],

  街头: [
    {
      id: "st-case-1",
      name: "卫衣 × 运动裤",
      items: ["logo卫衣", "宽松运动裤", "复古球鞋"],
      week: [
        { day: "周一", note: "黑色logo卫衣 + 灰色运动裤 + 白色球鞋" },
        { day: "周二", note: "换成彩色卫衣 + 黑色运动裤" },
        { day: "周三", note: "卫衣套装，同色系运动装 + 复古跑鞋" },
        { day: "周四", note: "换成拼接卫衣 + 直筒运动裤 + 高帮球鞋" },
        { day: "周五", note: "加一件MA-1飞行员夹克，层次感" },
        { day: "周六", note: "全套运动装 + 亮色袜子点缀" },
        { day: "周日", note: "素色卫衣 + 直筒牛仔裤 + 白色板鞋" },
      ],
    },
  ],

  复古: [
    {
      id: "vt-case-1",
      name: "格纹 × 高腰裤",
      items: ["格纹西装", "高腰直筒裤", "乐福鞋"],
      week: [
        { day: "周一", note: "黑白格纹西装 + 高腰直筒裤 + 黑色乐福鞋" },
        { day: "周二", note: "换成棕色格纹 + 灯芯绒高腰裤 + 乐福鞋" },
        { day: "周三", note: "单穿格纹西装 + 皮带强调腰线" },
        { day: "周四", note: "格纹马甲 + 高腰西裤 + 雕花乐福鞋" },
        { day: "周五", note: "换一套棕色格纹套装 + 玛丽珍鞋" },
        { day: "周六", note: "格纹衬衫 + 牛仔高腰裤 + 帆布鞋" },
        { day: "周日", note: "波点衬衫 + 高腰伞裙 + 复古玛丽珍" },
      ],
    },
  ],

  商务: [
    {
      id: "bs-case-1",
      name: "西装 × 领带",
      items: ["藏青西装", "白衬衫", "真丝领带"],
      week: [
        { day: "周一", note: "藏青西装 + 白衬衫 + 深蓝领带，干练" },
        { day: "周二", note: "换成灰色西装 + 浅蓝衬衫 + 银色领带" },
        { day: "周三", note: "西装 + 高领针织衫，不打领带也正式" },
        { day: "周四", note: "换一套细条纹西装 + 同色系领带" },
        { day: "周五", note: "单西 + 白 Tee + 深色牛仔，正式休闲" },
        { day: "周六", note: "针织西装 + 白裤 + 麂皮德比鞋" },
        { day: "周日", note: "亚麻西装 + 卡其裤 + 棕色乐福鞋" },
      ],
    },
  ],
};

// ─── 用户衣橱解析 ───────────────────────────────────────────────

interface WardrobeAnalysis {
  categories: Set<string>;
  colors: Set<string>;
  seasons: Set<string>;
}

function analyzeWardrobe(items: ClothingItem[]): WardrobeAnalysis {
  return {
    categories: new Set(items.map((i) => i.category)),
    colors: new Set(items.map((i) => i.color)),
    seasons: new Set(items.map((i) => i.season)),
  };
}

// ─── Diff 计算（Mock：法式风格）───────────────────────────────────

interface MissingItem {
  name: string;
  reason: string;
}

function computeMissingForFrench(
  wardrobe: ClothingItem[]
): MissingItem[] {
  const { categories } = analyzeWardrobe(wardrobe);
  const missing: MissingItem[] = [];

  // 用户已有：top(白T)、bottom(黑裤)、outerwear(牛仔外套)
  // 法式胶囊模板需要但用户没有的：
  if (!categories.has("top")) {
    missing.push({ name: "条纹衫（蓝白）", reason: "法式经典元素，与现有裤装互补" });
  }
  if (!categories.has("bottom")) {
    missing.push({ name: "高腰直筒牛仔裤", reason: "法式高腰剪裁，拉长比例" });
  }
  if (!categories.has("outerwear")) {
    missing.push({ name: "经典卡其风衣", reason: "春秋必备，搭所有内搭" });
  }

  // 额外补足 7 套案例中最缺失的：
  missing.push(
    { name: "茶歇裙（碎花/纯色）", reason: "覆盖周五约会、周日出行等场景" },
    { name: "芭蕾平底鞋 / 玛丽珍鞋", reason: "法式标志性鞋履，连接慵懒与精致" },
    { name: "草编包 / 精致手拿包", reason: "提升整体造型完成度" },
    { name: "针织开衫（米/驼）", reason: "解决周三层次叠穿与周日保暖需求" },
  );

  return missing;
}

// ─── 生成计划（异步，模拟 4 步进度）─────────────────────────────────

export type ProgressMessage =
  | "正在检索风格模板…"
  | "正在解析 7 个胶囊案例…"
  | "正在比对衣橱差值…"
  | "正在最优化求解新增清单…"
  | "完成";

export interface PlanResult {
  missingItems: MissingItem[];
  weeklyPlan: WeekOutfit[];
}

export async function generatePlan(
  style: StylePreference,
  wardrobe: ClothingItem[]
): Promise<PlanResult> {
  const cases = CAPSULE_WARDROBE[style] ?? CAPSULE_WARDROBE["极简"];

  await delay(500); // 模拟检索
  await delay(600); // 模拟解析案例
  await delay(500); // 模拟 Diff 比对
  await delay(400); // 模拟求解

  let missing: MissingItem[];
  if (style === "法式") {
    missing = computeMissingForFrench(wardrobe);
  } else {
    // 通用降级：取第一个案例的 items 作为 missing
    missing = cases[0].items.map((item) => ({
      name: item,
      reason: `完善 ${style} 风格所需`,
    }));
  }

  // 合并所有案例的 week 计划（取前 7 天，每天一条）
  const weeklyPlan: WeekOutfit[] = cases
    .flatMap((c) => c.week)
    .slice(0, 7)
    .map((w, i) => ({ day: w.day, note: w.note, itemIds: [] }));

  return { missingItems: missing, weeklyPlan };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
