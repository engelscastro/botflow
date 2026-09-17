import React, { useState, useCallback } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  Connection, 
  Edge, 
  Node 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Plus, 
  Zap, 
  MessageSquare, 
  HelpCircle, 
  GitBranch, 
  Sparkles, 
  Clock, 
  Globe, 
  UserCheck, 
  Tag, 
  Play, 
  Download, 
  Upload, 
  Save, 
  CheckCircle2, 
  Smartphone,
  Sliders,
  Layers,
  Undo2,
  Redo2,
  Pencil,
  Check,
  X,
  AlertCircle,
  Database,
  Calendar
} from 'lucide-react';

import { ChatFlow, ChatNode, FlowEdge, NodeData } from '../../types';
import { 
  TriggerNode, 
  MessageNode, 
  QuestionNode, 
  ConditionNode, 
  AINode, 
  DelayNode, 
  WebhookNode, 
  HandoverNode, 
  TagNode 
} from './CustomNodes';
import { NodeInspector } from './NodeInspector';
import { FlowSimulatorModal } from './FlowSimulatorModal';

const nodeTypes = {
  triggerNode: TriggerNode,
  messageNode: MessageNode,
  questionNode: QuestionNode,
  conditionNode: ConditionNode,
  aiNode: AINode,
  delayNode: DelayNode,
  webhookNode: WebhookNode,
  handoverNode: HandoverNode,
  tagNode: TagNode,
};

interface FlowCanvasProps {
  flows: ChatFlow[];
  activeFlowId: string;
  onSelectFlow: (id: string) => void;
  onSaveFlow: (updatedFlow: ChatFlow) => void;
  onCreateNewFlow: () => void;
  onImportFlow?: (importedFlow: ChatFlow) => void;
  theme?: 'dark' | 'light';
}

export const FlowCanvas: React.FC<FlowCanvasProps> = ({
  flows,
  activeFlowId,
  onSelectFlow,
  onSaveFlow,
  onCreateNewFlow,
  onImportFlow,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const currentFlow = flows.find(f => f.id === activeFlowId) || flows[0];

  const [nodes, setNodes, onNodesChange] = useNodesState(currentFlow.nodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentFlow.edges as any);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Flow renaming state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(currentFlow.name);

  // Hidden file input ref for JSON import
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isRestoringHistory = React.useRef<boolean>(false);

  // Push state snapshot to history
  const pushSnapshot = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    if (isRestoringHistory.current) return;

    const snapshot = {
      nodes: JSON.parse(JSON.stringify(newNodes)),
      edges: JSON.parse(JSON.stringify(newEdges))
    };

    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      const last = sliced[sliced.length - 1];
      if (last && JSON.stringify(last) === JSON.stringify(snapshot)) {
        return prev;
      }
      const updated = [...sliced, snapshot];
      if (updated.length > 40) updated.shift();
      return updated;
    });

    setHistoryIndex((prevIdx) => {
      const slicedLen = history.slice(0, prevIdx + 1).length;
      return Math.min(slicedLen, 39);
    });
  }, [historyIndex, history]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const targetState = history[prevIdx];
      if (targetState) {
        isRestoringHistory.current = true;
        setNodes(JSON.parse(JSON.stringify(targetState.nodes)));
        setEdges(JSON.parse(JSON.stringify(targetState.edges)));
        setSelectedNode(null);
        setHistoryIndex(prevIdx);
        setTimeout(() => {
          isRestoringHistory.current = false;
        }, 50);
      }
    }
  }, [historyIndex, history, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const targetState = history[nextIdx];
      if (targetState) {
        isRestoringHistory.current = true;
        setNodes(JSON.parse(JSON.stringify(targetState.nodes)));
        setEdges(JSON.parse(JSON.stringify(targetState.edges)));
        setSelectedNode(null);
        setHistoryIndex(nextIdx);
        setTimeout(() => {
          isRestoringHistory.current = false;
        }, 50);
      }
    }
  }, [historyIndex, history, setNodes, setEdges]);

  // Keyboard shortcut listener for Ctrl+Z / Cmd+Z / Ctrl+Y
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target && (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable
        )
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Sync state when activeFlowId changes
  React.useEffect(() => {
    setNodes(currentFlow.nodes as any);
    setEdges(currentFlow.edges as any);
    setSelectedNode(null);

    setEditedName(currentFlow.name);
    setIsEditingName(false);

    const initialSnapshot = {
      nodes: JSON.parse(JSON.stringify(currentFlow.nodes)),
      edges: JSON.parse(JSON.stringify(currentFlow.edges))
    };
    setHistory([initialSnapshot]);
    setHistoryIndex(0);
  }, [activeFlowId, currentFlow.name]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSaveRename = () => {
    if (!editedName.trim()) return;
    const updatedName = editedName.trim();
    const updated: ChatFlow = {
      ...currentFlow,
      name: updatedName,
      nodes: nodes as any,
      edges: edges as any,
      updatedAt: 'Agora'
    };
    onSaveFlow(updated);
    setIsEditingName(false);
    showToast(`Fluxo renomeado para "${updatedName}"!`, 'success');
  };

  const handleImportJSONFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        let importedObj: Partial<ChatFlow> | null = null;
        if (Array.isArray(parsed) && parsed.length > 0) {
          importedObj = parsed[0];
        } else if (parsed && typeof parsed === 'object') {
          importedObj = parsed;
        }

        if (!importedObj || !Array.isArray(importedObj.nodes)) {
          showToast('Formato inválido: O arquivo JSON não contém blocos de fluxo válidos.', 'error');
          return;
        }

        const newId = `flow-imported-${Date.now()}`;
        const newFlowName = importedObj.name ? `${importedObj.name} (Importado)` : `Fluxo Importado #${flows.length + 1}`;

        const newFlow: ChatFlow = {
          id: newId,
          name: newFlowName,
          description: importedObj.description || 'Fluxo importado via arquivo JSON.',
          channel: importedObj.channel || 'whatsapp',
          isActive: importedObj.isActive ?? true,
          updatedAt: 'Importado agora',
          triggerCount: 0,
          nodes: importedObj.nodes || [],
          edges: importedObj.edges || []
        };

        if (onImportFlow) {
          onImportFlow(newFlow);
        } else {
          onSaveFlow(newFlow);
          onSelectFlow(newId);
        }

        showToast(`Fluxo "${newFlowName}" importado com sucesso!`, 'success');
      } catch (err) {
        showToast('Erro ao ler arquivo JSON. Verifique se o formato está correto.', 'error');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) => {
        const nextEdges = addEdge(params, eds);
        pushSnapshot(nodes, nextEdges);
        return nextEdges;
      });
    },
    [setEdges, nodes, pushSnapshot]
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const handleUpdateNodeData = (nodeId: string, newData: Partial<NodeData>) => {
    setNodes((nds) => {
      const updatedNodes = nds.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: { ...n.data, ...newData }
          };
        }
        return n;
      });
      pushSnapshot(updatedNodes, edges);
      return updatedNodes;
    });
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, ...newData } } : null);
    }
  };

  const handleDeleteNode = (nodeId: string) => {
    const nextNodes = nodes.filter((n) => n.id !== nodeId);
    const nextEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
    setNodes(nextNodes);
    setEdges(nextEdges);
    setSelectedNode(null);
    pushSnapshot(nextNodes, nextEdges);
  };

  const handleAddNode = (type: string, label: string) => {
    const newNodeId = `node_${Date.now()}`;
    const newNode: Node = {
      id: newNodeId,
      type,
      position: { x: 300 + Math.random() * 80, y: 180 + Math.random() * 80 },
      data: {
        label,
        type: type.replace('Node', '') as any,
        messageText: type === 'messageNode' ? 'Olá! Como posso ajudar?' : undefined,
        quickReplies: type === 'messageNode' ? ['Sim', 'Não'] : undefined,
        aiProvider: type === 'aiNode' ? 'local_llama' : undefined,
        modelName: type === 'aiNode' ? 'llama3.2:3b' : undefined,
        systemPrompt: type === 'aiNode' ? 'Você é um assistente virtual inteligente.' : undefined
      }
    };
    const nextNodes = [...nodes, newNode];
    setNodes(nextNodes);
    pushSnapshot(nextNodes, edges);
  };

  // Wrapped change handlers to record removals in history
  const handleNodesChange = useCallback((changes: any) => {
    onNodesChange(changes);
    const hasRemove = changes.some((c: any) => c.type === 'remove');
    if (hasRemove) {
      setTimeout(() => {
        setNodes((currentNodes) => {
          setEdges((currentEdges) => {
            pushSnapshot(currentNodes, currentEdges);
            return currentEdges;
          });
          return currentNodes;
        });
      }, 20);
    }
  }, [onNodesChange, setNodes, setEdges, pushSnapshot]);

  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChange(changes);
    const hasRemove = changes.some((c: any) => c.type === 'remove');
    if (hasRemove) {
      setTimeout(() => {
        setNodes((currentNodes) => {
          setEdges((currentEdges) => {
            pushSnapshot(currentNodes, currentEdges);
            return currentEdges;
          });
          return currentNodes;
        });
      }, 20);
    }
  }, [onEdgesChange, setNodes, setEdges, pushSnapshot]);

  const onNodeDragStop = useCallback(() => {
    pushSnapshot(nodes, edges);
  }, [nodes, edges, pushSnapshot]);

  const handleSave = () => {
    const nameToSave = isEditingName && editedName.trim() ? editedName.trim() : currentFlow.name;
    const updated: ChatFlow = {
      ...currentFlow,
      name: nameToSave,
      nodes: nodes as any,
      edges: edges as any,
      updatedAt: 'Agora'
    };
    onSaveFlow(updated);
    setIsEditingName(false);
    showToast('Alterações do fluxo salvas com sucesso!', 'success');
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentFlow, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `botflow_${currentFlow.name.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className={`flex-1 flex flex-col h-full relative overflow-hidden transition-colors ${
      isDark ? 'bg-[#0A0A0B] text-slate-300' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Top Flow Header Toolbar */}
      <div className={`px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10 border-b ${
        isDark ? 'bg-[#050505] border-white/5' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        
        {/* Left: Flow Switcher & Metadata */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            
            {isEditingName ? (
              <div className={`flex items-center gap-1 border rounded-lg px-2 py-1 shadow-xs ${
                isDark ? 'bg-[#141417] border-blue-500/60' : 'bg-slate-100 border-blue-500'
              }`}>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename();
                    if (e.key === 'Escape') {
                      setIsEditingName(false);
                      setEditedName(currentFlow.name);
                    }
                  }}
                  autoFocus
                  className={`bg-transparent font-bold text-sm outline-none w-48 px-1 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                  placeholder="Nome do fluxo..."
                />
                <button
                  onClick={handleSaveRename}
                  className="p-1 hover:bg-emerald-500/20 text-emerald-500 rounded transition-colors cursor-pointer"
                  title="Salvar Nome (Enter)"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsEditingName(false);
                    setEditedName(currentFlow.name);
                  }}
                  className="p-1 hover:bg-rose-500/20 text-rose-500 rounded transition-colors cursor-pointer"
                  title="Cancelar (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <select
                  value={activeFlowId}
                  onChange={(e) => onSelectFlow(e.target.value)}
                  className={`font-bold text-sm border rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer transition-colors ${
                    isDark 
                      ? 'text-white bg-[#141417] border-white/10 hover:border-white/20' 
                      : 'text-slate-900 bg-slate-100 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {flows.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.channel === 'all' ? 'Multicanal' : f.channel.toUpperCase()})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    setEditedName(currentFlow.name);
                    setIsEditingName(true);
                  }}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isDark 
                      ? 'bg-[#141417] hover:bg-white/10 text-slate-300 hover:text-white border-white/10' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300'
                  }`}
                  title="Renomear este Fluxo"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onCreateNewFlow}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
              isDark 
                ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Novo Fluxo
          </button>

          <span className={isDark ? 'text-white/10' : 'text-slate-300'}>|</span>

          <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Gatilhos executados: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{currentFlow.triggerCount}</strong>
          </span>
        </div>

        {/* Right: Actions (Test Simulator, Import, Export, Save) */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJSONFile}
            className="hidden"
          />

          {toastMessage && (
            <span className={`text-xs font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg border animate-in fade-in duration-200 ${
              toastMessage.type === 'success' 
                ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' 
                : 'text-rose-500 bg-rose-500/10 border-rose-500/20'
            }`}>
              {toastMessage.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {toastMessage.text}
            </span>
          )}

          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Testar Fluxo no Chat
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className={`font-medium text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-colors ${
              isDark 
                ? 'bg-[#141417] hover:bg-white/10 text-slate-300 border-white/10' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
            title="Importar fluxo a partir de um arquivo JSON"
          >
            <Upload className="w-3.5 h-3.5 text-blue-500" /> Importar
          </button>

          <button
            onClick={handleExportJSON}
            className={`font-medium text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-colors ${
              isDark 
                ? 'bg-[#141417] hover:bg-white/10 text-slate-300 border-white/10' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
            title="Exportar fluxo em arquivo JSON"
          >
            <Download className="w-3.5 h-3.5" /> Exportar
          </button>

          <button
            onClick={handleSave}
            className={`font-bold text-xs px-4 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isDark ? 'bg-white text-black hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <Save className="w-3.5 h-3.5" /> Salvar Alterações
          </button>
        </div>

      </div>

      {/* Main Flow Editor Area */}
      <div className="flex-1 flex relative overflow-hidden">
        
        {/* Left Palette: Draggable / Clickable Nodes */}
        <div className={`w-60 border-r p-4 overflow-y-auto space-y-3 z-10 text-xs shrink-0 ${
          isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-white border-slate-200'
        }`}>
          <span className={`font-bold uppercase tracking-[0.15em] text-[10px] block ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Adicionar Blocos de Automação
          </span>

          <div className="space-y-1.5">
            <button
              onClick={() => handleAddNode('triggerNode', 'Gatilho Palavra-Chave')}
              className="w-full text-left p-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-500 dark:text-amber-300 flex items-center gap-2 font-medium transition-colors cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>1. Gatilho / Início</span>
            </button>

            <button
              onClick={() => handleAddNode('messageNode', 'Enviar Mensagem')}
              className="w-full text-left p-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-600 dark:text-blue-300 flex items-center gap-2 font-medium transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-blue-500 shrink-0" />
              <span>2. Mensagem do Bot</span>
            </button>

            <button
              onClick={() => handleAddNode('questionNode', 'Fazer Pergunta')}
              className="w-full text-left p-2.5 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-xl text-violet-600 dark:text-violet-300 flex items-center gap-2 font-medium transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-violet-500 shrink-0" />
              <span>3. Pergunta & Captura</span>
            </button>

            <button
              onClick={() => handleAddNode('aiNode', 'Resposta Inteligente (IA)')}
              className="w-full text-left p-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-600 dark:text-purple-300 flex items-center gap-2 font-medium transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
              <span>4. Agente IA (Llama / Gemini)</span>
            </button>

            <button
              onClick={() => handleAddNode('conditionNode', 'Se / Senão')}
              className="w-full text-left p-2.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl text-orange-600 dark:text-orange-300 flex items-center gap-2 font-medium transition-colors cursor-pointer"
            >
              <GitBranch className="w-4 h-4 text-orange-500 shrink-0" />
              <span>5. Condição / Se-Senão</span>
            </button>

            <button
              onClick={() => handleAddNode('delayNode', 'Aguardar X Segundos')}
              className={`w-full text-left p-2.5 rounded-xl border flex items-center gap-2 font-medium transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
              }`}
            >
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>6. Pausa / Digitando...</span>
            </button>

            <button
              onClick={() => handleAddNode('webhookNode', 'Chamada API Externa')}
              className="w-full text-left p-2.5 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-xl text-teal-600 dark:text-teal-300 flex items-center gap-2 font-medium transition-colors cursor-pointer"
            >
              <Globe className="w-4 h-4 text-teal-500 shrink-0" />
              <span>7. Webhook / API</span>
            </button>

            <button
              onClick={() => handleAddNode('handoverNode', 'Transferir para Humano')}
              className="w-full text-left p-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-600 dark:text-indigo-300 flex items-center gap-2 font-medium transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>8. Transf. Atendente</span>
            </button>

            <button
              onClick={() => handleAddNode('tagNode', 'Adicionar Tag')}
              className="w-full text-left p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-300 flex items-center gap-2 font-medium transition-colors cursor-pointer"
            >
              <Tag className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>9. Etiqueta / Tag</span>
            </button>
            <button
              onClick={() => handleAddNode('databaseNode', 'Ação Interna CRM')}
              className="w-full text-left p-2.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-xl text-sky-600 dark:text-sky-300 flex items-center gap-2 font-medium transition-colors cursor-pointer"
            >
              <Database className="w-4 h-4 text-sky-500 shrink-0" />
              <span>10. Cadastro CRM DB</span>
            </button>
            <button
              onClick={() => handleAddNode('scheduleNode', 'Agendamento')}
              className="w-full text-left p-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-600 dark:text-purple-300 flex items-center gap-2 font-medium transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-purple-500 shrink-0" />
              <span>11. Agenda Interna</span>
            </button>
          </div>

          <div className={`pt-3 border-t text-[11px] space-y-1 ${
            isDark ? 'border-white/5 text-slate-500' : 'border-slate-200 text-slate-500'
          }`}>
            <span className={`font-semibold block ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>💡 Instruções & Atalhos:</span>
            <p>1. Clique nos blocos para adicionar à tela.</p>
            <p>2. Conecte as bolinhas para criar o fluxo.</p>
            <p>3. Clique em um nó para editar propriedades.</p>
            <p className="text-blue-500 font-medium pt-1">⌨️ <strong>Ctrl + Z</strong>: Desfazer | <strong>Ctrl + Y</strong>: Refazer</p>
          </div>
        </div>

        {/* Center Canvas */}
        <div className={`flex-1 h-full relative ${
          isDark 
            ? 'bg-[#0A0A0B] bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px]' 
            : 'bg-slate-100 bg-[radial-gradient(rgba(0,0,0,0.08)_1px,transparent_1px)] [background-size:24px_24px]'
        }`}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onNodeDragStop={onNodeDragStop}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            colorMode={isDark ? 'dark' : 'light'}
            fitView
          >
            <Background color={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} gap={24} size={1} />
            <Controls className={isDark ? '!bg-[#141417] !border-[#26262B] !text-white' : '!bg-white !border-slate-300 !text-slate-900'} />
            
            {/* Botões Desfazer e Refazer logo abaixo/ao lado dos botões de Zoom */}
            <div className={`absolute bottom-4 left-16 z-10 flex items-center gap-1 border rounded-lg p-1 shadow-xl ${
              isDark ? 'bg-[#141417] border-[#26262B]' : 'bg-white border-slate-200'
            }`}>
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-semibold transition-all ${
                  canUndo 
                    ? isDark ? 'text-slate-200 hover:bg-white/10 hover:text-white cursor-pointer active:scale-95' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer active:scale-95'
                    : isDark ? 'text-slate-600 opacity-40 cursor-not-allowed' : 'text-slate-400 opacity-40 cursor-not-allowed'
                }`}
                title="Desfazer alteração (Ctrl + Z)"
              >
                <Undo2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Desfazer</span>
              </button>

              <div className={`w-[1px] h-4 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

              <button
                onClick={handleRedo}
                disabled={!canRedo}
                className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-semibold transition-all ${
                  canRedo 
                    ? isDark ? 'text-slate-200 hover:bg-white/10 hover:text-white cursor-pointer active:scale-95' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer active:scale-95'
                    : isDark ? 'text-slate-600 opacity-40 cursor-not-allowed' : 'text-slate-400 opacity-40 cursor-not-allowed'
                }`}
                title="Refazer alteração (Ctrl + Y)"
              >
                <Redo2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Refazer</span>
              </button>
            </div>

            <MiniMap 
              className={isDark ? '!bg-[#141417] !border-[#26262B]' : '!bg-white !border-slate-300'}
              nodeColor={(n) => {
                if (n.type === 'triggerNode') return '#f59e0b';
                if (n.type === 'messageNode') return '#3b82f6';
                if (n.type === 'questionNode') return '#8b5cf6';
                if (n.type === 'aiNode') return '#9333ea';
                return '#64748b';
              }} 
              zoomable 
              pannable 
            />
          </ReactFlow>
        </div>

        {/* Right Inspector Drawer */}
        {selectedNode && (
          <NodeInspector
            node={selectedNode}
            onUpdateNodeData={handleUpdateNodeData}
            onDeleteNode={handleDeleteNode}
            onClose={() => setSelectedNode(null)}
            theme={theme}
          />
        )}
      </div>

      {/* Simulator Modal */}
      <FlowSimulatorModal
        flow={currentFlow}
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        theme={theme}
      />

    </div>
  );
};
