#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function initDatabase() {
  console.log('🚀 Initializing database...');

  try {
    // 确保数据目录存在
    if (!fs.existsSync('/app/data')) {
      fs.mkdirSync('/app/data', { recursive: true });
      console.log('📁 Created data directory');
    }

    const prisma = new PrismaClient();

    // 推送数据库架构
    console.log('🔧 Setting up database schema...');
    const { execSync } = require('child_process');
    execSync('npx prisma db push', { stdio: 'inherit' });

    // 检查是否有示例数据
    const bookmarkCount = await prisma.bookmark.count();
    
    if (bookmarkCount === 0) {
      await prisma.bookmark.create({
        data: {
          title: 'AllPanel 管理面板',
          url: 'http://localhost:3000',
          description: 'NAS 管理面板首页',
          category: 'System',
          order: 1
        }
      });
      console.log('📝 Created sample bookmark');
    }

    await prisma.$disconnect();
    console.log('✅ Database ready!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };
