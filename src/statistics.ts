import { ColorStats } from './types';
import { analyzeColor, isColorful } from './color-analyzer';

/**
 * 计算彩色的平均亮度
 * @param colors - 颜色映射对象
 * @returns 彩色统计信息
 */
export function calculateColorfulAverageLightness(
  colors: Record<string, string>,
): ColorStats {
  const colorfulColors = Object.entries(colors).filter(([name]) =>
    isColorful(name),
  );

  if (colorfulColors.length === 0) {
    return { count: 0, average: 0, colors: [] };
  }

  const lightnesses = colorfulColors.map(([name, hex]) => {
    const analysis = analyzeColor(hex);
    return { name, hex, lightness: analysis.oklch.l };
  });

  const averageLightness =
    lightnesses.reduce((sum, item) => sum + item.lightness, 0) /
    lightnesses.length;

  return {
    count: colorfulColors.length,
    average: averageLightness,
    colors: lightnesses,
  };
}

/**
 * 计算所有颜色的统计信息
 * @param colors - 颜色映射对象
 * @returns 所有颜色的统计信息
 */
export function calculateAllColorsStats(
  colors: Record<string, string>,
): ColorStats {
  const colorEntries = Object.entries(colors);

  if (colorEntries.length === 0) {
    return { count: 0, average: 0, colors: [] };
  }

  const lightnesses = colorEntries.map(([name, hex]) => {
    const analysis = analyzeColor(hex);
    return { name, hex, lightness: analysis.oklch.l };
  });

  const averageLightness =
    lightnesses.reduce((sum, item) => sum + item.lightness, 0) /
    lightnesses.length;

  return {
    count: colorEntries.length,
    average: averageLightness,
    colors: lightnesses,
  };
}
