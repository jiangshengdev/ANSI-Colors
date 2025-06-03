/**
 * 配置常量
 */
export const CONFIG = {
  DEFAULT_THEME_PATH: './warp_bundled/warp_light.yaml',
  THEME_NAME: 'Warp Light',
  COLORFUL_NAMES: [
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
  ] as const,
  PRECISION: {
    LIGHTNESS: 1,
    CHROMA: 3,
    HUE: 0,
  },
} as const;

/**
 * 命令行参数接口
 */
export interface CliOptions {
  themePath?: string;
  outputFormat?: 'console' | 'json';
  verbose?: boolean;
}

/**
 * 解析命令行参数
 * @param args - 命令行参数数组
 * @returns 解析后的选项
 */
export function parseCliArgs(args: string[]): CliOptions {
  const options: CliOptions = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--theme':
      case '-t':
        options.themePath = args[i + 1];
        i++;
        break;
      case '--format':
      case '-f':
        options.outputFormat = args[i + 1] as 'console' | 'json';
        i++;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
    }
  }

  return options;
}
