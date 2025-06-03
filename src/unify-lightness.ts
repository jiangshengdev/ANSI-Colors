// 亮度统一化脚本入口
import { loadTheme } from './theme-loader';
import {
  LightnessUnifier,
  LightnessUnificationOptions,
} from './lightness-unifier';
import { ThemeWriter, ThemeWriterOptions } from './theme-writer';
import { OutputFormatter } from './output-formatter';
import { ThemeColors } from './types';
import * as path from 'path';

export interface UnifyLightnessCliOptions {
  /** 输入主题文件路径 */
  input: string;
  /** 输出文件路径（可选，默认添加 _unified 后缀） */
  output?: string;
  /** 目标亮度值 (0-100) */
  targetLightness?: number;
  /** 是否自动计算目标亮度 */
  autoTarget?: boolean;
  /** 是否保留黑白颜色 */
  preserveMonochrome?: boolean;
  /** 最大亮度变化量 (0-100) */
  maxChange?: number;
  /** 是否保持相对亮度关系 */
  preserveOrder?: boolean;
  /** 是否覆盖已存在的文件 */
  overwrite?: boolean;
  /** 是否创建备份 */
  backup?: boolean;
  /** 是否只处理 normal 或 bright 颜色 */
  mode?: 'normal' | 'bright' | 'both';
  /** 是否显示详细分析 */
  verbose?: boolean;
}

export class LightnessUnificationCli {
  /**
   * 解析命令行参数
   */
  static parseArgs(args: string[]): UnifyLightnessCliOptions {
    const options: UnifyLightnessCliOptions = {
      input: '',
      autoTarget: true, // 默认使用自动计算的平均值
      preserveMonochrome: true,
      maxChange: 100, // 增加到100%，允许更大的变化
      preserveOrder: false, // 不保持相对顺序，直接统一到平均值
      overwrite: false,
      backup: true,
      mode: 'both',
      verbose: false,
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const nextArg = args[i + 1];

      switch (arg) {
        case '-i':
        case '--input':
          options.input = nextArg;
          i++;
          break;
        case '-o':
        case '--output':
          options.output = nextArg;
          i++;
          break;
        case '-t':
        case '--target':
          options.targetLightness = parseFloat(nextArg);
          options.autoTarget = false;
          i++;
          break;
        case '--auto-target':
          options.autoTarget = true;
          break;
        case '--no-preserve-mono':
          options.preserveMonochrome = false;
          break;
        case '-m':
        case '--max-change':
          options.maxChange = parseFloat(nextArg);
          i++;
          break;
        case '--no-preserve-order':
          options.preserveOrder = false;
          break;
        case '--overwrite':
          options.overwrite = true;
          break;
        case '--no-backup':
          options.backup = false;
          break;
        case '--mode':
          if (['normal', 'bright', 'both'].includes(nextArg)) {
            options.mode = nextArg as 'normal' | 'bright' | 'both';
          }
          i++;
          break;
        case '-v':
        case '--verbose':
          options.verbose = true;
          break;
        case '-h':
        case '--help':
          this.printHelp();
          process.exit(0);
          break;
      }
    }

    if (!options.input) {
      console.error('❌ 错误: 必须指定输入文件路径');
      this.printHelp();
      process.exit(1);
    }

    return options;
  }

  /**
   * 打印帮助信息
   */
  static printHelp(): void {
    console.log(`
🎨 ANSI Colors 亮度统一化工具

用法:
  pnpm unify [选项]

选项:
  -i, --input <路径>        输入主题文件路径 (必需)
  -o, --output <路径>       输出文件路径 (可选)
  -t, --target <值>         目标亮度值 (0-100)
  --auto-target            自动计算目标亮度 (默认)
  --no-preserve-mono       不保留黑白颜色
  -m, --max-change <值>     最大亮度变化量 (0-100, 默认: 30)
  --no-preserve-order      不保持相对亮度关系
  --overwrite              覆盖已存在的文件
  --no-backup              不创建备份文件
  --mode <模式>            处理模式: normal|bright|both (默认: both)
  -v, --verbose            显示详细分析
  -h, --help               显示此帮助信息

示例:
  # 使用自动计算的目标亮度统一所有颜色
  pnpm unify -i ./themes/my_theme.yaml

  # 指定目标亮度为60%
  pnpm unify -i ./themes/my_theme.yaml -t 60

  # 只处理 bright 颜色，最大变化20%
  pnpm unify -i ./themes/my_theme.yaml --mode bright -m 20

  # 覆盖原文件，不创建备份
  pnpm unify -i ./themes/my_theme.yaml -o ./themes/my_theme.yaml --overwrite --no-backup
`);
  }

  /**
   * 执行亮度统一化
   */
  static async execute(options: UnifyLightnessCliOptions): Promise<void> {
    try {
      OutputFormatter.printHeader('亮度统一化工具');

      // 加载主题
      console.log(`📂 加载主题文件: ${options.input}`);
      const theme = loadTheme(options.input);

      // 验证主题
      const validation = ThemeWriter.validateTheme(theme);
      if (!validation.valid) {
        throw new Error(`主题文件验证失败:\n${validation.errors.join('\n')}`);
      }

      // 准备统一化选项
      const unificationOptions: LightnessUnificationOptions = {
        targetLightness: options.targetLightness
          ? options.targetLightness / 100
          : undefined,
        autoCalculateTarget: options.autoTarget || !options.targetLightness,
        preserveMonochrome: options.preserveMonochrome,
        maxLightnessChange: (options.maxChange || 30) / 100,
        preserveRelativeOrder: options.preserveOrder,
      };

      // 克隆主题以保留原始数据
      const modifiedTheme: ThemeColors = JSON.parse(JSON.stringify(theme));

      // 处理 normal 颜色
      if (options.mode === 'normal' || options.mode === 'both') {
        console.log('🎯 统一 Normal 颜色亮度...');
        modifiedTheme.terminal_colors.normal = LightnessUnifier.unifyLightness(
          theme.terminal_colors.normal,
          unificationOptions,
        );
      }

      // 处理 bright 颜色
      if (options.mode === 'bright' || options.mode === 'both') {
        console.log('✨ 统一 Bright 颜色亮度...');
        modifiedTheme.terminal_colors.bright = LightnessUnifier.unifyLightness(
          theme.terminal_colors.bright,
          unificationOptions,
        );
      }

      // 显示详细分析
      if (options.verbose) {
        this.printDetailedAnalysis(
          theme,
          modifiedTheme,
          options.mode || 'both',
        );
      }

      // 确定输出路径
      const outputPath =
        options.output || this.generateOutputPath(options.input);

      // 写入文件
      const writerOptions: ThemeWriterOptions = {
        outputPath,
        createBackup: options.backup,
        overwrite: options.overwrite,
        headerComment: `Lightness Unified Theme - Mode: ${options.mode}, Max Change: ${options.maxChange}%`,
      };

      await ThemeWriter.writeTheme(modifiedTheme, writerOptions);

      // 显示比较结果
      this.printComparison(theme, modifiedTheme);

      OutputFormatter.printSuccess('亮度统一化完成!');
    } catch (error) {
      OutputFormatter.printError(error);
      process.exit(1);
    }
  }

  /**
   * 生成输出文件路径
   */
  private static generateOutputPath(inputPath: string): string {
    const ext = path.extname(inputPath);
    const basename = path.basename(inputPath, ext);
    const dirname = path.dirname(inputPath);

    return path.join(dirname, `${basename}_unified${ext}`);
  }

  /**
   * 打印详细分析
   */
  private static printDetailedAnalysis(
    original: ThemeColors,
    modified: ThemeColors,
    mode: 'normal' | 'bright' | 'both',
  ): void {
    console.log('\n📊 详细分析:');

    if (mode === 'normal' || mode === 'both') {
      console.log('\n🔧 Normal 颜色分析:');
      const normalAnalysis = LightnessUnifier.analyzeLightnessUnification(
        original.terminal_colors.normal,
        modified.terminal_colors.normal,
      );
      this.printStatsComparison('Normal', normalAnalysis);
    }

    if (mode === 'bright' || mode === 'both') {
      console.log('\n✨ Bright 颜色分析:');
      const brightAnalysis = LightnessUnifier.analyzeLightnessUnification(
        original.terminal_colors.bright,
        modified.terminal_colors.bright,
      );
      this.printStatsComparison('Bright', brightAnalysis);
    }
  }

  /**
   * 打印统计比较
   */
  private static printStatsComparison(
    type: string,
    analysis: ReturnType<typeof LightnessUnifier.analyzeLightnessUnification>,
  ): void {
    const { originalStats, unifiedStats, changes } = analysis;

    console.log(`  ${type} 统计:`);
    console.log(
      `    原始 - 平均: ${(originalStats.average * 100).toFixed(1)}%, 范围: ${(originalStats.range * 100).toFixed(1)}%, 方差: ${(originalStats.variance * 100).toFixed(3)}`,
    );
    console.log(
      `    统一 - 平均: ${(unifiedStats.average * 100).toFixed(1)}%, 范围: ${(unifiedStats.range * 100).toFixed(1)}%, 方差: ${(unifiedStats.variance * 100).toFixed(3)}`,
    );

    console.log(`  ${type} 颜色变化:`);
    changes.forEach((change) => {
      const changePercent = (change.change * 100).toFixed(1);
      const sign = change.change >= 0 ? '+' : '';
      console.log(
        `    ${change.name.padEnd(8)}: ${(change.originalL * 100).toFixed(1)}% → ${(change.unifiedL * 100).toFixed(1)}% (${sign}${changePercent}%)`,
      );
    });
  }

  /**
   * 打印比较结果
   */
  private static printComparison(
    original: ThemeColors,
    modified: ThemeColors,
  ): void {
    const comparison = ThemeWriter.compareThemes(original, modified);

    console.log('\n🔄 颜色变化摘要:');

    let changeCount = 0;

    // 统计 terminal_colors 的变化
    Object.entries(comparison.terminal_colors.normal).forEach(
      ([key, change]) => {
        if (change.changed) changeCount++;
      },
    );

    Object.entries(comparison.terminal_colors.bright).forEach(
      ([key, change]) => {
        if (change.changed) changeCount++;
      },
    );

    console.log(`  总共 ${changeCount} 个终端颜色发生了变化`);

    // 显示具体变化（只显示前几个）
    const displayChanges = (colorSet: Record<string, any>, setName: string) => {
      const changes = Object.entries(colorSet).filter(
        ([_, change]) => change.changed,
      );
      if (changes.length > 0) {
        console.log(`  ${setName}:`);
        changes.slice(0, 3).forEach(([key, change]) => {
          console.log(`    ${key}: ${change.from} → ${change.to}`);
        });
        if (changes.length > 3) {
          console.log(`    ... 还有 ${changes.length - 3} 个颜色发生变化`);
        }
      }
    };

    displayChanges(comparison.terminal_colors.normal, 'Normal');
    displayChanges(comparison.terminal_colors.bright, 'Bright');
  }
}

/**
 * 主函数 - 命令行入口
 */
export function main(): void {
  const args = process.argv.slice(2);
  const options = LightnessUnificationCli.parseArgs(args);
  LightnessUnificationCli.execute(options);
}

// 如果直接运行此文件，则执行主函数
if (require.main === module) {
  main();
}
