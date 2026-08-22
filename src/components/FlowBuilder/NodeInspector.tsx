import React from 'react';
import { Node } from '@xyflow/react';
import { 
  X, 
  Trash2, 
  Zap, 
  MessageSquare, 
  HelpCircle, 
  GitBranch, 
  Sparkles, 
  Clock, 
  Globe, 
  UserCheck, 
  Tag,
  Plus,
  Minus,
  Database,
  Calendar
} from 'lucide-react';
import { NodeData } from '../../types';

interface NodeInspectorProps {
  node: Node | null;
  onUpdateNodeData: (nodeId: string, newData: Partial<NodeData>) => void;
  onDeleteNode: (nodeId: string) => void;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  node,
  onUpdateNodeData,
  onDeleteNode,
  onClose,
  theme = 'dark'
}) => {
  if (!node) return null;

  const isDark = theme === 'dark';
  const data = node.data as unknown as NodeData;

  const handleInputChange = (field: keyof NodeData, value: any) => {
    onUpdateNodeData(node.id, { [field]: value });
  };

  const handleAddQuickReply = () => {
    const current = data.quickReplies || [];
    handleInputChange('quickReplies', [...current, `Opção ${current.length + 1}`]);
  };

  const handleRemoveQuickReply = (index: number) => {
    const current = data.quickReplies || [];
    handleInputChange('quickReplies', current.filter((_, i) => i !== index));
  };

  const handleUpdateQuickReply = (index: number, text: string) => {
    const current = [...(data.quickReplies || [])];
    current[index] = text;
    handleInputChange('quickReplies', current);
  };

  const inputClasses = `w-full px-3 py-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
    isDark 
      ? 'bg-[#141417] text-white border-white/10 placeholder-slate-500' 
      : 'bg-white text-slate-900 border-slate-300 placeholder-slate-400'
  }`;

  return (
    <div className={`w-80 border-l h-full flex flex-col shadow-2xl z-20 animate-in slide-in-from-right duration-200 transition-colors ${
      isDark ? 'bg-[#0A0A0B] border-white/5 text-slate-300' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between ${
        isDark ? 'border-white/5 bg-[#141417]' : 'border-slate-200 bg-slate-50'
      }`}>
        <div className="flex items-center gap-2">
          {node.type === 'triggerNode' && <Zap className="w-4 h-4 text-amber-500" />}
          {node.type === 'messageNode' && <MessageSquare className="w-4 h-4 text-blue-500" />}
          {node.type === 'questionNode' && <HelpCircle className="w-4 h-4 text-violet-500" />}
          {node.type === 'conditionNode' && <GitBranch className="w-4 h-4 text-orange-500" />}
          {node.type === 'aiNode' && <Sparkles className="w-4 h-4 text-purple-500" />}
          {node.type === 'delayNode' && <Clock className="w-4 h-4 text-slate-500" />}
          {node.type === 'webhookNode' && <Globe className="w-4 h-4 text-teal-500" />}
          {node.type === 'handoverNode' && <UserCheck className="w-4 h-4 text-indigo-500" />}
          {node.type === 'tagNode' && <Tag className="w-4 h-4 text-emerald-500" />}
          {node.type === 'databaseNode' && <Database className="w-4 h-4 text-sky-500" />}
          {node.type === 'scheduleNode' && <Calendar className="w-4 h-4 text-purple-500" />}
          <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Configurar Nó</h3>
        </div>
        <button 
          onClick={onClose}
          className={`p-1 rounded-md transition-colors cursor-pointer ${
            isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Fields */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
        {/* Node Label */}
        <div>
          <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Título do Nó</label>
          <input
            type="text"
            value={data.label || ''}
            onChange={(e) => handleInputChange('label', e.target.value)}
            className={inputClasses}
          />
        </div>

        {/* Channel constraint */}
        <div>
          <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Canal de Destino</label>
          <select
            value={data.channel || 'all'}
            onChange={(e) => handleInputChange('channel', e.target.value)}
            className={inputClasses}
          >
            <option value="all">🌐 Todos os Canais</option>
            <option value="whatsapp">💬 WhatsApp Web</option>
            <option value="telegram">✈️ Telegram</option>
            <option value="instagram">📸 Instagram</option>
          </select>
        </div>

        {/* Trigger Node Specifics */}
        {node.type === 'triggerNode' && (
          <div className={`space-y-3 pt-2 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Tipo de Gatilho</label>
              <select
                value={data.triggerType || 'keyword'}
                onChange={(e) => handleInputChange('triggerType', e.target.value)}
                className={inputClasses}
              >
                <option value="keyword">Palavras-Chave (Keywords)</option>
                <option value="first_message">Primeira Mensagem do Cliente</option>
                <option value="qr_scan">QR Code Lido (WhatsApp)</option>
              </select>
            </div>

            {data.triggerType === 'keyword' && (
              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Palavras-Chave (separadas por vírgula)</label>
                <input
                  type="text"
                  value={data.keywords?.join(', ') || ''}
                  onChange={(e) => handleInputChange('keywords', e.target.value.split(',').map(s => s.trim()))}
                  placeholder="oi, olá, bom dia, ajuda"
                  className={inputClasses}
                />
              </div>
            )}
          </div>
        )}

        {/* Message Node Specifics */}
        {node.type === 'messageNode' && (
          <div className={`space-y-3 pt-2 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Texto da Mensagem</label>
              <textarea
                rows={4}
                value={data.messageText || ''}
                onChange={(e) => handleInputChange('messageText', e.target.value)}
                placeholder="Ex: Olá {user_name}, como posso te ajudar hoje?"
                className={inputClasses}
              />
              <span className={`text-[10px] mt-0.5 block ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Dica: Use variáveis como &#123;user_name&#125; ou &#123;user_email&#125;.</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Botões de Resposta Rápida</label>
                <button
                  type="button"
                  onClick={handleAddQuickReply}
                  className="text-blue-500 hover:text-blue-600 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Adicionar
                </button>
              </div>
              <div className="space-y-1.5">
                {(data.quickReplies || []).map((reply, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={reply}
                      onChange={(e) => handleUpdateQuickReply(idx, e.target.value)}
                      className={inputClasses}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveQuickReply(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Question Node Specifics */}
        {node.type === 'questionNode' && (
          <div className={`space-y-3 pt-2 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Pergunta do Bot</label>
              <textarea
                rows={3}
                value={data.messageText || ''}
                onChange={(e) => handleInputChange('messageText', e.target.value)}
                placeholder="Ex: Qual é o seu e-mail de contato?"
                className={inputClasses}
              />
            </div>

            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Nome da Variável de Destino</label>
              <input
                type="text"
                value={data.variableName || ''}
                onChange={(e) => handleInputChange('variableName', e.target.value)}
                placeholder="user_email, user_phone, user_cpf"
                className={`${inputClasses} font-mono`}
              />
            </div>

            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Tipo de Validação</label>
              <select
                value={data.validationType || 'text'}
                onChange={(e) => handleInputChange('validationType', e.target.value)}
                className={inputClasses}
              >
                <option value="text">Texto Livre</option>
                <option value="email">E-mail Válido</option>
                <option value="phone">Telefone / Celular</option>
                <option value="number">Apenas Números</option>
              </select>
            </div>
          </div>
        )}

        {/* AI LLM Node Specifics */}
        {node.type === 'aiNode' && (
          <div className={`space-y-3 pt-2 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Provedor de IA / LLM</label>
              <select
                value={data.aiProvider || 'local_llama'}
                onChange={(e) => handleInputChange('aiProvider', e.target.value)}
                className={inputClasses}
              >
                <option value="local_llama">🦙 IA Local (Llama 3.2 via Ollama)</option>
                <option value="gemini">✨ Gemini (Google Nuvem)</option>
              </select>
            </div>

            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Nome do Modelo</label>
              <input
                type="text"
                value={data.modelName || ''}
                onChange={(e) => handleInputChange('modelName', e.target.value)}
                placeholder={data.aiProvider === 'local_llama' ? 'llama3.2:3b' : 'gemini-2.5-flash'}
                className={`${inputClasses} font-mono`}
              />
            </div>

            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Instruções do Sistema (System Prompt)</label>
              <textarea
                rows={4}
                value={data.systemPrompt || ''}
                onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                placeholder="Ex: Você é o assistente virtual atencioso da empresa. Responda em português objetivo..."
                className={inputClasses}
              />
            </div>

            <div className={`flex items-center justify-between p-2.5 rounded-lg border ${
              isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'
            }`}>
              <div>
                <span className={`font-semibold block ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>Usar Base de Conhecimento RAG</span>
                <span className={`text-[10px] ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Injeta FAQs e documentos da empresa no contexto.</span>
              </div>
              <input
                type="checkbox"
                checked={data.useKnowledgeBase ?? true}
                onChange={(e) => handleInputChange('useKnowledgeBase', e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Condition Node Specifics */}
        {node.type === 'conditionNode' && (
          <div className={`space-y-3 pt-2 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Variável Avaliada</label>
              <input
                type="text"
                value={data.conditionVariable || ''}
                onChange={(e) => handleInputChange('conditionVariable', e.target.value)}
                placeholder="user_email, user_choice"
                className={`${inputClasses} font-mono`}
              />
            </div>

            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Operador de Comparação</label>
              <select
                value={data.conditionOperator || 'equals'}
                onChange={(e) => handleInputChange('conditionOperator', e.target.value)}
                className={inputClasses}
              >
                <option value="equals">É Igual a</option>
                <option value="contains">Contém o Texto</option>
                <option value="not_empty">Não está Vazio</option>
              </select>
            </div>

            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Valor Esperado</label>
              <input
                type="text"
                value={data.conditionValue || ''}
                onChange={(e) => handleInputChange('conditionValue', e.target.value)}
                placeholder="Ex: Sim, 1, @gmail.com"
                className={inputClasses}
              />
            </div>
          </div>
        )}

        {/* Handover Node Specifics */}
        {node.type === 'handoverNode' && (
          <div className={`space-y-3 pt-2 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Setor de Atendimento</label>
              <select
                value={data.targetDepartment || 'Atendimento Geral'}
                onChange={(e) => handleInputChange('targetDepartment', e.target.value)}
                className={inputClasses}
              >
                <option value="Suporte Técnico">Suporte Técnico</option>
                <option value="Equipe de Vendas">Equipe de Vendas</option>
                <option value="Financeiro / Cobrança">Financeiro / Cobrança</option>
                <option value="Atendimento Geral">Atendimento Geral</option>
              </select>
            </div>

            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Nota Interna para o Atendente</label>
              <textarea
                rows={2}
                value={data.agentNote || ''}
                onChange={(e) => handleInputChange('agentNote', e.target.value)}
                placeholder="Ex: Cliente solicita orçamento personalizado."
                className={inputClasses}
              />
            </div>
          </div>
        )}

        {/* Tag Node Specifics */}
        {node.type === 'tagNode' && (
          <div className={`space-y-3 pt-2 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
            <div>
              <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Nome da Tag / Etiqueta</label>
              <input
                type="text"
                value={data.tagName || ''}
                onChange={(e) => handleInputChange('tagName', e.target.value)}
                placeholder="Lead Qualificado, WhatsApp VIP"
                className={inputClasses}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className={`p-4 border-t flex items-center justify-between ${
        isDark ? 'border-white/5 bg-[#141417]' : 'border-slate-200 bg-slate-50'
      }`}>
        <button
          onClick={() => onDeleteNode(node.id)}
          className="flex items-center gap-1.5 text-rose-500 hover:text-rose-600 text-xs font-semibold px-3 py-1.5 rounded hover:bg-rose-500/10 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Excluir Nó
        </button>
        <button
          onClick={onClose}
          className={`text-xs font-bold px-4 py-1.5 rounded-lg shadow-xs cursor-pointer transition-colors ${
            isDark ? 'bg-white text-black hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          Concluído
        </button>
      </div>
    </div>
  );
};
