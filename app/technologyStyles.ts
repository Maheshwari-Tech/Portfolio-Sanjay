const aiTechnologyPattern = /\b(ai|ml|machine learning|llms?|llama|langchain|langgraph|rag|agents?|agentic|generative|semantic|retrieval|embeddings?|vector|prompt|mcp|human-in-the-loop|nlp|neural|model|tensor(?:flow)?|scikit|numpy|pandas|opencv|knowledge graph|tool calling|context engineering|structured outputs?|intelligence|root-cause|quality review|concept onboarding)\b/i;

export function technologyClassName(technology: string) {
  return aiTechnologyPattern.test(technology) ? "ai-tech-tag" : undefined;
}
