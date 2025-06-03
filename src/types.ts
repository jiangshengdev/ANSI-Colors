// 类型定义文件
export interface OklchColor {
  l: number;
  c: number;
  h: number;
}

export interface ColorAnalysis {
  hex: string;
  oklch: OklchColor;
}

export interface TerminalColor {
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;

  [key: string]: string; // 添加索引签名
}

export interface ThemeColors {
  background: string;
  accent: string;
  foreground: string;
  details: string;
  terminal_colors: {
    normal: TerminalColor;
    bright: TerminalColor;
  };
}

export interface ColorStats {
  count: number;
  average: number;
  colors: Array<{
    name: string;
    hex: string;
    lightness: number;
  }>;
}

export interface ThemeAnalysis {
  theme: ThemeColors;
  normalColorStats: ColorStats;
  brightColorStats: ColorStats;
}
