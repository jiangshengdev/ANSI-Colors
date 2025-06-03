import { oklch } from 'culori';
import { ColorAnalysis, OklchColor } from './types';

/**
 * 分析颜色的 OKLCH 属性
 * @param hex - 十六进制颜色值
 * @returns 颜色分析结果
 */
export function analyzeColor(hex: string): ColorAnalysis {
  const color = oklch(hex);

  if (!color) {
    throw new Error(`无效的颜色值: ${hex}`);
  }

  return {
    hex,
    oklch: {
      l: color.l || 0,
      c: color.c || 0,
      h: color.h || 0,
    },
  };
}

/**
 * 格式化 OKLCH 颜色值为显示文本
 * @param oklch - OKLCH 颜色对象
 * @returns 格式化的颜色字符串
 */
export function formatOklchDisplay(oklch: OklchColor): string {
  const l = (oklch.l * 100).toFixed(1);
  const c = oklch.c.toFixed(3);
  const h = oklch.h?.toFixed(0) || '0';
  return `oklch(${l}% ${c} ${h}°)`;
}

/**
 * 判断是否为彩色（根据名称）
 * @param colorName - 颜色名称
 * @returns 是否为彩色
 */
export function isColorful(colorName: string): boolean {
  const colorfulNames = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];
  return colorfulNames.includes(colorName);
}
