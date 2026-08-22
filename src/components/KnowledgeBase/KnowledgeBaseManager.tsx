import React, { useState } from 'react';
import { 
  Database, 
  Plus, 
  Trash2, 
  FileText, 
  Search, 
  BookOpen, 
  Check, 
  Sparkles,
  X
} from 'lucide-react';
import { KnowledgeDocument } from '../../types';

interface KnowledgeBaseManagerProps {
  documents: KnowledgeDocument[];
  onAddDocument: (doc: KnowledgeDocument) => void;
  onDeleteDocument: (id: string) => void;
  theme?: 'dark' | 'light';
}

export const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({
  documents,
  onAddDocument,
  onDeleteDocument,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Geral');
  const [newContent, setNewContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = documents.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const doc: KnowledgeDocument = {
      id: `doc-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      content: newContent,
      tokens: Math.round(newContent.length / 4),
      updatedAt: 'Hoje'
    };
    onAddDocument(doc);
    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
  };

  return (
    <div className={`flex-1 p-6 overflow-y-auto space-y-6 transition-colors ${
      isDark ? 'bg-[#050505] text-slate-300' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border shadow-xs transition-all ${
        isDark ? 'bg-[#0A0A0B] border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-500" /> Base de Conhecimento RAG (Llama / Gemini)
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Cadastre textos, artigos de ajuda e FAQs da sua empresa. Os robôs de IA consultarão estes dados antes de responder aos clientes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Novo Artigo de Conhecimento
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar artigos da base..."
          className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs ${
            isDark 
              ? 'bg-[#0A0A0B] text-white border-white/10 placeholder-slate-500' 
              : 'bg-white text-slate-900 border-slate-200 placeholder-slate-400'
          }`}
        />
      </div>

      {/* Grid of Knowledge Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div 
            key={doc.id} 
            className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between hover:border-purple-500/40 transition-all ${
              isDark ? 'bg-[#0A0A0B] border-white/5' : 'bg-white border-slate-200 hover:shadow-md'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-semibold text-[10px] px-2 py-0.5 rounded">
                  {doc.category}
                </span>
                <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>~{doc.tokens} tokens</span>
              </div>

              <h3 className={`font-bold text-sm mb-2 line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{doc.title}</h3>
              <p className={`text-xs line-clamp-3 mb-4 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {doc.content}
              </p>
            </div>

            <div className={`flex items-center justify-between pt-3 border-t text-[11px] ${
              isDark ? 'border-white/5 text-slate-500' : 'border-slate-100 text-slate-400'
            }`}>
              <span>Atualizado: {doc.updatedAt}</span>
              <button
                onClick={() => onDeleteDocument(doc.id)}
                className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                title="Excluir documento"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`p-6 rounded-2xl border max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 ${
            isDark ? 'bg-[#0A0A0B] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" /> Adicionar Documento à Base de IA
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className={`p-1 rounded-lg transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Título do Artigo / FAQ</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Tabela de Preços e Prazos de Entrega"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark ? 'bg-[#141417] text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Categoria</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark ? 'bg-[#141417] text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'
                  }`}
                >
                  <option value="Geral">Geral</option>
                  <option value="Suporte Técnico">Suporte Técnico</option>
                  <option value="Vendas & Preços">Vendas & Preços</option>
                  <option value="Políticas de Reembolso">Políticas de Reembolso</option>
                  <option value="Serviços & Catálogo">Serviços & Catálogo</option>
                </select>
              </div>

              <div>
                <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Conteúdo do Documento (Texto Completo)</label>
                <textarea
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Insira as regras, informações, horários ou respostas detalhadas que a IA deve aprender..."
                  className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark ? 'bg-[#141417] text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setShowAddModal(false)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border ${
                  isDark ? 'border-white/10 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs"
              >
                Salvar na Base de IA
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
