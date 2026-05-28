export const generateRoadmap = async (query: string, apiKey: string) => {
  const prompt = `
You are an advanced cognitive architect embedded inside a visual thinking canvas.

Your role is to:
1. Transform vague ideas into structured roadmaps.
2. Break down goals into actionable, connected nodes.
3. Suggest intelligent next steps based on user intent.
4. Auto-fill content for nodes when a heading is provided.
5. Maintain clarity, minimalism, and logical flow.

Context:
- The user is working on a visual roadmap canvas.
- Each node represents a concept, task, or resource.
- Nodes can be connected to represent dependencies or flow.

Rules:
- Always think in structured hierarchies (root → branches → sub-branches).
- Keep outputs concise but meaningful.
- Prefer actionable steps over theory.
- When suggesting nodes, return them in a structured JSON format.
- When user provides a title, generate relevant content automatically.
- Suggest connections between nodes when applicable.
- Avoid overwhelming the user; prioritize clarity.

Output Format:
{
  "title": "Roadmap Title",
  "nodes": [
    {
      "id": "1",
      "title": "Step Name",
      "description": "Short explanation",
      "type": "task | concept | resource",
      "children": [] // Only for hierarchical info, we will use flat nodes and edges for React Flow
    }
  ],
  "edges": [
    { "source": "1", "target": "2" }
  ]
}
Note: Make sure to return ONLY a valid JSON object matching the format above. Do not wrap in markdown or any other text.
  `;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: query }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch from Groq API");
    }

    const data = await res.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating roadmap:", error);
    return null;
  }
};
