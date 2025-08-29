-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('Scrum Master', 'Product Owner', 'Developer', 'Designer', 'Tester', 'Stakeholder')),
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 项目表
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 项目成员表
CREATE TABLE IF NOT EXISTS project_members (
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('Scrum Master', 'Product Owner', 'Developer', 'Designer', 'Tester', 'Stakeholder')),
  PRIMARY KEY (project_id, user_id)
);

-- 版本发布表
CREATE TABLE IF NOT EXISTS releases (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  release_date DATE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('planned', 'in_progress', 'released')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (project_id, version)
);

-- Sprint表
CREATE TABLE IF NOT EXISTS sprints (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  release_id INTEGER REFERENCES releases(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  goal TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('planned', 'active', 'completed')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (start_date <= end_date)
);

-- 史诗表
CREATE TABLE IF NOT EXISTS epics (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('planning', 'in_progress', 'done')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户故事表
CREATE TABLE IF NOT EXISTS stories (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  sprint_id INTEGER REFERENCES sprints(id) ON DELETE SET NULL,
  epic_id INTEGER REFERENCES epics(id) ON DELETE SET NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  acceptance_criteria TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('backlog', 'sprint_backlog', 'in_progress', 'done')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  points INTEGER DEFAULT 0,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 任务表
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  sprint_id INTEGER REFERENCES sprints(id) ON DELETE SET NULL,
  story_id INTEGER REFERENCES stories(id) ON DELETE SET NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  estimated_hours NUMERIC(10,2) DEFAULT 0,
  spent_hours NUMERIC(10,2) DEFAULT 0,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 文档表
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('requirement', 'meeting', 'design', 'other')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 文档历史表
CREATE TABLE IF NOT EXISTS document_history (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  edited_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 缺陷表
CREATE TABLE IF NOT EXISTS bugs (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  sprint_id INTEGER REFERENCES sprints(id) ON DELETE SET NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'in_progress', 'testing', 'resolved', 'closed')),
  steps_to_reproduce TEXT,
  reported_by INTEGER REFERENCES users(id),
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 缺陷评论表
CREATE TABLE IF NOT EXISTS bug_comments (
  id SERIAL PRIMARY KEY,
  bug_id INTEGER REFERENCES bugs(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 缺陷历史表
CREATE TABLE IF NOT EXISTS bug_history (
  id SERIAL PRIMARY KEY,
  bug_id INTEGER REFERENCES bugs(id) ON DELETE CASCADE,
  field VARCHAR(50) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 任务评论表
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 活动日志表
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_stories_project ON stories(project_id);
CREATE INDEX idx_stories_sprint ON stories(sprint_id);
CREATE INDEX idx_stories_epic ON stories(epic_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_story ON tasks(story_id);
CREATE INDEX idx_bugs_project ON bugs(project_id);
CREATE INDEX idx_documents_project ON documents(project_id);