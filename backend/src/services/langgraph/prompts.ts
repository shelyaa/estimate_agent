export const checkPDFPrompt = (text: string) =>`
    If requirements are missing or unclear, firstly clarify them before breaking down tasks.
    You always should Validate requirements completeness  
    Check whether ALL of the following are clearly defined:
    - Functional scope
    - Non-functional requirements (performance, security, scalability)
    - Platforms (web / mobile / admin / API)
    - User roles and permissions
    - Integrations (3rd party services, APIs)
    - Data storage and complexity
    - UI/UX expectations
    - Deployment environment
    
    Extracted text:
    ${text}
`

export const breakdownTasksPrompt = (text: string) => `
    Based on the text below you should break down tasks that in future will be estimated.
    ${text}
`