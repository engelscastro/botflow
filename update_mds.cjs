const fs = require('fs');

// 1. Update DOCUMENTACAO_TECNICA.md
let docTech = fs.readFileSync('DOCUMENTACAO_TECNICA.md', 'utf-8');

const newModules = `
### 3.8. CRM & Contatos (\`CRMManager\`)
*   **Gestão de Leads:** Módulo para visualização de todos os contatos salvos no banco de dados.
*   **Filtros:** Busca inteligente por nome, telefone e listagem de data de cadastro.
*   **Integração com Fluxo:** Leads são criados automaticamente a partir do bloco "Cadastro CRM DB" durante as interações do robô.

### 3.9. Agenda & Reservas (\`ScheduleManager\`)
*   **Visualização de Compromissos:** Painel visual com os compromissos agendados pelo robô.
*   **Status do Agendamento:** Identificação de status (Agendado, Concluído, Cancelado).
*   **Integração com Fluxo:** Alimentado de forma automática via o bloco "Agendamento Interno".
`;

// Insert after Analytics Dashboard (3.7) or before section 4
docTech = docTech.replace('## 📂 4. Estrutura do Projeto', newModules + '\n## 📂 4. Estrutura do Projeto');

// Update project structure
const newStructure = `
├── /data/                     # (NOVO) Banco de dados JSON local (contacts.json, appointments.json)
├── /server/
│   ├── db.ts                  # (NOVO) Motor de persistência de dados local (JsonDB)
`;
docTech = docTech.replace('├── /server/', newStructure.trim());

fs.writeFileSync('DOCUMENTACAO_TECNICA.md', docTech);

// 2. Update MANUAL_DO_USUARIO.md
let userMan = fs.readFileSync('MANUAL_DO_USUARIO.md', 'utf-8');
const manualNewFeatures = `
---

## 📇 CRM e Agenda (Novidade)

O BotFlow agora possui ferramentas nativas para salvar e organizar clientes e reuniões.

**Como usar o CRM:**
1. Na aba **Construtor de Fluxos**, faça perguntas usando o bloco de **Pergunta & Captura** para obter dados (salve a resposta nas variáveis \`nome\`, \`cpf\`, etc).
2. Adicione o bloco **Cadastro CRM DB** e conecte-o logo após as perguntas. Configure para "Salvar Dados".
3. Quando o cliente interagir, ele aparecerá automaticamente na nova aba **CRM & Contatos** do painel esquerdo.

**Como usar a Agenda:**
1. Da mesma forma, colete a variável \`data\` ou pergunte o horário preferido.
2. Adicione o bloco **Agenda Interna** no fluxo, coloque o nome do serviço (ex: Reunião Comercial).
3. Os agendamentos aparecerão na aba **Agenda & Reservas**.

---

## 📎 Envio de Anexos em Massa (Broadcast)

Na aba **Disparos em Massa**, você agora tem suporte para enviar fotos, vídeos ou PDFs.
- Clique no botão **"Escolher Arquivo"** na seção "Anexar Mídia (Opcional)".
- O limite máximo seguro é de **16MB** por arquivo.
- O anexo será embutido diretamente na bolha da mensagem enviada para o WhatsApp do seu lead, e você pode pré-visualizar no mockup do celular do lado direito.
`;

userMan = userMan.replace('## 💬 Construtor de Fluxos (Flow Builder)', manualNewFeatures + '\n## 💬 Construtor de Fluxos (Flow Builder)');

fs.writeFileSync('MANUAL_DO_USUARIO.md', userMan);

console.log("Docs updated.");
