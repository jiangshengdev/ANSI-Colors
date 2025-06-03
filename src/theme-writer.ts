// YAML 主题写入工具
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { ThemeColors } from './types';

export interface ThemeWriterOptions {
  /** 输出文件路径 */
  outputPath: string;
  /** 是否创建备份文件 */
  createBackup?: boolean;
  /** 是否覆盖已存在的文件 */
  overwrite?: boolean;
  /** 自定义文件头注释 */
  headerComment?: string;
}

export class ThemeWriter {
  /**
   * 写入主题到YAML文件
   */
  static async writeTheme(
    theme: ThemeColors,
    options: ThemeWriterOptions,
  ): Promise<void> {
    const {
      outputPath,
      createBackup = true,
      overwrite = false,
      headerComment,
    } = options;

    // 检查文件是否存在
    if (fs.existsSync(outputPath) && !overwrite) {
      throw new Error(
        `文件已存在: ${outputPath}。使用 overwrite: true 来覆盖。`,
      );
    }

    // 创建备份
    if (createBackup && fs.existsSync(outputPath)) {
      const backupPath = this.generateBackupPath(outputPath);
      fs.copyFileSync(outputPath, backupPath);
      console.log(`✅ 已创建备份文件: ${backupPath}`);
    }

    // 确保输出目录存在
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 准备YAML内容
    const yamlContent = this.prepareYamlContent(theme, headerComment);

    // 写入文件
    fs.writeFileSync(outputPath, yamlContent, 'utf8');
    console.log(`✅ 主题已写入: ${outputPath}`);
  }

  /**
   * 验证主题数据的完整性
   */
  static validateTheme(theme: ThemeColors): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // 检查必需字段
    if (!theme.background) errors.push('缺少 background 字段');
    if (!theme.foreground) errors.push('缺少 foreground 字段');
    if (!theme.accent) errors.push('缺少 accent 字段');
    if (!theme.details) errors.push('缺少 details 字段');

    // 检查终端颜色
    if (!theme.terminal_colors) {
      errors.push('缺少 terminal_colors 字段');
    } else {
      // 检查 normal 颜色
      if (!theme.terminal_colors.normal) {
        errors.push('缺少 terminal_colors.normal 字段');
      } else {
        const requiredColors = [
          'black',
          'red',
          'green',
          'yellow',
          'blue',
          'magenta',
          'cyan',
          'white',
        ];
        requiredColors.forEach((color) => {
          if (!theme.terminal_colors.normal[color]) {
            errors.push(`缺少 terminal_colors.normal.${color} 字段`);
          }
        });
      }

      // 检查 bright 颜色
      if (!theme.terminal_colors.bright) {
        errors.push('缺少 terminal_colors.bright 字段');
      } else {
        const requiredColors = [
          'black',
          'red',
          'green',
          'yellow',
          'blue',
          'magenta',
          'cyan',
          'white',
        ];
        requiredColors.forEach((color) => {
          if (!theme.terminal_colors.bright[color]) {
            errors.push(`缺少 terminal_colors.bright.${color} 字段`);
          }
        });
      }
    }

    // 验证颜色格式
    const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
    const validateColor = (colorValue: string, fieldName: string) => {
      if (colorValue && !hexColorRegex.test(colorValue)) {
        errors.push(`${fieldName} 的颜色格式无效: ${colorValue}`);
      }
    };

    validateColor(theme.background, 'background');
    validateColor(theme.foreground, 'foreground');
    validateColor(theme.accent, 'accent');

    if (theme.terminal_colors?.normal) {
      Object.entries(theme.terminal_colors.normal).forEach(([key, value]) => {
        validateColor(value, `terminal_colors.normal.${key}`);
      });
    }

    if (theme.terminal_colors?.bright) {
      Object.entries(theme.terminal_colors.bright).forEach(([key, value]) => {
        validateColor(value, `terminal_colors.bright.${key}`);
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 比较两个主题的差异
   */
  static compareThemes(
    original: ThemeColors,
    modified: ThemeColors,
  ): {
    background: { changed: boolean; from?: string; to?: string };
    foreground: { changed: boolean; from?: string; to?: string };
    accent: { changed: boolean; from?: string; to?: string };
    details: { changed: boolean; from?: string; to?: string };
    terminal_colors: {
      normal: Record<string, { changed: boolean; from?: string; to?: string }>;
      bright: Record<string, { changed: boolean; from?: string; to?: string }>;
    };
  } {
    const compareField = (field1: string, field2: string) => ({
      changed: field1 !== field2,
      from: field1 !== field2 ? field1 : undefined,
      to: field1 !== field2 ? field2 : undefined,
    });

    const compareColorSet = (
      set1: Record<string, string>,
      set2: Record<string, string>,
    ) => {
      const result: Record<
        string,
        { changed: boolean; from?: string; to?: string }
      > = {};
      const allKeys = new Set([...Object.keys(set1), ...Object.keys(set2)]);

      allKeys.forEach((key) => {
        result[key] = compareField(set1[key] || '', set2[key] || '');
      });

      return result;
    };

    return {
      background: compareField(original.background, modified.background),
      foreground: compareField(original.foreground, modified.foreground),
      accent: compareField(original.accent, modified.accent),
      details: compareField(original.details, modified.details),
      terminal_colors: {
        normal: compareColorSet(
          original.terminal_colors.normal,
          modified.terminal_colors.normal,
        ),
        bright: compareColorSet(
          original.terminal_colors.bright,
          modified.terminal_colors.bright,
        ),
      },
    };
  }

  /**
   * 生成备份文件路径
   */
  private static generateBackupPath(originalPath: string): string {
    const ext = path.extname(originalPath);
    const basename = path.basename(originalPath, ext);
    const dirname = path.dirname(originalPath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    return path.join(dirname, `${basename}.backup.${timestamp}${ext}`);
  }

  /**
   * 准备YAML内容
   */
  private static prepareYamlContent(
    theme: ThemeColors,
    headerComment?: string,
  ): string {
    let content = '';

    // 添加头部注释
    if (headerComment) {
      content += `# ${headerComment}\n`;
    }

    content += `# Generated by ANSI-Colors Tool\n`;
    content += `# Date: ${new Date().toISOString()}\n\n`;

    // 转换为YAML
    const yamlData = yaml.dump(theme, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false,
    });

    content += yamlData;

    return content;
  }
}
