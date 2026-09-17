import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  FileText, 
  Search, 
  BookOpen, 
  Sparkles,
  X,
  UploadCloud,
  FileCode,
  FileType,
  Loader2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Download,
  Copy,
  Check
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
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  
  // Manual / Edit State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Geral');
  const [newContent, setNewContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected document for viewing modal
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload States
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDocs = documents.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.fileName && d.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleProcessFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    const validExtensions = ['pdf', 'docx', 'doc', 'txt', 'md', 'csv', 'json'];
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (!validExtensions.includes(ext)) {
        setUploadError(`O formato .${ext} não é suportado. Use PDF, Word (.docx/.doc) ou Texto (.txt/.md).`);
        continue;
      }

      setUploadProgress(`Processando arquivo (${i + 1}/${files.length}): ${file.name}...`);

      try {
        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const b64 = result.split(',')[1] || result;
            resolve(b64);
          };
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });

        // Send to backend API
        const response = await fetch('/api/knowledge/parse-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64,
            filename: file.name,
            mimetype: file.type
          })
        });

        const data = await response.json();

        if (data.success && data.text) {
          const title = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          const doc: KnowledgeDocument = {
            id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            title: title.charAt(0).toUpperCase() + title.slice(1),
            category: newCategory || 'Documentos',
            content: data.text,
            tokens: data.tokensEstimate || Math.round(data.text.length / 4),
            updatedAt: 'Hoje',
            fileName: file.name,
            fileType: (ext === 'pdf' ? 'pdf' : (ext === 'docx' || ext === 'doc') ? 'docx' : 'txt') as any,
            fileSize: formatFileSize(file.size),
            pages: data.pages
          };

          onAddDocument(doc);
          successCount++;
        } else {
          setUploadError(data.error || `Não foi possível extrair texto do arquivo ${file.name}`);
        }
      } catch (err: any) {
        setUploadError(`Erro ao enviar ${file.name}: ${err?.message || err}`);
      }
    }

    setIsUploading(false);
    setUploadProgress('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (successCount > 0) {
      setShowAddModal(false);
    }
  };

  const handleManualSave = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const doc: KnowledgeDocument = {
      id: `doc-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      tokens: Math.round(newContent.length / 4),
      updatedAt: 'Hoje',
      fileType: 'manual'
    };
    onAddDocument(doc);
    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
  };

  const handleCopyContent = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getBadgeIcon = (fileType?: string) => {
    switch (fileType) {
      case 'pdf':
        return <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded">PDF</span>;
      case 'docx':
      case 'doc':
        return <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded">WORD</span>;
      case 'txt':
        return <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded">TXT</span>;
      default:
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded">TEXTO</span>;
    }
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
            <BookOpen className="w-6 h-6 text-purple-500" /> Base de Conhecimento RAG (PDF, Word & Textos)
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Faça upload de arquivos <strong>PDF, Word (.docx) ou Textos</strong> com políticas, catálogos e FAQs. A IA (Llama e Gemini) lerá e responderá as dúvidas com base neles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('upload');
              setShowAddModal(true);
            }}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" /> Upload de Arquivo (PDF / Word)
          </button>

          <button
            onClick={() => {
              setActiveTab('manual');
              setShowAddModal(true);
            }}
            className={`font-semibold text-xs px-3 py-2.5 rounded-xl border flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              isDark ? 'border-white/10 hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Plus className="w-4 h-4" /> Texto Manual
          </button>
        </div>
      </div>

      {/* Drag & Drop Quick Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            handleProcessFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
          isDragging
            ? 'border-purple-500 bg-purple-500/10'
            : isDark
            ? 'border-white/10 hover:border-purple-500/50 bg-[#0A0A0B]/60 hover:bg-[#0A0A0B]'
            : 'border-slate-300 hover:border-purple-500/50 bg-white hover:bg-slate-50'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleProcessFiles(e.target.files)}
          multiple
          accept=".pdf,.docx,.doc,.txt,.md,.csv,.json"
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <p className="text-xs font-semibold text-purple-400">{uploadProgress || 'Extraindo dados do documento...'}</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6 text-purple-400" />
            </div>
            <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Arraste e solte seus arquivos PDF ou Word (.docx) aqui
            </p>
            <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Suporta PDF, Word (.docx, .doc), TXT, Markdown e CSV • Processamento de texto automático
            </p>
          </>
        )}

        {uploadError && (
          <div className="mt-3 flex items-center gap-2 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar artigos, arquivos ou termos na base..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs ${
              isDark 
                ? 'bg-[#0A0A0B] text-white border-white/10 placeholder-slate-500' 
                : 'bg-white text-slate-900 border-slate-200 placeholder-slate-400'
            }`}
          />
        </div>

        <div className={`text-xs flex items-center gap-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <span><strong>{documents.length}</strong> documentos indexados</span>
          <span>•</span>
          <span><strong>{documents.reduce((acc, d) => acc + (d.tokens || 0), 0).toLocaleString()}</strong> tokens na memória RAG</span>
        </div>
      </div>

      {/* Grid of Knowledge Documents */}
      {filteredDocs.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-[#0A0A0B] border-white/5 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-semibold">Nenhum documento encontrado na base de conhecimento.</p>
          <p className="text-xs mt-1">Faça upload de um arquivo PDF/Word ou crie um artigo manual.</p>
        </div>
      ) : (
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
                  <div className="flex items-center gap-1.5">
                    {getBadgeIcon(doc.fileType)}
                    <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-semibold text-[10px] px-2 py-0.5 rounded">
                      {doc.category}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {doc.pages ? `${doc.pages} pág • ` : ''}~{doc.tokens} tokens
                  </span>
                </div>

                <h3 className={`font-bold text-sm mb-1 line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{doc.title}</h3>
                {doc.fileName && (
                  <p className={`text-[10px] font-mono mb-2 truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    📄 {doc.fileName} {doc.fileSize ? `(${doc.fileSize})` : ''}
                  </p>
                )}
                <p className={`text-xs line-clamp-3 mb-4 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {doc.content}
                </p>
              </div>

              <div className={`flex items-center justify-between pt-3 border-t text-[11px] ${
                isDark ? 'border-white/5 text-slate-500' : 'border-slate-100 text-slate-400'
              }`}>
                <span>Atualizado: {doc.updatedAt}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title="Visualizar texto completo"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors cursor-pointer"
                    title="Excluir documento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Document / Upload Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`p-6 rounded-2xl border max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 ${
            isDark ? 'bg-[#0A0A0B] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" /> Adicionar Conhecimento à IA
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

            {/* Modal Tabs */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <UploadCloud className="w-4 h-4" /> Upload de Arquivo (PDF / DOCX)
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 py-2 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'manual'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" /> Digitação Manual
              </button>
            </div>

            {activeTab === 'upload' ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className={`block font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Categoria para os Arquivos</label>
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
                    <option value="Documentos">Documentos</option>
                  </select>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDark ? 'border-white/15 hover:border-purple-500 bg-[#141417]' : 'border-slate-300 hover:border-purple-500 bg-slate-50'
                  }`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-7 h-7 text-purple-500 animate-spin" />
                      <span className="text-xs font-semibold">{uploadProgress}</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-purple-400 mb-2" />
                      <span className="font-bold text-xs">Clique para selecionar arquivos</span>
                      <span className="text-[11px] text-slate-400 mt-1">PDF (.pdf), Word (.docx, .doc), TXT ou Markdown</span>
                    </>
                  )}
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-500 bg-rose-500/10 p-2 rounded-lg">{uploadError}</p>
                )}
              </div>
            ) : (
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
                    onClick={handleManualSave}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer"
                  >
                    Salvar na Base de IA
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Document Details Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`p-6 rounded-2xl border max-w-2xl w-full max-h-[85vh] flex flex-col space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 ${
            isDark ? 'bg-[#0A0A0B] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                {getBadgeIcon(selectedDoc.fileType)}
                <div>
                  <h3 className="font-bold text-base line-clamp-1">{selectedDoc.title}</h3>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Categoria: {selectedDoc.category} • ~{selectedDoc.tokens} tokens {selectedDoc.pages ? `• ${selectedDoc.pages} páginas` : ''}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyContent(selectedDoc.content, selectedDoc.id)}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                    copiedId === selectedDoc.id
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : isDark ? 'border-white/10 hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                  title="Copiar texto"
                >
                  {copiedId === selectedDoc.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedId === selectedDoc.id ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <button 
                  onClick={() => setSelectedDoc(null)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 text-xs leading-relaxed font-sans">
              <div className={`p-4 rounded-xl border whitespace-pre-wrap font-mono text-[11px] select-text ${
                isDark ? 'bg-[#141417] border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                {selectedDoc.content}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t text-xs">
              <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {selectedDoc.fileName ? `Arquivo original: ${selectedDoc.fileName}` : 'Criado manualmente'}
              </span>
              <button
                onClick={() => setSelectedDoc(null)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

