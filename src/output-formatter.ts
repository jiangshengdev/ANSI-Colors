import { ColorStats, ThemeColors } from './types';
import { analyzeColor, formatOklchDisplay } from './color-analyzer';

/**
 * 输出工具类
 */
export class OutputFormatter {
  /**
   * 输出主题分析标题
   * @param themeName - 主题名称
   */
  static printHeader(themeName: string): void {
    console.log(`🎨 分析 ${themeName} 主题...\n`);
  }

  /**
   * 输出基础颜色信息
   * @param theme - 主题颜色配置
   */
  static printBasicColors(theme: ThemeColors): void {
    console.log('📐 基础颜色:');
    console.log(`  背景: ${theme.background}`);
    console.log(`  前景: ${theme.foreground}`);
    console.log(`  强调: ${theme.accent}\n`);
  }

  /**
   * 输出颜色分析详情
   * @param title - 标题
   * @param colors - 颜色映射
   */
  static printColorAnalysis(
    title: string,
    colors: Record<string, string>,
  ): void {
    console.log(`${title}:`);

    Object.entries(colors).forEach(([key, hex]) => {
      const analysis = analyzeColor(hex);
      const formattedOklch = formatOklchDisplay(analysis.oklch);
      console.log(`  ${key.padEnd(8)}: ${hex} → ${formattedOklch}`);
    });
    console.log();
  }

  /**
   * 输出彩色平均亮度分析
   * @param normalStats - Normal 颜色统计
   * @param brightStats - Bright 颜色统计
   */
  static printColorfulAverageAnalysis(
    normalStats: ColorStats,
    brightStats: ColorStats,
  ): void {
    console.log('🌈 彩色平均亮度分析:');
    console.log(
      `  Normal 彩色: ${(normalStats.average * 100).toFixed(1)}% (${normalStats.count} 种颜色)`,
    );
    console.log(
      `  Bright 彩色: ${(brightStats.average * 100).toFixed(1)}% (${brightStats.count} 种颜色)`,
    );
    console.log();
  }

  /**
   * 输出详细的彩色信息
   * @param title - 标题
   * @param colorStats - 颜色统计信息
   */
  static printColorfulDetails(title: string, colorStats: ColorStats): void {
    if (colorStats.colors.length === 0) return;

    console.log(`📊 ${title}:`);
    colorStats.colors.forEach((color) => {
      console.log(
        `    ${color.name.padEnd(8)}: ${color.hex} (L: ${(color.lightness * 100).toFixed(1)}%)`,
      );
    });
    console.log();
  }

  /**
   * 输出错误信息
   * @param error - 错误对象或消息
   */
  static printError(error: unknown): void {
    console.error('❌ 分析失败:', error);
  }

  /**
   * 输出成功信息
   * @param message - 成功消息
   */
  static printSuccess(message: string): void {
    console.log(`✅ ${message}`);
  }
}
