// 功能提取（第一步）
export const FeaturesPrompt = {
  zh: (prd: string) => {
    const prompt = `从以下 PRD 中提取 3–5 个 MVP 功能，输出 JSON 数组。
    每个功能结构：{"id":数字,"title":"字符串","description":"字符串"}
    不要其它文本。
    PRD：${prd}`;
    console.log('FeaturesPrompt.zh:', prompt);
    return prompt;
  },
  en: (prd: string) => {
    const prompt = `Extract 3-5 MVP features from the PRD below, output as JSON array.
    Each feature structure: {"id":number,"title":"string","description":"string"}
    No other text.
    PRD: ${prd}`;
    console.log('FeaturesPrompt.en:', prompt);
    return prompt;
  }
};

// 任务拆解（第二步）
export const TasksPrompt = {
  zh: (featuresJson: string) => {
    const prompt = `针对下面的功能数组，为每个功能拆解 3–4 个可执行的开发任务，输出扁平 JSON 数组。
    单个任务结构：
    {"id":数字,"title":"字符串","description":"字符串","priority":"Must have|Should have|Could have|Won't have","tag":"父功能标题","estimatedEndDate":"YYYY-MM-DD"}
    日期统一用 2025-12-31 作为占位。
    只返回 JSON 数组，不要其它文本。
    功能数组：${featuresJson}`;
    console.log('TasksPrompt.zh:', prompt);
    return prompt;
  },
  en: (featuresJson: string) => {
    const prompt = `For the feature array below, break down each feature into 3-4 executable development tasks, output as a flat JSON array.
    Single task structure:
    {"id":number,"title":"string","description":"string","priority":"Must have|Should have|Could have|Won't have","tag":"parent feature title","estimatedEndDate":"YYYY-MM-DD"}
    Use 2025-12-31 as placeholder for all dates.
    Return ONLY the JSON array, no other text.
    Feature array: ${featuresJson}`;
    console.log('TasksPrompt.en:', prompt);
    return prompt;
  }
};
