const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  database: 'oa_system',
  username: 'root',
  password: '123456',
  logging: console.log
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    const [results] = await sequelize.query("SHOW TABLES");
    console.log('当前数据库中的表:', results);
  } catch (error) {
    console.error('数据库连接失败:', error);
  } finally {
    await sequelize.close();
  }
})();