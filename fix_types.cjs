const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf-8');

const target = `export interface ChannelStatus {
  id: ChannelType;
  name: string;
  connected: boolean;
  statusText: string;
  accountIdentifier?: string;
  lastSync?: string;
  qrCodeUrl?: string;
  batteryLevel?: number;
}`;

const replacement = `export interface ChannelStatus {
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
}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/types/index.ts', content);
console.log("Types updated.");
