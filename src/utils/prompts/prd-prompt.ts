export const PrdPrompt = {
  zh: (idea: string) => `为这个想法写一份简洁的150字产品需求文档(PRD)，使用Markdown格式："${idea}"。包含概述、核心功能和用户体验部分。内容要具体和可执行。请用中文回复。`,
  en: (idea: string) => `Write a concise 150-word Product Requirements Document (PRD) in Markdown for this idea: "${idea}". Include sections for Overview, Core Features, and User Experience. Be specific and actionable.`
};