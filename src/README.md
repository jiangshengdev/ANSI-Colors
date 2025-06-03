# ANSI Colors 主题分析工具

重构后的主题分析工具，具有更好的代码组织和可维护性。

## 项目结构

```
src/
├── index.ts           # 主入口文件
├── types.ts           # 类型定义
├── config.ts          # 配置和命令行参数解析
├── theme-loader.ts    # 主题文件加载器
├── color-analyzer.ts  # 颜色分析工具
├── statistics.ts      # 统计计算工具
├── output-formatter.ts # 输出格式化工具
└── theme-analyzer.ts  # 主题分析器
```

## 使用方法

### 基本使用

```bash
# 分析默认主题 (Warp Light)
npm run analyze

# 或者
npm run dev
```

### 高级使用

```bash
# 分析指定主题文件
npm run analyze -- --theme ./standard/dracula.yaml

# 输出 JSON 格式
npm run analyze -- --format json

# 详细模式
npm run analyze -- --verbose

# 组合使用
npm run analyze -- --theme ./base16/base16_nord.yaml --format json
```

## 命令行选项

- `--theme, -t <path>`: 指定主题文件路径
- `--format, -f <format>`: 输出格式 (console | json)
- `--verbose, -v`: 详细模式

## 代码特性

### 1. 模块化设计

- 每个功能独立成模块
- 清晰的职责分离
- 易于测试和维护

### 2. 类型安全

- 完整的 TypeScript 类型定义
- 编译时错误检查
- 更好的 IDE 支持

### 3. 错误处理

- 完善的异常处理机制
- 友好的错误提示
- 程序健壮性提升

### 4. 可扩展性

- 支持多种输出格式
- 可配置的分析选项
- 易于添加新功能

### 5. 命令行友好

- 支持命令行参数
- 灵活的使用方式
- 适合脚本化使用

## API 使用示例

```typescript
import { ThemeAnalyzer } from './theme-analyzer';
import { OutputFormatter } from './output-formatter';

// 分析主题
const analysis = ThemeAnalyzer.analyze('./warp_bundled/warp_light.yaml');

// 输出结果
OutputFormatter.printHeader('My Theme');
OutputFormatter.printBasicColors(analysis.theme);
OutputFormatter.printColorfulAverageAnalysis(
  analysis.normalColorStats,
  analysis.brightColorStats,
);

// 比较两个主题
const analysis1 = ThemeAnalyzer.analyze('./theme1.yaml');
const analysis2 = ThemeAnalyzer.analyze('./theme2.yaml');
const diff = ThemeAnalyzer.compareBrightness(analysis1, analysis2);
```

## 开发说明

### 添加新的分析功能

1. 在 `types.ts` 中定义新的类型
2. 在相应的模块中实现功能
3. 在 `output-formatter.ts` 中添加输出格式
4. 在 `index.ts` 中集成新功能

### 添加新的输出格式

1. 在 `config.ts` 中添加新的格式选项
2. 在 `output-formatter.ts` 中实现格式化逻辑
3. 在 `index.ts` 中处理新格式

## 重构改进

相比原来的代码，重构后具有以下改进：

1. **更好的代码组织**: 按功能模块化分离
2. **类型安全**: 完整的 TypeScript 类型系统
3. **错误处理**: 更健壮的异常处理
4. **可测试性**: 每个模块都可以独立测试
5. **可扩展性**: 易于添加新功能
6. **命令行支持**: 灵活的命令行接口
7. **文档完善**: 清晰的代码注释和文档
