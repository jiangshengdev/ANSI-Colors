console.log('🎯 开始验证统一后的颜色...');

import { oklch } from 'culori';

console.log('✅ 导入成功，开始分析...');

const normalColors = {
  red: '#d72b82',
  green: '#009668',
  yellow: '#8c8000',
  blue: '#0088be',
  magenta: '#8570b1',
  cyan: '#008ea3',
};

console.log('🔧 Normal 颜色亮度:');
const normalLightnesses: number[] = [];

Object.entries(normalColors).forEach(([name, hex]) => {
  const color = oklch(hex);
  const l = color?.l || 0;
  normalLightnesses.push(l);
  console.log(`  ${name.padEnd(8)}: ${hex} → ${(l * 100).toFixed(1)}%`);
});

const normalAvg =
  normalLightnesses.reduce((a, b) => a + b) / normalLightnesses.length;
console.log(`\nNormal 平均亮度: ${(normalAvg * 100).toFixed(1)}%`);

// 计算方差
const normalVariance =
  normalLightnesses.reduce((sum, l) => {
    return sum + Math.pow(l - normalAvg, 2);
  }, 0) / normalLightnesses.length;

console.log(`Normal 方差: ${(normalVariance * 10000).toFixed(3)} (越小越统一)`);

console.log('✅ 验证完成!');
