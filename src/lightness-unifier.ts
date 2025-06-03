// 亮度统一化工具类
import { oklch, formatHex } from 'culori';
import { TerminalColor, OklchColor } from './types';

export interface LightnessUnificationOptions {
  /** 目标亮度值 (0-1) */
  targetLightness?: number;
  /** 是否自动计算目标亮度（基于彩色的平均亮度） */
  autoCalculateTarget?: boolean;
  /** 是否保留黑白颜色不变 */
  preserveMonochrome?: boolean;
  /** 亮度调整的最大变化量 (0-1) */
  maxLightnessChange?: number;
  /** 是否保持相对亮度关系 */
  preserveRelativeOrder?: boolean;
}

export class LightnessUnifier {
  private static readonly COLORFUL_NAMES = [
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
  ];
  private static readonly MONOCHROME_NAMES = ['black', 'white'];

  /**
   * 统一终端颜色的亮度
   */
  static unifyLightness(
    colors: TerminalColor,
    options: LightnessUnificationOptions = {},
  ): TerminalColor {
    const {
      targetLightness,
      autoCalculateTarget = true,
      preserveMonochrome = true,
      maxLightnessChange = 0.3,
      preserveRelativeOrder = true,
    } = options;

    // 获取彩色颜色
    const colorfulColors = this.getColorfulColors(colors);

    // 计算或使用指定的目标亮度
    let finalTargetLightness = targetLightness;
    if (autoCalculateTarget && !targetLightness) {
      finalTargetLightness = this.calculateAverageLightness(colorfulColors);
    }

    if (!finalTargetLightness) {
      throw new Error('必须指定目标亮度或启用自动计算');
    }

    // 创建结果对象
    const result: TerminalColor = { ...colors };

    // 统一彩色的亮度
    if (preserveRelativeOrder) {
      this.unifyWithRelativeOrder(
        result,
        colorfulColors,
        finalTargetLightness,
        maxLightnessChange,
      );
    } else {
      this.unifyToSameLightness(
        result,
        colorfulColors,
        finalTargetLightness,
        maxLightnessChange,
      );
    }

    return result;
  }

  /**
   * 获取彩色颜色及其分析
   */
  private static getColorfulColors(
    colors: TerminalColor,
  ): Array<{ name: string; hex: string; oklch: OklchColor }> {
    return this.COLORFUL_NAMES.map((name) => {
      const hex = colors[name];
      const oklchColor = oklch(hex);
      return {
        name,
        hex,
        oklch: {
          l: oklchColor?.l || 0,
          c: oklchColor?.c || 0,
          h: oklchColor?.h || 0,
        },
      };
    });
  }

  /**
   * 计算彩色的平均亮度
   */
  private static calculateAverageLightness(
    colorfulColors: Array<{ oklch: OklchColor }>,
  ): number {
    const totalLightness = colorfulColors.reduce(
      (sum, color) => sum + color.oklch.l,
      0,
    );
    return totalLightness / colorfulColors.length;
  }

  /**
   * 统一到相同亮度
   */
  private static unifyToSameLightness(
    result: TerminalColor,
    colorfulColors: Array<{ name: string; hex: string; oklch: OklchColor }>,
    targetLightness: number,
    maxChange: number,
  ): void {
    colorfulColors.forEach(({ name, oklch: originalOklch }) => {
      const lightnessDiff = Math.abs(originalOklch.l - targetLightness);
      const adjustedLightness =
        lightnessDiff > maxChange
          ? originalOklch.l +
            Math.sign(targetLightness - originalOklch.l) * maxChange
          : targetLightness;

      const newColor = {
        mode: 'oklch' as const,
        l: adjustedLightness,
        c: originalOklch.c,
        h: originalOklch.h,
      };

      const newHex = formatHex(newColor);
      if (newHex) {
        result[name] = newHex;
      }
    });
  }

  /**
   * 保持相对亮度关系的统一
   */
  private static unifyWithRelativeOrder(
    result: TerminalColor,
    colorfulColors: Array<{ name: string; hex: string; oklch: OklchColor }>,
    targetLightness: number,
    maxChange: number,
  ): void {
    // 计算当前平均亮度
    const currentAverage = this.calculateAverageLightness(colorfulColors);
    const lightnessShift = targetLightness - currentAverage;

    // 限制最大变化量
    const limitedShift =
      Math.sign(lightnessShift) * Math.min(Math.abs(lightnessShift), maxChange);

    colorfulColors.forEach(({ name, oklch: originalOklch }) => {
      const newLightness = Math.max(
        0,
        Math.min(1, originalOklch.l + limitedShift),
      );

      const newColor = {
        mode: 'oklch' as const,
        l: newLightness,
        c: originalOklch.c,
        h: originalOklch.h,
      };

      const newHex = formatHex(newColor);
      if (newHex) {
        result[name] = newHex;
      }
    });
  }

  /**
   * 分析亮度统一的效果
   */
  static analyzeLightnessUnification(
    original: TerminalColor,
    unified: TerminalColor,
  ): {
    originalStats: { average: number; range: number; variance: number };
    unifiedStats: { average: number; range: number; variance: number };
    changes: Array<{
      name: string;
      originalL: number;
      unifiedL: number;
      change: number;
    }>;
  } {
    const getStats = (colors: TerminalColor) => {
      const colorfulColors = this.getColorfulColors(colors);
      const lightnesses = colorfulColors.map((c) => c.oklch.l);

      const average =
        lightnesses.reduce((sum, l) => sum + l, 0) / lightnesses.length;
      const range = Math.max(...lightnesses) - Math.min(...lightnesses);
      const variance =
        lightnesses.reduce((sum, l) => sum + Math.pow(l - average, 2), 0) /
        lightnesses.length;

      return { average, range, variance };
    };

    const originalColorful = this.getColorfulColors(original);
    const unifiedColorful = this.getColorfulColors(unified);

    const changes = originalColorful.map((orig, index) => {
      const unified = unifiedColorful[index];
      return {
        name: orig.name,
        originalL: orig.oklch.l,
        unifiedL: unified.oklch.l,
        change: unified.oklch.l - orig.oklch.l,
      };
    });

    return {
      originalStats: getStats(original),
      unifiedStats: getStats(unified),
      changes,
    };
  }
}
