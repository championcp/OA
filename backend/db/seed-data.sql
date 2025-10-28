-- 测试用户
INSERT INTO users (username, password_hash, email) VALUES
('admin', '$2a$10$xJwL5v5bXUzN.9Z5q2QZ3.Jz7wL1sQ7QeJ5rXs3YH1vXkZ8X3YbZG', 'admin@oa.com'),
('user1', '$2a$10$xJwL5v5bXUzN.9Z5q2QZ3.Jz7wL1sQ7QeJ5rXs3YH1vXkZ8X3YbZG', 'user1@oa.com');

-- 测试项目
INSERT INTO projects (name, description, owner_id) VALUES
('OA系统开发', '办公自动化系统开发项目', 1),
('官网改版', '公司官网重构项目', 2);

-- 测试任务
INSERT INTO tasks (title, description, project_id, assignee_id, status) VALUES
('用户模块开发', '实现用户注册登录功能', 1, 1, 'in_progress'),
('数据库设计', '设计PostgreSQL数据库结构', 1, 2, 'completed'),
('首页UI设计', '设计新版官网首页', 2, 1, 'pending');