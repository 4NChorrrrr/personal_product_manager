// 功能提取（第一步）
export const FeaturesPrompt = {
  zh: (prd: string) => {
    const prompt = `从以下 PRD 中提取 3–5 个 MVP 功能，输出 JSON 数组。
    每个功能结构：{"id":整数,"project_id":"字符串","title":"字符串","description":"字符串"}
    
    其中功能 id 必须为整数，从 1 开始递增（1, 2, 3...）。
    project_id 必须为字符串，表示项目ID。
    title 为功能标题，description 为功能描述。
    
    例如：第一个功能 id 为 1，第二个为 2，以此类推。
    不要其它文本。
    PRD：${prd}`;
    
    return prompt;
  },
  en: (prd: string) => {
    const prompt = `Extract 3-5 MVP features from the PRD below, output as JSON array.
    Each feature structure: {"id":integer,"project_id":"string","title":"string","description":"string"}
    
    The feature id must be an integer starting from 1 and incrementing (1, 2, 3...).
    project_id must be a string representing the project ID.
    title is the feature title, description is the feature description.
    
    For example: the first feature id is 1, the second is 2, and so on.
    No other text.
    PRD: ${prd}`;
    
    return prompt;
  }
};

// 任务拆解（第二步）
export const TasksPrompt = {
  zh: (features: any[]) => {
    const prompt = `针对下面的功能数组，为每个功能拆解 4–5 个可执行的开发任务，输出 JSON 数组。
    单个任务结构：
    {"id":"字符串","feature_id":整数,"title":"字符串","status":"字符串","description":"字符串","priority":"字符串","tag":"字符串","duration":整数,"created_at":"字符串","updated_at":"字符串"}
    
    其中 id 必须为字符串，格式为"task{功能ID}_{序号}"，序号从 1 开始。
    feature_id 必须为父功能的 id，用于标识任务所属的功能。
    status 为任务状态，默认为"todo"。
    priority 为优先级，从"Must have"、"Should have"、"Could have"、"Won't have"中选择。
    tag 为标签，建议使用父功能标题。
    duration 为任务时长，单位为小时（整数）。
    created_at 和 updated_at 为创建和更新时间，格式为"YYYY-MM-DD HH:MM:SS"。
    
    例如：第一个功能的任务 id 为 "task1_1", "task1_2", "task1_3", "task1_4"，feature_id 为 1；第二个功能的任务 id 为 "task2_1", "task2_2", "task2_3", "task2_4"，feature_id 为 2，以此类推。
    
    请根据当前日期自动生成：
    1. 任务的标题：基于任务所属功能和任务序号，提供简洁、明了的标题，例如"实现用户登录功能"、"优化数据库查询性能"等
    2. 任务的详细描述：基于任务标题和所属功能，提供具体、可执行的描述，包含实施步骤和预期结果
    3. 优先级：根据任务的重要性和紧急程度，从Must have、Should have、Could have、Won't have中选择
    4. 任务时长：根据任务复杂度合理分配时长（简单任务8-16小时，中等任务16-40小时，复杂任务40-120小时）
    5. 创建时间和更新时间：使用当前日期和时间
    
    只返回 JSON 数组，不要其它文本。
    功能数组：${JSON.stringify(features)}`;

    // 添加调试功能，打印生成的提示词内容
    console.log('TasksPrompt (Chinese) - Generated prompt:');
    console.log(prompt);
    console.log('TasksPrompt (Chinese) - Input features:');
    console.log(JSON.stringify(features, null, 2));

    return prompt;
  },
  en: (features: any[]) => {
    const prompt = `For the feature array below, break down each feature into 4-5 executable development tasks, output as a flat JSON array.
    Single task structure:
    {"id":"string","feature_id":integer,"title":"string","status":"string","description":"string","priority":"string","tag":"string","duration":integer,"created_at":"string","updated_at":"string"}
    
    The id must be a string in the format "task{featureID}_{sequence}", where sequence starts from 1.
    The feature_id must be the id of the parent feature, used to identify which feature the task belongs to.
    status is the task status, default is "todo".
    priority is the priority level, select from "Must have", "Should have", "Could have", "Won't have".
    tag is the tag, use the parent feature title.
    duration is the task duration in hours (integer).
    created_at and updated_at are creation and update times, format as "YYYY-MM-DD HH:MM:SS".
    
    For example: the first feature's task ids are "task1_1", "task1_2", "task1_3", "task1_4", feature_id is 1; the second feature's task ids are "task2_1", "task2_2", "task2_3", "task2_4", feature_id is 2, and so on.
    
    Based on the current date, please auto-generate:
    1. Task title: Based on the task title and its parent feature, provide a concise and clear title, such as "Implement user login feature" or "Optimize database query performance"
    2. Task description: Provide specific, actionable descriptions based on the task title and its parent feature, including implementation steps and expected outcomes
    3. Priority: Select from Must have, Should have, Could have, Won't have based on task importance and urgency
    4. Task duration: Allocate reasonable duration based on task complexity (simple tasks: 8-16 hours, medium tasks: 16-40 hours, complex tasks: 40-120 hours)
    5. Creation and update times: Use current date and time

    
    Return ONLY the JSON array, no other text.
    Feature array: ${JSON.stringify(features)}`;
    
    // 添加调试功能，打印生成的提示词内容
    console.log('TasksPrompt (English) - Generated prompt:');
    console.log(prompt);
    console.log('TasksPrompt (English) - Input features:');
    console.log(JSON.stringify(features, null, 2));

    return prompt;
  }
};
