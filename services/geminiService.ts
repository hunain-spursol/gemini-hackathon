
import { GoogleGenAI, Type, GenerateContentResponse, FunctionDeclaration } from "@google/genai";
import { Integration, Endpoint } from "../types";

// Always use process.env.API_KEY directly to initialize GoogleGenAI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchForDocs = async (name: string): Promise<{ url: string; description: string } | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find the official API documentation URL for: ${name}. 
      Use the googleSearch tool to find the official documentation.
      If you find a high-confidence official URL, return a JSON object with "url" and "description".
      If you cannot find the official documentation or are unsure, return null.
      Return ONLY the raw JSON string in your response, no markdown formatting.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text;
    if (!text) return null;

    // Attempt to clean markdown if the model ignores the "no markdown" instruction
    const cleanText = typeof text === 'string' ? text.replace(/```json/g, '').replace(/```/g, '').trim() : '';

    try {
      return JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse JSON from search response:", text);
      return null;
    }
  } catch (error) {
    console.error("Error searching for docs:", error);
    return null;
  }
};

export const analyzeCapabilities = async (docsUrl: string, name: string, fileContent?: string): Promise<import("../types").Capability[]> => {
  const prompt = fileContent
    ? `Based on the following API documentation content for ${name}, identify 3-6 high-level user capabilities. Content: ${fileContent.slice(0, 50000)}`
    : `Based on the API documentation for ${name} at ${docsUrl}, identify 3-6 high-level user capabilities.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${prompt} 
    Do not list raw endpoints directly as capabilities. Instead, group related endpoints into user-friendly "Capabilities" (e.g. "Manage Issues", "User Administration").
    For each capability, provide a user-friendly name, a description, and the list of specific endpoints required to fulfill it.
    
    Return a JSON array of Capability objects.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING, description: "Friendly name e.g. 'Manage Issues'" },
            description: { type: Type.STRING, description: "What this capability allows the user to do" },
            endpoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  method: { type: Type.STRING, enum: ["GET", "POST", "PUT", "DELETE", "PATCH"] },
                  path: { type: Type.STRING },
                  description: { type: Type.STRING },
                  parameterList: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        type: { type: Type.STRING },
                        description: { type: Type.STRING }
                      },
                      required: ["name", "type", "description"]
                    }
                  }
                },
                required: ["id", "method", "path", "description"]
              }
            }
          },
          required: ["id", "name", "description", "endpoints"]
        }
      }
    }
  });

  const rawCapabilities = JSON.parse(response.text || '[]');

  return rawCapabilities.map((cap: any) => ({
    id: cap.id,
    name: cap.name,
    description: cap.description,
    endpoints: cap.endpoints.map((ep: any) => {
      const parameters: Record<string, any> = {};
      if (ep.parameterList && Array.isArray(ep.parameterList)) {
        ep.parameterList.forEach((p: any) => {
          parameters[p.name] = {
            type: p.type === 'integer' ? 'number' : (p.type || 'string'),
            description: p.description
          };
        });
      }
      return {
        id: ep.id,
        method: ep.method,
        path: ep.path,
        description: ep.description,
        parameters: Object.keys(parameters).length > 0 ? parameters : undefined
      };
    })
  }));
};


export const analyzeAuthRequirements = async (docsUrl: string, name: string, fileContent?: string): Promise<import("../types").AuthConfig> => {
  const prompt = fileContent
    ? `Based on the following API documentation content for ${name}, identify the authentication requirements. Content: ${fileContent.slice(0, 50000)}`
    : `Based on the API documentation for ${name} at ${docsUrl}, identify the authentication requirements.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${prompt}
    Determine the authentication method (API Key, OAuth2, Basic Auth, or Custom) and the specific fields required (e.g., "Client ID", "Secret Key", "Domain", "API Token").
    
    Return a JSON object conforming to the AuthConfig interface:
    {
      "type": "apiKey" | "oauth2" | "basic" | "custom",
      "fields": [
        {
          "key": "unique_key_for_field",
          "label": "User Friendly Label",
          "type": "text" | "password" | "url",
          "required": boolean,
          "description": "Short explanation of where to find this value",
          "placeholder": "e.g. sk_test_..."
        }
      ]
    }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ["apiKey", "oauth2", "basic", "custom"] },
          fields: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                key: { type: Type.STRING },
                label: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["text", "password", "url"] },
                required: { type: Type.BOOLEAN },
                description: { type: Type.STRING },
                placeholder: { type: Type.STRING }
              },
              required: ["key", "label", "type", "required"]
            }
          }
        },
        required: ["type", "fields"]
      }
    }
  });

  return JSON.parse(response.text || '{"type": "custom", "fields": []}');
};

export const chatWithAgent = async (
  message: string,
  integrations: Integration[],
  history: { role: 'user' | 'assistant'; content: string }[]
): Promise<GenerateContentResponse> => {
  // Convert integration endpoints to FunctionDeclarations
  const toolDeclarations: FunctionDeclaration[] = integrations.flatMap(int =>
    int.endpoints.map(ep => ({
      name: `${int.name.toLowerCase().replace(/\s+/g, '_')}_${ep.id.replace(/[-]/g, '_')}`,
      description: `${ep.description} (Integration: ${int.name}, Endpoint: ${ep.method} ${ep.path})`,
      parameters: {
        type: Type.OBJECT,
        properties: ep.parameters || {
          note: { type: Type.STRING, description: "Any additional details needed for this request" }
        },
      }
    }))
  );

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      ...history.map(h => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] })),
      { role: 'user', parts: [{ text: message }] }
    ],
    config: {
      systemInstruction: `You are an MCP Forge agent. You help users interact with their connected integrations. 
      You have access to tools derived from REST APIs. When a user asks to perform an action related to an integration (like Jira, Slack, etc.), 
      use the appropriate tool. If you use a tool, explain what you are doing. If you don't have a specific tool, inform the user you can only use connected integrations.`,
      tools: toolDeclarations.length > 0 ? [{ functionDeclarations: toolDeclarations }] : undefined,
    },
  });

  return response;
};
