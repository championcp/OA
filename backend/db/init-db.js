import { exec } from 'child_process';

// 依次执行schema和seed数据
exec('psql -U $POSTGRES_USER -d $POSTGRES_DB -f /docker-entrypoint-initdb.d/schema.sql && \
      psql -U $POSTGRES_USER -d $POSTGRES_DB -f /docker-entrypoint-initdb.d/seed-data.sql', (error) => {
  if (error) {
    console.error('初始化脚本执行失败:', error);
    process.exit(1);
  }
  console.log('数据库初始化完成');
});