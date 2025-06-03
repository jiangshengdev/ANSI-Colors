import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { ThemeColors } from './types';

/**
 * 读取并解析主题文件
 * @param filePath - YAML 主题文件路径
 * @returns 解析后的主题颜色对象
 */
export function loadTheme(filePath: string): ThemeColors {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const theme = yaml.load(fileContent) as ThemeColors;

    if (!theme) {
      throw new Error('主题文件解析失败');
    }

    return theme;
  } catch (error) {
    throw new Error(`读取主题文件失败: ${error}`);
  }
}

/**
 * 检查主题文件是否存在
 * @param filePath - 文件路径
 * @returns 文件是否存在
 */
export function themeFileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}
