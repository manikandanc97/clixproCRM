/**
 * Utility functions for RGB/HSL conversions, accessible theme palette generation,
 * and client-side dominant color extraction preview.
 */

export interface BrandPalette {
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primaryLight: string;
  accentBg: string;
  ring: string;
  foreground: string;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const sanitized = hex.replace(/^#/, '').trim();
  if (sanitized.length === 3) {
    const r = parseInt(sanitized[0] + sanitized[0], 16);
    const g = parseInt(sanitized[1] + sanitized[1], 16);
    const b = parseInt(sanitized[2] + sanitized[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (sanitized.length === 6) {
    const r = parseInt(sanitized.slice(0, 2), 16);
    const g = parseInt(sanitized.slice(2, 4), 16);
    const b = parseInt(sanitized.slice(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

export function isValidHexColor(hex?: string | null): boolean {
  if (!hex) return false;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim());
}

export function toValidHex7(hex?: string | null, fallback = "#10b981"): string {
  if (!hex) return fallback;
  const trimmed = hex.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed;
  if (/^#[0-9A-Fa-f]{3}$/.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }
  return fallback;
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  const hexR = clamp(r).toString(16).padStart(2, '0');
  const hexG = clamp(g).toString(16).padStart(2, '0');
  const hexB = clamp(b).toString(16).padStart(2, '0');
  return `#${hexR}${hexG}${hexB}`;
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s, l };
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h = (h % 360 + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * Generate full accessible theme palette (hover, active, light, accent, foreground)
 */
export function generateBrandPalette(hexColor?: string | null): BrandPalette {
  const defaultHex = '#10b981'; // ClixProCRM emerald
  const targetHex = hexColor && /^#[0-9A-Fa-f]{3,6}$/.test(hexColor) ? hexColor : defaultHex;
  const rgb = hexToRgb(targetHex) || { r: 16, g: 185, b: 129 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Compute Hover (slightly darker in light mode, slightly lighter in dark mode)
  const hoverRgb = hslToRgb(hsl.h, hsl.s, Math.max(0.15, hsl.l - 0.08));
  const activeRgb = hslToRgb(hsl.h, hsl.s, Math.max(0.1, hsl.l - 0.14));

  // Compute contrast foreground text (WCAG luminance)
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  const foreground = luminance > 0.65 ? '#0f172a' : '#ffffff';

  return {
    primary: targetHex,
    primaryHover: rgbToHex(hoverRgb.r, hoverRgb.g, hoverRgb.b),
    primaryActive: rgbToHex(activeRgb.r, activeRgb.g, activeRgb.b),
    primaryLight: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.14)`,
    accentBg: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`,
    ring: targetHex,
    foreground,
  };
}

/**
 * Client-side dominant color extractor using HTML Canvas for instant visual feedback.
 */
export async function extractDominantColorClient(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve('#10b981');
            return;
          }

          const size = 64;
          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(img, 0, 0, size, size);

          const imgData = ctx.getImageData(0, 0, size, size).data;
          const clusters: Map<string, { count: number; r: number; g: number; b: number; score: number }> = new Map();

          for (let i = 0; i < imgData.length; i += 4) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            const a = imgData[i + 3];

            if (a < 128) continue;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const delta = max - min;
            const lightness = (max + min) / 2 / 255;

            // Ignore pure/near white, pure/near black, or neutral gray
            if (lightness > 0.92 || (r > 235 && g > 235 && b > 235)) continue;
            if (lightness < 0.1 || (r < 25 && g < 25 && b < 25)) continue;
            if (delta < 24) continue;

            const saturation = lightness > 0.5 ? delta / (510 - max - min) : delta / (max + min);
            if (saturation < 0.18) continue;

            let h = 0;
            if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
            else if (max === g) h = ((b - r) / delta + 2) * 60;
            else h = ((r - g) / delta + 4) * 60;

            const hueBin = Math.floor(h / 15);
            const satBin = Math.floor(saturation * 3);
            const key = `${hueBin}_${satBin}`;
            const weight = saturation * 2.0 * (1 - Math.abs(lightness - 0.5) * 0.8);

            const existing = clusters.get(key);
            if (existing) {
              existing.count += 1;
              existing.r += r;
              existing.g += g;
              existing.b += b;
              existing.score += weight;
            } else {
              clusters.set(key, { count: 1, r, g, b, score: weight });
            }
          }

          if (clusters.size === 0) {
            resolve('#10b981');
            return;
          }

          let best: { count: number; r: number; g: number; b: number; score: number } | null = null;
          for (const c of clusters.values()) {
            if (!best || c.score > best.score) {
              best = c;
            }
          }

          if (!best || best.count === 0) {
            resolve('#10b981');
            return;
          }

          const hex = rgbToHex(best.r / best.count, best.g / best.count, best.b / best.count);
          resolve(hex);
        } catch {
          resolve('#10b981');
        }
      };
      img.onerror = () => resolve('#10b981');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('#10b981');
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts a rich multi-swatch palette (up to 8 colors) directly from a logo (Image URL or File).
 */
export async function extractLogoPalette(
  imageSource: string | File,
  maxColors = 8
): Promise<string[]> {
  return new Promise((resolve) => {
    const processImage = (img: HTMLImageElement) => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve([]);

        const size = 80;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size).data;
        const clusters: Map<
          string,
          { count: number; r: number; g: number; b: number; score: number }
        > = new Map();

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue; // Transparent

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const delta = max - min;
          const lightness = (max + min) / 2 / 255;

          // Ignore extreme white (>94%) or extreme black (<8%)
          if (lightness > 0.94 || (r > 240 && g > 240 && b > 240)) continue;
          if (lightness < 0.08 || (r < 20 && g < 20 && b < 20)) continue;

          // Saturation
          const saturation =
            lightness > 0.5 ? delta / (510 - max - min) : delta / (max + min);

          // Hue in [0, 360)
          let h = 0;
          if (delta > 0) {
            if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
            else if (max === g) h = ((b - r) / delta + 2) * 60;
            else h = ((r - g) / delta + 4) * 60;
          }

          const hueBin = Math.floor(h / 15); // 24 hue bins
          const satBin = Math.floor(saturation * 3); // 3 sat bins
          const key = `${hueBin}_${satBin}`;

          const vibrancy =
            saturation > 0.15
              ? saturation * 2.0 * (1 - Math.abs(lightness - 0.5) * 0.7)
              : 0.3;

          const existing = clusters.get(key);
          if (existing) {
            existing.count += 1;
            existing.r += r;
            existing.g += g;
            existing.b += b;
            existing.score += vibrancy;
          } else {
            clusters.set(key, {
              count: 1,
              r,
              g,
              b,
              score: vibrancy,
            });
          }
        }

        if (clusters.size === 0) {
          return resolve([]);
        }

        // Sort clusters by combined score and frequency
        const sorted = Array.from(clusters.values()).sort(
          (a, b) => b.score * b.count - a.score * a.count
        );

        const resultHexes: string[] = [];
        const seenColors: { r: number; g: number; b: number }[] = [];

        for (const c of sorted) {
          const r = Math.round(c.r / c.count);
          const g = Math.round(c.g / c.count);
          const b = Math.round(c.b / c.count);

          // Check color distance to avoid almost identical swatches
          const isTooClose = seenColors.some((prev) => {
            const dr = prev.r - r;
            const dg = prev.g - g;
            const db = prev.b - b;
            return Math.sqrt(dr * dr + dg * dg + db * db) < 32;
          });

          if (!isTooClose) {
            seenColors.push({ r, g, b });
            resultHexes.push(rgbToHex(r, g, b));
            if (resultHexes.length >= maxColors) break;
          }
        }

        resolve(resultHexes);
      } catch {
        resolve([]);
      }
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => processImage(img);
    img.onerror = () => resolve([]);

    if (imageSource instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve([]);
      reader.readAsDataURL(imageSource);
    } else {
      img.src = imageSource;
    }
  });
}
