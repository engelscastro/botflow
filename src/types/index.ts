export type ChannelType = 'whatsapp' | 'telegram' | 'instagram' | 'web' | 'sms';

export type NodeType = 
  | 'trigger' 
  | 'message' 
  | 'question' 
  | 'condition' 
  | 'ai_llm' 
  | 'delay' 
  | 'webhook' 
  | 'handover' 
  | 'tag'
  | 'database'
  | 'schedule';

export interface NodeData {
  label: string;
  type: NodeType;
  channel?: ChannelType | 'all';

  // Trigger properties
  triggerType?: 'keyword' | 'first_message' | 'qr_scan' | 'webhook_event';
  keywords?: string[];
  
  // Message properties
  messageText?: string;
  mediaUrl?: string;
  quickReplies?: string[];
  
  // Question properties
  variableName?: string;
  validationType?: 'text' | 'email' | 'phone' | 'number';
  
  // Condition properties
  conditionVariable?: string;
  conditionOperator?: 'equals' | 'contains' | 'not_empty' | 'matches';
  conditionValue?: string;
  
  // AI LLM properties
  aiProvider?: 'local_llama' | 'gemini' | 'ollama';
  modelName?: string;
  systemPrompt?: string;
  temperature?: number;
  useKnowledgeBase?: boolean;
  
  // Delay properties
  delaySeconds?: number;
  showTyping?: boolean;
  
  // Webhook properties
  webhookUrl?: string;
  webhookMethod?: 'GET' | 'POST';
  
  // Handover properties
  targetDepartment?: string;
  agentNote?: string;
  
  // Tag properties
  actionType?: 'add_tag' | 'remove_tag' | 'set_status';
  tagName?: string;

  // Database properties (new)
  dbAction?: 'save_contact' | 'query_contact' | 'update_contact';

  // Schedule properties (new)
  scheduleAction?: 'book_appointment' | 'check_availability';
  serviceName?: string;
}

export interface ChatNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
}

export interface ChatFlow {
  id: string;
  name: string;
  description: string;
  channel: ChannelType | 'all';
  isActive: boolean;
  nodes: ChatNode[];
  edges: FlowEdge[];
  updatedAt: string;
  triggerCount: number;
}

export interface Message {
  id: string;
  sender: 'user' | 'bot' | 'agent';
  text: string;
  timestamp: string;
  channel: ChannelType;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  mediaUrl?: string;
  options?: string[];
  intentDetected?: string;
}

export interface Contact {
  id: string;
  name: string;
  phoneOrHandle: string;
  avatar?: string;
  channel: ChannelType;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isBotActive: boolean;
  assignedAgent?: string;
  tags: string[];
  variables: Record<string, string>;
  sentiment?: 'positivo' | 'neutro' | 'urgente';
  funnelStage?: 'Novo Lead' | 'Em Atendimento' | 'Proposta Enviada' | 'Convertido' | 'Handover Humano';
  currentNodeId?: string | null;
  currentFlowId?: string | null;
}

export interface Conversation {
  contactId: string;
  messages: Message[];
}

export interface ChannelStatus {
  id: ChannelType;
  name: string;
  connected: boolean;
  statusText: string;
  accountIdentifier?: string;
  lastSync?: string;
  qrCodeUrl?: string;
  batteryLevel?: number;
  engine?: 'baileys' | 'official';
  apiToken?: string;
  phoneNumberId?: string;
  verifyToken?: string;
}

export interface AIProviderConfig {
  activeProvider: 'local_llama' | 'gemini' | 'ollama';
  localEndpoint: string;
  localModelName: string;
  geminiApiKeyConfigured: boolean;
  temperature: number;
  maxTokens: number;
  fallbackToRuleBot: boolean;
  systemPromptTemplate: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: string;
  content: string;
  tokens: number;
  updatedAt: string;
  fileName?: string;
  fileType?: 'pdf' | 'docx' | 'doc' | 'txt' | 'manual';
  fileSize?: string;
  pages?: number;
}

export interface AnalyticsSummary {
  totalMessages: number;
  activeConversations: number;
  botResolutionRate: number; // percentage e.g. 84.5
  humanHandoverRate: number; // percentage e.g. 15.5
  avgResponseTimeSec: number;
  csatScore: number; // out of 5 e.g. 4.8
  messagesByChannel: { name: string; whatsapp: number; telegram: number; instagram: number; web: number }[];
  resolutionByBotVsHuman: { name: string; valor: number; color: string }[];
  topDropoffNodes: { nodeName: string; dropoffs: number; percentage: number }[];
  sentimentBreakdown: { type: string; count: number; color: string }[];
}

export interface BroadcastContact {
  id: string;
  name: string;
  phone: string;
  formattedPhone: string;
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'invalid';
  error?: string;
  sentAt?: string;
}

export interface BroadcastCampaign {
  id: string;
  name: string;
  messageTemplate: string;
  minDelaySeconds: number;
  maxDelaySeconds: number;
  simulateTyping: boolean;
  contacts: BroadcastContact[];
  status: 'idle' | 'running' | 'paused' | 'completed' | 'cancelled';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  role: 'admin' | 'enterprise' | 'community';
  status: 'active' | 'inactive' | 'blocked';
  lastLogin?: string;
  createdAt?: string;
}

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      getAppVersion: () => Promise<string>;
      openExternal: (url: string) => void;
      showNotification: (title: string, body: string) => void;
      openAutomatorWindow: () => void;
      startAutomatorCampaign: (data: { numbers: string[]; message: string; minDelay: number; maxDelay: number }) => void;
      stopAutomatorCampaign: () => void;
      onAutomatorLog: (callback: (data: { msg: string; type: string }) => void) => void;
    };
  }
}

