import { Database, Calendar } from 'lucide-react';
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  Zap, 
  MessageSquare, 
  HelpCircle, 
  GitBranch, 
  Sparkles, 
  Clock, 
  Globe, 
  UserCheck, 
  Tag,
  QrCode,
  Send
} from 'lucide-react';
import { NodeData } from '../../types';

// Helper for channel badges
const renderChannelBadge = (channel?: string) => {
  if (!channel || channel === 'all') return <span className="bg-white/10 text-slate-300 text-[10px] px-1.5 py-0.5 rounded font-mono">Todos Canais</span>;
  if (channel === 'whatsapp') return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-1.5 py-0.5 rounded font-mono">WhatsApp</span>;
  if (channel === 'telegram') return <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] px-1.5 py-0.5 rounded font-mono">Telegram</span>;
  if (channel === 'instagram') return <span className="bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] px-1.5 py-0.5 rounded font-mono">Instagram</span>;
  return null;
};

export const TriggerNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData;
  return (
    <div className={`w-64 bg-[#141417] rounded-xl shadow-2xl border-2 transition-all ${selected ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-amber-500/40 hover:border-amber-500/80'}`}>
      <div className="bg-amber-500/20 text-amber-300 px-3 py-2 rounded-t-lg border-b border-amber-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-xs uppercase tracking-wider">Gatilho / Início</span>
        </div>
        {renderChannelBadge(nodeData.channel)}
      </div>
      <div className="p-3 text-xs text-slate-300">
        <p className="font-bold text-white mb-1">{nodeData.label || 'Gatilho de Entrada'}</p>
        <p className="text-slate-400 text-[11px]">
          {nodeData.triggerType === 'keyword' && `Palavras-chave: ${nodeData.keywords?.join(', ') || 'oi, olá'}`}
          {nodeData.triggerType === 'first_message' && 'Primeira mensagem recebida'}
          {nodeData.triggerType === 'qr_scan' && 'Escaneamento de QR Code'}
        </p>
      </div>
      <Handle type="source" position={Position.Right} id="out" className="w-3 h-3 bg-amber-500 border-2 border-[#0A0A0B]" />
    </div>
  );
});

export const MessageNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData;
  return (
    <div className={`w-64 bg-[#141417] rounded-xl shadow-2xl border-2 transition-all ${selected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-blue-500/40 hover:border-blue-500/80'}`}>
      <Handle type="target" position={Position.Left} id="in" className="w-3 h-3 bg-blue-500 border-2 border-[#0A0A0B]" />
      <div className="bg-blue-500/20 text-blue-300 px-3 py-2 rounded-t-lg border-b border-blue-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-xs uppercase tracking-wider">Mensagem do Bot</span>
        </div>
        <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono">Texto</span>
      </div>
      <div className="p-3 text-xs text-slate-300">
        <p className="bg-black/40 p-2 rounded border border-white/5 text-slate-200 line-clamp-3 italic mb-2">
          "{nodeData.messageText || 'Digite o texto da mensagem...'}"
        </p>
        {nodeData.quickReplies && nodeData.quickReplies.length > 0 && (
          <div className="space-y-1 mt-2">
            <span className="text-[10px] font-medium text-slate-400 block">Botões / Respostas Rápidas:</span>
            <div className="flex flex-wrap gap-1">
              {nodeData.quickReplies.map((btn, idx) => (
                <span key={idx} className="bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded">
                  {btn}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="out" className="w-3 h-3 bg-blue-500 border-2 border-[#0A0A0B]" />
    </div>
  );
});

export const QuestionNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData;
  return (
    <div className={`w-64 bg-[#141417] rounded-xl shadow-2xl border-2 transition-all ${selected ? 'border-violet-500 ring-2 ring-violet-500/20' : 'border-violet-500/40 hover:border-violet-500/80'}`}>
      <Handle type="target" position={Position.Left} id="in" className="w-3 h-3 bg-violet-500 border-2 border-[#0A0A0B]" />
      <div className="bg-violet-500/20 text-violet-300 px-3 py-2 rounded-t-lg border-b border-violet-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-violet-400" />
          <span className="font-bold text-xs uppercase tracking-wider">Pergunta & Captura</span>
        </div>
        <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-1.5 py-0.5 rounded font-mono">
          {nodeData.variableName ? `{${nodeData.variableName}}` : '{variavel}'}
        </span>
      </div>
      <div className="p-3 text-xs text-slate-300">
        <p className="text-white mb-1 font-medium">{nodeData.messageText || 'Qual é o seu e-mail?'}</p>
        <p className="text-[11px] text-slate-400">
          Validação: <span className="font-semibold text-violet-400">{nodeData.validationType || 'text'}</span>
        </p>
      </div>
      <Handle type="source" position={Position.Right} id="out" className="w-3 h-3 bg-violet-500 border-2 border-[#0A0A0B]" />
    </div>
  );
});

export const ConditionNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData;
  return (
    <div className={`w-64 bg-[#141417] rounded-xl shadow-2xl border-2 transition-all ${selected ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-orange-500/40 hover:border-orange-500/80'}`}>
      <Handle type="target" position={Position.Left} id="in" className="w-3 h-3 bg-orange-500 border-2 border-[#0A0A0B]" />
      <div className="bg-orange-500/20 text-orange-300 px-3 py-2 rounded-t-lg border-b border-orange-500/30 flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-orange-400" />
        <span className="font-bold text-xs uppercase tracking-wider">Condição / Ramificação</span>
      </div>
      <div className="p-3 text-xs text-slate-300">
        <p className="font-mono text-[11px] bg-black/40 text-orange-300 p-1.5 rounded border border-white/5 mb-2">
          SE {nodeData.conditionVariable || 'variavel'} {nodeData.conditionOperator || 'igual_a'} "{nodeData.conditionValue || 'valor'}"
        </p>
        <div className="flex justify-between text-[11px] font-semibold text-slate-400 pt-1">
          <span className="text-emerald-400">Sim ➔</span>
          <span className="text-rose-400">Não ➔</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="true" style={{ top: '65%' }} className="w-3 h-3 bg-emerald-500 border-2 border-[#0A0A0B]" />
      <Handle type="source" position={Position.Right} id="false" style={{ top: '85%' }} className="w-3 h-3 bg-rose-500 border-2 border-[#0A0A0B]" />
    </div>
  );
});

export const AINode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData;
  const isLlama = nodeData.aiProvider === 'local_llama';
  return (
    <div className={`w-64 bg-[#141417] rounded-xl shadow-2xl border-2 transition-all ${selected ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-purple-500/40 hover:border-purple-500/80'}`}>
      <Handle type="target" position={Position.Left} id="in" className="w-3 h-3 bg-purple-500 border-2 border-[#0A0A0B]" />
      <div className="bg-purple-500/20 text-purple-300 px-3 py-2 rounded-t-lg border-b border-purple-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="font-bold text-xs uppercase tracking-wider">Resposta com IA</span>
        </div>
        <span className="text-[10px] bg-purple-500/30 text-purple-200 border border-purple-500/40 px-1.5 py-0.5 rounded font-mono font-bold">
          {isLlama ? '🦙 Llama 3.2' : '✨ Gemini'}
        </span>
      </div>
      <div className="p-3 text-xs text-slate-300">
        <div className="flex items-center gap-1 text-[11px] text-purple-300 font-medium mb-1">
          <span>Modelo: {nodeData.modelName || 'llama3.2:3b'}</span>
        </div>
        <p className="text-slate-400 text-[11px] line-clamp-2 bg-black/40 p-1.5 rounded border border-white/5 font-mono">
          Prompt: {nodeData.systemPrompt || 'Responda dúvidas sobre o produto.'}
        </p>
        {nodeData.useKnowledgeBase && (
          <div className="mt-2 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-500/20">
            ✓ Base de Conhecimento RAG Ativa
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="out" className="w-3 h-3 bg-purple-500 border-2 border-[#0A0A0B]" />
    </div>
  );
});

export const DelayNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData;
  return (
    <div className={`w-56 bg-[#141417] rounded-xl shadow-2xl border-2 transition-all ${selected ? 'border-slate-500 ring-2 ring-slate-500/20' : 'border-slate-700 hover:border-slate-500'}`}>
      <Handle type="target" position={Position.Left} id="in" className="w-3 h-3 bg-slate-500 border-2 border-[#0A0A0B]" />
      <div className="bg-slate-800 text-slate-300 px-3 py-2 rounded-t-lg border-b border-white/5 flex items-center gap-2">
        <Clock className="w-4 h-4 text-slate-400" />
        <span className="font-bold text-xs uppercase tracking-wider">Pausa / Espera</span>
      </div>
      <div className="p-3 text-xs text-slate-300">
        <p className="font-semibold text-white">Aguardar {nodeData.delaySeconds || 3} segundos</p>
        {nodeData.showTyping && (
          <p className="text-[10px] text-slate-400 mt-1">Exibir "digitando..." no chat</p>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="out" className="w-3 h-3 bg-slate-500 border-2 border-[#0A0A0B]" />
    </div>
  );
});

export const WebhookNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData;
  return (
    <div className={`w-60 bg-[#141417] rounded-xl shadow-2xl border-2 transition-all ${selected ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-teal-500/40 hover:border-teal-500/80'}`}>
      <Handle type="target" position={Position.Left} id="in" className="w-3 h-3 bg-teal-500 border-2 border-[#0A0A0B]" />
      <div className="bg-teal-500/20 text-teal-300 px-3 py-2 rounded-t-lg border-b border-teal-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-teal-400" />
          <span className="font-bold text-xs uppercase tracking-wider">Webhook HTTP</span>
        </div>
        <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
          {nodeData.webhookMethod || 'POST'}
        </span>
      </div>
      <div className="p-3 text-xs text-slate-300">
        <p className="font-mono text-[10px] text-teal-300 truncate bg-black/40 p-1.5 rounded border border-white/5">
          {nodeData.webhookUrl || 'https://api.empresa.com/lead'}
        </p>
      </div>
      <Handle type="source" position={Position.Right} id="out" className="w-3 h-3 bg-teal-500 border-2 border-[#0A0A0B]" />
    </div>
  );
});

export const HandoverNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData;
  return (
    <div className={`w-60 bg-[#141417] rounded-xl shadow-2xl border-2 transition-all ${selected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-indigo-500/40 hover:border-indigo-500/80'}`}>
      <Handle type="target" position={Position.Left} id="in" className="w-3 h-3 bg-indigo-500 border-2 border-[#0A0A0B]" />
      <div className="bg-indigo-500/20 text-indigo-300 px-3 py-2 rounded-t-lg border-b border-indigo-500/30 flex items-center gap-2">
        <UserCheck className="w-4 h-4 text-indigo-400" />
        <span className="font-bold text-xs uppercase tracking-wider">Atendente Humano</span>
      </div>
      <div className="p-3 text-xs text-slate-300">
        <p className="font-medium text-white">Transferir para: {nodeData.targetDepartment || 'Equipe Geral'}</p>
        <p className="text-[10px] text-slate-400 mt-1">Pausa o robô e abre chamado na Inbox</p>
      </div>
    </div>
  );
});

export const TagNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData;
  return (
    <div className={`w-56 bg-[#141417] rounded-xl shadow-2xl border-2 transition-all ${selected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-emerald-500/40 hover:border-emerald-500/80'}`}>
      <Handle type="target" position={Position.Left} id="in" className="w-3 h-3 bg-emerald-500 border-2 border-[#0A0A0B]" />
      <div className="bg-emerald-500/20 text-emerald-300 px-3 py-2 rounded-t-lg border-b border-emerald-500/30 flex items-center gap-2">
        <Tag className="w-4 h-4 text-emerald-400" />
        <span className="font-bold text-xs uppercase tracking-wider">Etiqueta / Tag</span>
      </div>
      <div className="p-3 text-xs text-slate-300">
        <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-semibold px-2 py-0.5 rounded inline-block">
          + {nodeData.tagName || 'Tag Exemplo'}
        </span>
      </div>
      <Handle type="source" position={Position.Right} id="out" className="w-3 h-3 bg-emerald-500 border-2 border-[#0A0A0B]" />
    </div>
  );
});


export const DatabaseNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData;
  return (
    <div className={`w-64 bg-[#141417] rounded-xl shadow-2xl border-2 transition-all ${selected ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-sky-500/40 hover:border-sky-500/80'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-sky-500/50 border-2 border-sky-400" />
      <div className="bg-sky-500/20 text-sky-300 px-3 py-2 rounded-t-lg border-b border-sky-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-xs uppercase tracking-wider">Ação Interna DB</span>
        </div>
      </div>
      <div className="p-3 text-xs text-slate-300">
        <p className="font-bold text-white mb-1">{nodeData.label || 'Salvar / Consultar Cliente'}</p>
        <p className="text-slate-400 text-[11px]">
          {nodeData.dbAction === 'save_contact' ? 'Cadastrar Doador/Cliente' : nodeData.dbAction === 'update_contact' ? 'Atualizar Registro CRM' : 'Consultar contato no DB'}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-sky-500 border-2 border-slate-900" />
    </div>
  );
});

export const ScheduleNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData;
  return (
    <div className={`w-64 bg-[#141417] rounded-xl shadow-2xl border-2 transition-all ${selected ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-purple-500/40 hover:border-purple-500/80'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500/50 border-2 border-purple-400" />
      <div className="bg-purple-500/20 text-purple-300 px-3 py-2 rounded-t-lg border-b border-purple-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs uppercase tracking-wider">Agendamento</span>
        </div>
      </div>
      <div className="p-3 text-xs text-slate-300">
        <p className="font-bold text-white mb-1">{nodeData.label || 'Marcar Agenda'}</p>
        <p className="text-slate-400 text-[11px] truncate">
          Serviço: {nodeData.serviceName || 'Atendimento'}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-500 border-2 border-slate-900" />
    </div>
  );
});
