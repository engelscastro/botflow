const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldMain = `<main className={\`flex-1 flex flex-col overflow-hidden transition-colors duration-200 \${
          theme === 'dark' ? 'bg-[#050505]' : 'bg-slate-50'
        }\`}>
          {activeSection === 'builder' && (
            <FlowCanvas
              flows={flows}
              activeFlowId={activeFlowId}
              onSelectFlow={setActiveFlowId}
              onSaveFlow={handleSaveFlow}
              onCreateNewFlow={handleCreateNewFlow}
              onImportFlow={handleImportFlow}
              theme={theme}
            />
          )}

          {activeSection === 'inbox' && (
            <CentralInbox
              contacts={contacts}
              conversations={conversations}
              flows={flows}
              onSendMessage={handleSendMessage}
              onToggleBotActive={handleToggleBotActive}
              onTriggerFlow={handleTriggerFlow}
              theme={theme}
            />
          )}

          {activeSection === 'broadcast' && (
            <div className="flex-1 overflow-y-auto">
              <BroadcastManager
                channels={channels}
                onNavigateToChannels={() => setActiveSection('channels')}
                theme={theme}
              />
            </div>
          )}

          {activeSection === 'channels' && (
            <ChannelsManager
              channels={channels}
              onToggleChannelConnect={handleToggleChannelConnect}
              onSetChannelConnected={handleSetChannelConnected}
              theme={theme}
            />
          )}

          {activeSection === 'ai' && (
            <AIEngineConfig
              config={aiConfig}
              onUpdateConfig={handleUpdateAiConfig}
              theme={theme}
            />
          )}

          {activeSection === 'knowledge' && (
            <KnowledgeBaseManager
              documents={documents}
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDocument}
              theme={theme}
            />
          )}

          {activeSection === 'analytics' && (
            <AnalyticsDashboard
              analytics={analytics}
              theme={theme}
            />
          )}
        </main>`;

const newMain = `<main className={\`flex-1 flex flex-col overflow-hidden transition-colors duration-200 \${
          theme === 'dark' ? 'bg-[#050505]' : 'bg-slate-50'
        }\`}>
          <div className={activeSection === 'builder' ? 'flex-1 flex flex-col overflow-hidden' : 'hidden'}>
            <FlowCanvas
              flows={flows}
              activeFlowId={activeFlowId}
              onSelectFlow={setActiveFlowId}
              onSaveFlow={handleSaveFlow}
              onCreateNewFlow={handleCreateNewFlow}
              onImportFlow={handleImportFlow}
              theme={theme}
            />
          </div>

          <div className={activeSection === 'inbox' ? 'flex-1 flex flex-col overflow-hidden' : 'hidden'}>
            <CentralInbox
              contacts={contacts}
              conversations={conversations}
              flows={flows}
              onSendMessage={handleSendMessage}
              onToggleBotActive={handleToggleBotActive}
              onTriggerFlow={handleTriggerFlow}
              theme={theme}
            />
          </div>

          <div className={activeSection === 'broadcast' ? 'flex-1 overflow-y-auto' : 'hidden'}>
            <BroadcastManager
              channels={channels}
              onNavigateToChannels={() => setActiveSection('channels')}
              theme={theme}
            />
          </div>

          <div className={activeSection === 'channels' ? 'flex-1 overflow-y-auto' : 'hidden'}>
            <ChannelsManager
              channels={channels}
              onToggleChannelConnect={handleToggleChannelConnect}
              onSetChannelConnected={handleSetChannelConnected}
              theme={theme}
            />
          </div>

          <div className={activeSection === 'ai' ? 'flex-1 overflow-y-auto' : 'hidden'}>
            <AIEngineConfig
              config={aiConfig}
              onUpdateConfig={handleUpdateAiConfig}
              theme={theme}
            />
          </div>

          <div className={activeSection === 'knowledge' ? 'flex-1 overflow-y-auto' : 'hidden'}>
            <KnowledgeBaseManager
              documents={documents}
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDocument}
              theme={theme}
            />
          </div>

          <div className={activeSection === 'analytics' ? 'flex-1 overflow-y-auto' : 'hidden'}>
            <AnalyticsDashboard
              analytics={analytics}
              theme={theme}
            />
          </div>
        </main>`;

if(content.includes('activeSection === \'builder\' &&')) {
  content = content.replace(oldMain, newMain);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Updated main tabs successfully");
} else {
  console.log("Could not find the old main block");
}
