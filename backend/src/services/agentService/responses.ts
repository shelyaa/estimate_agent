export const clarificationResponse = (json: any) => `
### 🔍 Clarification Needed
Unfortunately, the current requirements are insufficient to provide an accurate estimation.

**What we've gathered so far:**
${json.understood_requirements_summary.map((item: string) => `- ${item}`).join('\n')}

**Ambiguous Areas:**
${json.missing_or_unclear_areas.map((area: any) => `- **${area.area}**: ${area.problem}`).join('\n')}

---

**Please provide answers to the following questions:**
${json.clarification_questions
    .sort((a: any, b: any) => (a.priority === 'high' ? -1 : 1))
    .map((q: any) => `${q.id}. [${q.priority.toUpperCase()}] ${q.question}`)
    .join('\n')}
`;

export const estimationResponse = (json: any) => `
### 📊 Preliminary Project Estimation
Requirements have been fully processed. The estimate is based on historical data from similar tasks.

**Task Breakdown:**
${json.tasks.map((t: any) => `
#### 🔹 ${t.task}
- **Milestone:** ${t.milestone}
- **Total Estimate:** **${t.estimate_hours.total} hrs.**
- **Distribution:** Front (${t.estimate_hours.front_logic + t.estimate_hours.front_view}) | Back (${t.estimate_hours.back_api + t.estimate_hours.back_logic}) | QA (${t.estimate_hours.testing})
- **Estimation Basis:** ${t.historical_reference}`).join('\n')}

---

**Confidence Level:** \`${json.confidence.toUpperCase()}\`

**Risks:**
${json.risks.map((risk: string) => `- ${risk}`).join('\n')}

*Total Project Estimate: ${json.tasks.reduce((acc: number, t: any) => acc + t.estimate_hours.total, 0)} hrs.*
`;

export const undefinedErrorResponse = () => `
### ⚠️ Processing Error
The system failed to recognize the response format or a critical error occurred during PDF analysis.
Please check the file's integrity and try again or contact the administrator.
`;