import { ThemeAnalyzer } from './theme-analyzer';
import { OutputFormatter } from './output-formatter';
import { CONFIG, parseCliArgs } from './config';

/**
 * 主函数
 */
function main(): void {
  try {
    // 解析命令行参数
    const options = parseCliArgs(process.argv.slice(2));
    const themePath = options.themePath || CONFIG.DEFAULT_THEME_PATH;
    const themeName = options.themePath
      ? themePath.split('/').pop()?.replace('.yaml', '') || 'Unknown'
      : CONFIG.THEME_NAME;

    // 输出分析标题
    OutputFormatter.printHeader(themeName);

    // 分析主题
    const analysis = ThemeAnalyzer.analyze(themePath);

    // 输出分析结果
    if (options.outputFormat === 'json') {
      console.log(JSON.stringify(analysis, null, 2));
      return;
    }

    // 控制台格式输出
    OutputFormatter.printBasicColors(analysis.theme);
    OutputFormatter.printColorAnalysis(
      '🔧 Normal 颜色分析',
      analysis.theme.terminal_colors.normal,
    );
    OutputFormatter.printColorAnalysis(
      '✨ Bright 颜色分析',
      analysis.theme.terminal_colors.bright,
    );
    OutputFormatter.printColorfulAverageAnalysis(
      analysis.normalColorStats,
      analysis.brightColorStats,
    );
    OutputFormatter.printColorfulDetails(
      'Normal 彩色详情',
      analysis.normalColorStats,
    );
    OutputFormatter.printColorfulDetails(
      'Bright 彩色详情',
      analysis.brightColorStats,
    );

    OutputFormatter.printSuccess('主题分析完成!');
  } catch (error) {
    OutputFormatter.printError(error);
    process.exit(1);
  }
}

// 如果直接运行此文件，则执行主函数
if (require.main === module) {
  main();
}
