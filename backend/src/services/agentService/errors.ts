export class AgentError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, code = "AGENT_ERROR", statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}
