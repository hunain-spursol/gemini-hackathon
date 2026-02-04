
export type Theme = 'light' | 'dark';

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
}

export interface Endpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  parameters?: Record<string, any>;
}


export interface AuthField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url';
  required: boolean;
  description?: string;
  placeholder?: string;
}

export interface AuthConfig {
  type: 'apiKey' | 'oauth2' | 'basic' | 'custom';
  fields: AuthField[];
}

export interface Integration {
  id: string;
  name: string;
  description?: string;
  docsUrl: string;
  endpoints: Endpoint[];
  status: 'connected' | 'error' | 'pending';
  authConfig?: AuthConfig;
  config: Record<string, string>;
  createdAt: number;
}


export interface Project {
  id: string;
  name: string;
  icon: string;
  integrationIds: string[];
  messages: Message[];
  createdAt: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  toolCalls?: any[];
}

export interface Capability {
  id: string;
  name: string;
  description: string;
  endpoints: Endpoint[];
}
