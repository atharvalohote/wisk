export function cleanAIResponse(jsonString: string): string {
  // Remove markdown code block wrappers if present
  return jsonString.replace(/^```json|```$/g, '').trim();
} 