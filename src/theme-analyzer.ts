import { ThemeAnalysis } from './types';
import { loadTheme } from './theme-loader';
import { calculateColorfulAverageLightness } from './statistics';

/**
 * 主题分析器类
 */
export class ThemeAnalyzer {
  /**
   * 分析主题文件
   * @param filePath - 主题文件路径
   * @returns 主题分析结果
   */
  static analyze(filePath: string): ThemeAnalysis {
    const theme = loadTheme(filePath);

    const normalColorStats = calculateColorfulAverageLightness(
      theme.terminal_colors.normal,
    );

    const brightColorStats = calculateColorfulAverageLightness(
      theme.terminal_colors.bright,
    );

    return {
      theme,
      normalColorStats,
      brightColorStats,
    };
  }

  /**
   * 批量分析多个主题文件
   * @param filePaths - 主题文件路径数组
   * @returns 主题分析结果数组
   */
  static analyzeMultiple(filePaths: string[]): ThemeAnalysis[] {
    return filePaths.map((filePath) => this.analyze(filePath));
  }

  /**
   * 比较两个主题的亮度差异
   * @param analysis1 - 第一个主题分析结果
   * @param analysis2 - 第二个主题分析结果
   * @returns 亮度差异信息
   */
  static compareBrightness(analysis1: ThemeAnalysis, analysis2: ThemeAnalysis) {
    return {
      normalDiff: Math.abs(
        analysis1.normalColorStats.average - analysis2.normalColorStats.average,
      ),
      brightDiff: Math.abs(
        analysis1.brightColorStats.average - analysis2.brightColorStats.average,
      ),
    };
  }
}
