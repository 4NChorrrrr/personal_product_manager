export const PrdPrompt = {
  zh: (idea: string) => `为这个想法写一份详细的产品需求文档(PRD)，使用Markdown格式："${idea}"。请按照以下结构组织内容：

## 1. 方向 & 动机
### 1.1 产品价值主张
用一句话概括产品的核心价值主张。

### 1.2 项目目标
明确项目目标类型（练手 / 解决痛点 / 盈利 / 长期产品），并详细说明具体目标。

### 1.3 目标用户
详细描述目标用户群体，包括：
- 他们是谁？（用户画像）
- 在哪个平台使用？（Web/移动端/桌面应用等）
- 使用场景和需求痛点

### 1.4 替代产品调研
调研至少2-3个替代产品，记录以下信息：
- 产品名称和简介
- 优点分析
- 缺点分析
- 与我们的差异化机会

## 2. 需求 & 规划
### 2.1 MVP功能清单
定义最小可行版本的功能清单，分类为：
- Must-have（必须具备）功能
- Nice-to-have（锦上添花）功能

### 2.2 典型使用场景
设计2-3个典型使用场景，包括：
- 用户故事（User Story）格式
- 用户旅程描述
- 关键交互流程

内容要具体、可执行且详细。请用中文回复。`,
  en: (idea: string) => `Write a detailed Product Requirements Document (PRD) in Markdown for this idea: "${idea}". Please organize the content according to the following structure:

## 1. Direction & Motivation
### 1.1 Product Value Proposition
Summarize the core value proposition of the product in one sentence.

### 1.2 Project Goals
Clarify the project goal type (Learning / Pain Point Solution / Profitable Product / Long-term Product) and provide specific objectives.

### 1.3 Target Users
Describe the target user group in detail, including:
- Who are they? (User personas)
- Which platform do they use? (Web/Mobile/Desktop app, etc.)
- Usage scenarios and pain points

### 1.4 Alternative Product Research
Research at least 2-3 alternative products and record:
- Product name and introduction
- Strengths analysis
- Weaknesses analysis
- Differentiation opportunities

## 2. Requirements & Planning
### 2.1 MVP Feature List
Define the Minimum Viable Product feature list, categorized as:
- Must-have features
- Nice-to-have features

### 2.2 Typical Use Cases
Design 2-3 typical use cases, including:
- User Story format
- User journey description
- Key interaction flows

Be specific, actionable, and detailed.`
};