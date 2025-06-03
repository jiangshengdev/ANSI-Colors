import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { oklch, formatHex } from 'culori';

// 主题配色接口
interface ThemeColors {
  background: string;
  accent: string;
  foreground: string;
  details: string;
  terminal_colors: {
    normal: {
      black: string;
      red: string;
      green: string;
      yellow: string;
      blue: string;
      magenta: string;
      cyan: string;
      white: string;
    };
    bright: {
      black: string;
      red: string;
      green: string;
      yellow: string;
      blue: string;
      magenta: string;
      cyan: string;
      white: string;
    };
  };
}

// 读取并解析主题文件
function loadTheme(filePath: string): ThemeColors {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return yaml.load(fileContent) as ThemeColors;
}

// 分析颜色的 OKLCH 属性
function analyzeColor(hex: string) {
  const color = oklch(hex);
  return {
    hex,
    oklch: {
      l: color?.l || 0,
      c: color?.c || 0,
      h: color?.h || 0,
    },
  };
}

// 主函数
function main() {
  try {
    console.log('🎨 分析 Warp Light 主题...\n');

    // 读取主题文件
    const theme = loadTheme('./warp_bundled/warp_light.yaml');

    console.log('📐 基础颜色:');
    console.log(`  背景: ${theme.background}`);
    console.log(`  前景: ${theme.foreground}`);
    console.log(`  强调: ${theme.accent}\n`);

    console.log('🔧 Normal 颜色分析:');
    Object.entries(theme.terminal_colors.normal).forEach(([key, hex]) => {
      const analysis = analyzeColor(hex);
      const l = (analysis.oklch.l * 100).toFixed(1);
      const c = (analysis.oklch.c * 100).toFixed(1);
      const h = analysis.oklch.h?.toFixed(0) || '0';
      console.log(
        `  ${key.padEnd(8)}: ${hex} → oklch(${l}% ${analysis.oklch.c.toFixed(3)} ${h}°)`,
      );
    });

    console.log('\n✨ Bright 颜色分析:');
    Object.entries(theme.terminal_colors.bright).forEach(([key, hex]) => {
      const analysis = analyzeColor(hex);
      const l = (analysis.oklch.l * 100).toFixed(1);
      const c = (analysis.oklch.c * 100).toFixed(1);
      const h = analysis.oklch.h?.toFixed(0) || '0';
      console.log(
        `  ${key.padEnd(8)}: ${hex} → oklch(${l}% ${analysis.oklch.c.toFixed(3)} ${h}°)`,
      );
    });
  } catch (error) {
    console.error('❌ 分析失败:', error);
  }
}

// 执行主函数
main();
