/**
 * 图片压缩工具
 *
 * 目标：将图片压缩至 Base64 字符串不超过 1MB，
 * 以确保发送给 /api/recognize-clothing 的 payload 不超时。
 */

const MAX_BASE64_SIZE_MB = 1;
const MAX_BASE64_BYTES = MAX_BASE64_SIZE_MB * 1024 * 1024; // 1MB

/**
 * 将 File / Blob 压缩为 Base64 字符串（不超过 1MB）。
 *
 * @param file  原始图片文件
 * @param maxWidthOrSide  最大宽度或边长（默认 800px），超出则等比缩放
 * @returns Promise<{ base64: string; originalSize: number; compressedSize: number }>
 */
export async function compressImageToBase64(
  file: File | Blob,
  maxWidthOrSide = 800
): Promise<{ base64: string; originalSize: number; compressedSize: number }> {
  return new Promise((resolve, reject) => {
    const originalSize = file.size;
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("FileReader 读取失败"));

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error("图片加载失败"));
      img.onload = () => {
        try {
          // ── 1. 计算缩放尺寸 ────────────────────────────────────
          let { width, height } = img;
          if (width > maxWidthOrSide || height > maxWidthOrSide) {
            if (width >= height) {
              height = Math.round((height * maxWidthOrSide) / width);
              width = maxWidthOrSide;
            } else {
              width = Math.round((width * maxWidthOrSide) / height);
              height = maxWidthOrSide;
            }
          }

          // ── 2. 绘制到 Canvas ───────────────────────────────────
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas 2D 上下文获取失败"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);

          // ── 3. 逐档降低 JPEG 质量直到 < 1MB ───────────────────
          let quality = 0.92;
          let base64 = canvas.toDataURL("image/jpeg", quality);
          // toDataURL 为 data:image/jpeg;base64,xxxxx 格式，手动截掉前缀
          let rawBase64 = base64.includes(",") ? base64.split(",")[1] : base64;

          while (rawBase64.length > MAX_BASE64_BYTES * 1.34 && quality > 0.1) {
            // note: base64 编码后长度 ≈ 原始字节数 * 1.37
            quality -= 0.08;
            base64 = canvas.toDataURL("image/jpeg", quality);
            rawBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
          }

          // ── 4. 最终兜底：如果质量降到最低仍超标，直接缩半尺寸 ─────
          let finalBase64 = rawBase64;
          while (finalBase64.length > MAX_BASE64_BYTES * 1.34 && width > 200) {
            width = Math.round(width / 2);
            height = Math.round(height / 2);
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            finalBase64 = canvas.toDataURL("image/jpeg", 0.6).split(",")[1] ?? "";
          }

          resolve({
            // 返回完整 data URI（含 MIME 前缀），方便直接使用
            base64: canvas.toDataURL("image/jpeg", quality).includes(",")
              ? canvas.toDataURL("image/jpeg", quality)
              : `data:image/jpeg;base64,${finalBase64}`,
            originalSize,
            compressedSize: Math.ceil((finalBase64.length * 3) / 4),
          });
        } catch (err) {
          reject(err);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 仅返回纯 Base64 字符串（无 data URI 前缀），供 API 调用使用。
 */
export async function imageFileToBase64(file: File): Promise<string> {
  const { base64 } = await compressImageToBase64(file);
  return base64.includes(",") ? base64.split(",")[1] : base64;
}
