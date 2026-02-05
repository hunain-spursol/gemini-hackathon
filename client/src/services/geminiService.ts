import { Integration, Endpoint } from "../types";

const API_BASE_URL = 'http://localhost:8000/api';

export const searchForDocs = async (name: string): Promise<{ url: string; description: string } | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/docs/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error searching for docs:", error);
    return null;
  }
};

export const analyzeCapabilities = async (docsUrl: string, name: string, fileContent?: string): Promise<import("../types").Capability[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/docs/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docsUrl, name, fileContent })
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error analyzing capabilities:", error);
    return [];
  }
};


export const analyzeAuthRequirements = async (docsUrl: string, name: string, fileContent?: string): Promise<import("../types").AuthConfig> => {
  try {
    const response = await fetch(`${API_BASE_URL}/docs/analyze-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docsUrl, name, fileContent })
    });
    if (!response.ok) return { type: "custom", fields: [] };
    return await response.json();
  } catch (error) {
    console.error("Error analyzing auth requirements:", error);
    return { type: "custom", fields: [] };
  }
};

export const chatWithAgent = async (
  message: string,
  integrations: Integration[],
  history: { role: 'user' | 'assistant'; content: string }[]
): Promise<{ text: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, integrations, history })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};
