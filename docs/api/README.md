# 敏捷开发团队管理软件 API 文档

## 基础信息

- 基础URL: `/api`
- 所有请求和响应均为JSON格式
- 认证使用JWT令牌，通过`x-auth-token`请求头传递

## 认证API

### 注册用户

- **URL**: `/auth/register`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "name": "用户名",
    "email": "user@example.com",
    "password": "password123",
    "role": "Developer" // 可选，默认为Developer
  }
  ```
- **成功响应** (200):
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 用户登录

- **URL**: `/auth/login`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 获取当前用户

- **URL**: `/auth/me`
- **方法**: `GET`
- **请求头**: `x-auth-token: <token>`
- **成功响应** (200):
  ```json
  {
    "id": "1",
    "name": "用户名",
    "email": "user@example.com",
    "role": "Developer",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2023-08-01T00:00:00.000Z"
  }
  ```

## 用户API

### 获取所有用户

- **URL**: `/users`
- **方法**: `GET`
- **请求头**: `x-auth-token: <token>`
- **成功响应** (200):
  ```json
  [
    {
      "id": "1",
      "name": "用户1",
      "email": "user1@example.com",
      "role": "Scrum Master"
    },
    {
      "id": "2",
      "name": "用户2",
      "email": "user2@example.com",
      "role": "Developer"
    }
  ]
  ```

### 获取单个用户

- **URL**: `/users/:id`
- **方法**: `GET`
- **请求头**: `x-auth-token: <token>`
- **成功响应** (200):
  ```json
  {
    "id": "1",
    "name": "用户名",
    "email": "user@example.com",
    "role": "Developer",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2023-08-01T00:00:00.000Z"
  }
  ```

### 更新用户

- **URL**: `/users/:id`
- **方法**: `PUT`
- **请求头**: `x-auth-token: <token>`
- **请求体**:
  ```json
  {
    "name": "新用户名",
    "role": "Tester"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "id": "1",
    "name": "新用户名",
    "email": "user@example.com",
    "role": "Tester",
    "avatar": "https://example.com/avatar.jpg",
    "updatedAt": "2023-08-02T00:00:00.000Z"
  }
  ```

## 项目API

### 创建项目

- **URL**: `/projects`
- **方法**: `POST`
- **请求头**: `x-auth-token: <token>`
- **请求体**:
  ```json
  {
    "name": "项目名称",
    "description": "项目描述",
    "startDate": "2023-08-01",
    "endDate": "2023-12-31"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "id": "1",
    "name": "项目名称",
    "description": "项目描述",
    "startDate": "2023-08-01T00:00:00.000Z",
    "endDate": "2023-12-31T00:00:00.000Z",
    "status": "active",
    "createdBy": "1",
    "createdAt": "2023-08-01T00:00:00.000Z"
  }
  ```

### 获取所有项目

- **URL**: `/projects`
- **方法**: `GET`
- **请求头**: `x-auth-token: <token>`
- **成功响应** (200):
  ```json
  [
    {
      "id": "1",
      "name": "项目1",
      "description": "项目1描述",
      "status": "active",
      "startDate": "2023-08-01T00:00:00.000Z",
      "endDate": "2023-12-31T00:00:00.000Z"
    },
    {
      "id": "2",
      "name": "项目2",
      "description": "项目2描述",
      "status": "planning",
      "startDate": "2023-09-01T00:00:00.000Z",
      "endDate": "2024-02-28T00:00:00.000Z"
    }
  ]
  ```

### 获取单个项目

- **URL**: `/projects/:id`
- **方法**: `GET`
- **请求头**: `x-auth-token: <token>`
- **成功响应** (200):
  ```json
  {
    "id": "1",
    "name": "项目名称",
    "description": "项目描述",
    "startDate": "2023-08-01T00:00:00.000Z",
    "endDate": "2023-12-31T00:00:00.000Z",
    "status": "active",
    "createdBy": {
      "id": "1",
      "name": "用户名"
    },
    "team": [
      {
        "id": "1",
        "name": "用户1",
        "role": "Scrum Master"
      },
      {
        "id": "2",
        "name": "用户2",
        "role": "Developer"
      }
    ],
    "createdAt": "2023-08-01T00:00:00.000Z",
    "updatedAt": "2023-08-01T00:00:00.000Z"
  }
  ```

## Sprint API

### 创建Sprint

- **URL**: `/projects/:projectId/sprints`
- **方法**: `POST`
- **请求头**: `x-auth-token: <token>`
- **请求体**:
  ```json
  {
    "name": "Sprint 1",
    "goal": "完成用户认证功能",
    "startDate": "2023-08-01",
    "endDate": "2023-08-14"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "id": "1",
    "name": "Sprint 1",
    "goal": "完成用户认证功能",
    "startDate": "2023-08-01T00:00:00.000Z",
    "endDate": "2023-08-14T00:00:00.000Z",
    "status": "planning",
    "projectId": "1",
    "createdAt": "2023-08-01T00:00:00.000Z"
  }
  ```

### 获取项目的所有Sprint

- **URL**: `/projects/:projectId/sprints`
- **方法**: `GET`
- **请求头**: `x-auth-token: <token>`
- **成功响应** (200):
  ```json
  [
    {
      "id": "1",
      "name": "Sprint 1",
      "goal": "完成用户认证功能",
      "startDate": "2023-08-01T00:00:00.000Z",
      "endDate": "2023-08-14T00:00:00.000Z",
      "status": "completed"
    },
    {
      "id": "2",
      "name": "Sprint 2",
      "goal": "完成项目管理功能",
      "startDate": "2023-08-15T00:00:00.000Z",
      "endDate": "2023-08-28T00:00:00.000Z",
      "status": "active"
    }
  ]
  ```

## 任务API

### 创建任务

- **URL**: `/projects/:projectId/tasks`
- **方法**: `POST`
- **请求头**: `x-auth-token: <token>`
- **请求体**:
  ```json
  {
    "title": "实现用户登录API",
    "description": "创建用户登录的后端API接口",
    "status": "todo",
    "priority": "high",
    "assigneeId": "2",
    "storyId": "1",
    "sprintId": "1",
    "estimatedHours": 4
  }
  ```
- **成功响应** (201):
  ```json
  {
    "id": "1",
    "title": "实现用户登录API",
    "description": "创建用户登录的后端API接口",
    "status": "todo",
    "priority": "high",
    "assignee": {
      "id": "2",
      "name": "用户2"
    },
    "story": {
      "id": "1",
      "title": "用户可以登录系统"
    },
    "sprint": {
      "id": "1",
      "name": "Sprint 1"
    },
    "estimatedHours": 4,
    "projectId": "1",
    "createdAt": "2023-08-01T00:00:00.000Z"
  }
  ```

### 获取项目的所有任务

- **URL**: `/projects/:projectId/tasks`
- **方法**: `GET`
- **请求头**: `x-auth-token: <token>`
- **成功响应** (200):
  ```json
  [
    {
      "id": "1",
      "title": "实现用户登录API",
      "status": "todo",
      "priority": "high",
      "assignee": {
        "id": "2",
        "name": "用户2"
      }
    },
    {
      "id": "2",
      "title": "设计登录页面",
      "status": "in_progress",
      "priority": "medium",
      "assignee": {
        "id": "3",
        "name": "用户3"
      }
    }
  ]
  ```

## 用户故事API

### 创建用户故事

- **URL**: `/projects/:projectId/stories`
- **方法**: `POST`
- **请求头**: `x-auth-token: <token>`
- **请求体**:
  ```json
  {
    "title": "用户可以登录系统",
    "description": "作为一个用户，我希望能够使用邮箱和密码登录系统，以便访问我的账户",
    "acceptanceCriteria": "1. 提供邮箱和密码输入框\n2. 验证邮箱格式\n3. 登录成功后重定向到仪表盘",
    "priority": "high",
    "points": 5,
    "epicId": "1",
    "sprintId": "1"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "id": "1",
    "title": "用户可以登录系统",
    "description": "作为一个用户，我希望能够使用邮箱和密码登录系统，以便访问我的账户",
    "acceptanceCriteria": "1. 提供邮箱和密码输入框\n2. 验证邮箱格式\n3. 登录成功后重定向到仪表盘",
    "priority": "high",
    "points": 5,
    "status": "todo",
    "epic": {
      "id": "1",
      "title": "用户认证"
    },
    "sprint": {
      "id": "1",
      "name": "Sprint 1"
    },
    "projectId": "1",
    "createdAt": "2023-08-01T00:00:00.000Z"
  }
  ```

## 史诗API

### 创建史诗

- **URL**: `/projects/:projectId/epics`
- **方法**: `POST`
- **请求头**: `x-auth-token: <token>`
- **请求体**:
  ```json
  {
    "title": "用户认证",
    "description": "实现用户认证相关功能，包括注册、登录、密码重置等",
    "priority": "high"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "id": "1",
    "title": "用户认证",
    "description": "实现用户认证相关功能，包括注册、登录、密码重置等",
    "priority": "high",
    "status": "in_progress",
    "projectId": "1",
    "createdAt": "2023-08-01T00:00:00.000Z"
  }
  ```

## 缺陷API

### 创建缺陷

- **URL**: `/projects/:projectId/bugs`
- **方法**: `POST`
- **请求头**: `x-auth-token: <token>`
- **请求体**:
  ```json
  {
    "title": "登录按钮点击无反应",
    "description": "在Chrome浏览器中，点击登录按钮没有任何反应",
    "severity": "high",
    "steps": "1. 打开登录页面\n2. 输入邮箱和密码\n3. 点击登录按钮",
    "assigneeId": "2",
    "sprintId": "1"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "id": "1",
    "title": "登录按钮点击无反应",
    "description": "在Chrome浏览器中，点击登录按钮没有任何反应",
    "severity": "high",
    "steps": "1. 打开登录页面\n2. 输入邮箱和密码\n3. 点击登录按钮",
    "status": "open",
    "assignee": {
      "id": "2",
      "name": "用户2"
    },
    "sprint": {
      "id": "1",
      "name": "Sprint 1"
    },
    "projectId": "1",
    "createdAt": "2023-08-01T00:00:00.000Z"
  }
  ```

## 文档API

### 创建文档

- **URL**: `/projects/:projectId/documents`
- **方法**: `POST`
- **请求头**: `x-auth-token: <token>`
- **请求体**:
  ```json
  {
    "title": "API设计文档",
    "content": "# API设计\n\n## 认证API\n\n...",
    "category": "technical"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "id": "1",
    "title": "API设计文档",
    "content": "# API设计\n\n## 认证API\n\n...",
    "category": "technical",
    "author": {
      "id": "1",
      "name": "用户1"
    },
    "projectId": "1",
    "createdAt": "2023-08-01T00:00:00.000Z"
  }
  ```

## 版本发布API

### 创建版本发布

- **URL**: `/projects/:projectId/releases`
- **方法**: `POST`
- **请求头**: `x-auth-token: <token>`
- **请求体**:
  ```json
  {
    "version": "1.0.0",
    "name": "初始版本",
    "description": "第一个正式版本，包含用户认证和项目管理功能",
    "releaseDate": "2023-09-01",
    "releaseNotes": "# 版本说明\n\n## 新功能\n\n- 用户注册和登录\n- 项目创建和管理\n\n## 修复的缺陷\n\n- #123: 登录按钮点击无反应"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "id": "1",
    "version": "1.0.0",
    "name": "初始版本",
    "description": "第一个正式版本，包含用户认证和项目管理功能",
    "releaseDate": "2023-09-01T00:00:00.000Z",
    "releaseNotes": "# 版本说明\n\n## 新功能\n\n- 用户注册和登录\n- 项目创建和管理\n\n## 修复的缺陷\n\n- #123: 登录按钮点击无反应",
    "status": "planned",
    "projectId": "1",
    "createdAt": "2023-08-01T00:00:00.000Z"
  }