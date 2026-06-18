# 🧬 人体功能简要模型 · Body Wisdom

> 器官健康自评 + 量化行为推荐系统
> 了解你的身体，用行为改善健康。

---

## 关于这个项目 / About

人体功能简要模型是一个健康自评工具，帮助你了解各个器官的功能状态，并获得个性化的行为改善建议。

### 核心功能

- **51 个器官/组织自评** — 对身体各部位进行功能状态评估
- **39 条量化行为** — 涵盖饮食、运动、作息等维度的健康行为
- **156 条器官-行为关联** — 基于医学常识的关联规则
- **个性化推荐算法** — 根据自评结果，推荐最需要改善的行为

### 页面

| 路由 | 页面 | 功能 |
|------|------|------|
| `/` | 首页 | 项目概览、快速导航 |
| `/systems` | 系统列表 | 按人体系统浏览器官 |
| `/systems/:systemId` | 系统详情 | 查看系统及其包含的器官 |
| `/organ/:organId` | 器官详情 | 器官功能评估、关联行为 |
| `/behaviors` | 行为列表 | 浏览所有健康行为 |
| `/behaviors/:behaviorId` | 行为详情 | 行为说明、关联器官 |
| `/self-check` | 自评 | 器官功能自评问卷 |
| `/recommendations` | 推荐 | 个性化行为推荐结果 |

---

## 技术栈 / Tech Stack

- **框架**: React 19 + Vite 8
- **语言**: TypeScript
- **样式**: SCSS
- **路由**: React Router v7
- **数据**: JSON 文件（4 个目录）

### 数据目录

```
src/data/
├── systems/     # 人体系统
├── organs/      # 器官/组织
├── behaviors/   # 健康行为
└── relations/   # 器官-行为关联
```

### 启动 / Dev

```bash
cd body-wisdom
pnpm install
pnpm run dev
```

### 构建 / Build

```bash
pnpm run build
```

---

## 协议 / License

[MIT](./LICENSE)

Copyright (c) 2026 Sunny

允许复制、修改、商业使用，但必须保留上述版权声明。
Free to use, modify, and distribute — attribution required.
