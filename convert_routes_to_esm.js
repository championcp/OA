import fs from 'fs';
import path from 'path';

const routesDir = path.join(process.cwd(), 'backend/routes');

// 获取所有路由文件
const routeFiles = fs.readdirSync(routesDir)
  .filter(file => file.endsWith('.js') && !file.endsWith('.test.js'));

// 转换每个路由文件
routeFiles.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 替换require为import
  content = content.replace(
    /const express = require\('express'\);/g,
    `import express from 'express';`
  );
  
  // 替换其他require语句
  content = content.replace(
    /const (\w+) = require\('([^']+)'\);/g,
    (match, varName, modulePath) => {
      // 处理相对路径
      if (modulePath.startsWith('.')) {
        return `import ${varName} from '${modulePath}.js';`;
      }
      return `import ${varName} from '${modulePath}';`;
    }
  );
  
  // 替换module.exports
  content = content.replace(
    /module.exports = (\w+);/g,
    'export default $1;'
  );
  
  // 写入转换后的内容
  fs.writeFileSync(filePath, content);
  
  console.log(`Converted ${file} to ESM format`);
});

console.log('All route files converted to ESM format');