# 产品需求文档测试

## 1. 项目概述
这是一个测试文档，用于验证Markdown渲染功能。

## 2. 功能需求

### 2.1 用户认证
- 支持邮箱注册和登录
- 支持第三方登录（GitHub、Google）
- 密码重置功能

### 2.2 任务管理
1. 创建任务
2. 编辑任务
3. 删除任务
4. 拖拽排序

## 3. 技术栈

```javascript
// 前端技术栈
const frontend = {
  framework: 'React',
  ui: 'Tailwind CSS',
  components: 'shadcn/ui'
};

// 后端技术栈
const backend = {
  runtime: 'Node.js',
  database: 'IndexedDB',
  storage: 'localStorage'
};
```

## 4. 数据库设计

| 表名 | 字段 | 类型 | 描述 |
|------|------|------|------|
| users | id | string | 用户唯一标识 |
| users | email | string | 用户邮箱 |
| tasks | title | string | 任务标题 |
| tasks | status | string | 任务状态 |

## 5. 注意事项

> 这是一个引用块，用于测试引用样式。

**加粗文本**和*斜体文本*的测试。

---

文档结束。