const aiTechnologyPattern = /\b(ai|llms?|llama|langchain|langgraph|rag|agents?|generative|semantic|embeddings?|prompt|mcp|human-in-the-loop)\b/i;

export function technologyClassName(technology: string) {
  return aiTechnologyPattern.test(technology) ? "ai-tech-tag" : undefined;
}
