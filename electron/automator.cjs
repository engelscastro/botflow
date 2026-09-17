const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let waWindow = null;
let isCampaignRunning = false;
let campaignQueue = [];
let campaignMessage = '';
let minD = 5;
let maxD = 10;
let mainWindowRef = null;

function setMainWindow(win) {
  mainWindowRef = win;
}

function sendLog(msg, type = 'info') {
  if (mainWindowRef) {
    mainWindowRef.webContents.send('automator-log', { msg, type });
  }
}

function createWaWindow() {
  if (waWindow) {
    waWindow.show();
    return;
  }
  
  waWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'BotFlow - Automação Fantasma',
    webPreferences: {
      partition: 'persist:wa-automator',
      nodeIntegration: false,
      contextIsolation: true
    },
    show: true
  });
  
  waWindow.setMenuBarVisibility(false);
  
  // Disfarçar o Electron como um Google Chrome moderno para o WhatsApp não bloquear
  waWindow.webContents.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
  
  waWindow.loadURL('https://web.whatsapp.com');
  
  waWindow.on('closed', () => {
    waWindow = null;
    isCampaignRunning = false;
  });
}

async function startCampaign(numbers, message, minDelay, maxDelay) {
  if (!waWindow) {
    createWaWindow();
  }
  
  campaignQueue = [...numbers];
  campaignMessage = message;
  minD = minDelay;
  maxD = maxDelay;
  isCampaignRunning = true;
  
  sendLog('Campanha fantasma iniciada. Certifique-se de que o WhatsApp Web está conectado.', 'info');
  processNext();
}

async function processNext() {
  if (!isCampaignRunning) return;
  if (campaignQueue.length === 0) {
    sendLog('Campanha fantasma finalizada com sucesso!', 'success');
    isCampaignRunning = false;
    return;
  }
  
  const phone = campaignQueue.shift();
  sendLog(`Iniciando envio para ${phone}...`, 'info');
  
  const encodedMessage = encodeURIComponent(campaignMessage);
  const waUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
  
  waWindow.loadURL(waUrl);
  
  // Esperar carregar e enviar
  waWindow.webContents.once('did-finish-load', () => {
    // Injetar script que espera o botão de enviar aparecer e garante o foco
    const injectScript = `
      (function() {
        return new Promise((resolve, reject) => {
          let attempts = 0;
          const checkExist = setInterval(function() {
            attempts++;
            
            // Procura o botão de enviar na interface
            const mainEl = document.querySelector('#main');
            if (mainEl) {
              const sendIcon = document.querySelector('span[data-icon="send"]');
              const sendBtnAria = document.querySelector('button[aria-label="Enviar"]') || document.querySelector('button[aria-label="Send"]');
              const target = (sendIcon ? (sendIcon.closest('button') || sendIcon) : null) || sendBtnAria;
              
              if (target) {
                 clearInterval(checkExist);
                 // Tenta focar na caixa de texto para garantir que o Enter funcione
                 const textBox = mainEl.querySelector('div[contenteditable="true"][data-tab="10"]') || mainEl.querySelector('div[contenteditable="true"]');
                 if (textBox) {
                   textBox.focus();
                 }
                 resolve({ status: 'READY_TO_ENTER' });
                 return;
              }
            }
            
            if (attempts > 60) { // 30 segundos
              clearInterval(checkExist);
              resolve({ status: 'TIMEOUT' });
            }
          }, 500);
        });
      })();
    `;
    
    waWindow.webContents.executeJavaScript(injectScript).then((res) => {
      if (!isCampaignRunning) return;
      
      if (res.status === 'READY_TO_ENTER') {
        sendLog(`Botão de envio e caixa de texto localizados. Disparando tecla Enter nativa...`, 'info');
        
        // Dispara a tecla Enter em nível de SO (Foca no input e manda Enter)
        waWindow.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'Enter' });
        waWindow.webContents.sendInputEvent({ type: 'char', keyCode: 'Enter' });
        waWindow.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'Enter' });
        
        setTimeout(() => {
          sendLog(`Mensagem disparada com sucesso para ${phone}.`, 'success');
          
          if (!isCampaignRunning) return;
          const delay = Math.floor(Math.random() * (maxD - minD + 1)) + minD;
          sendLog(`Aguardando ${delay}s de intervalo fantasma...`, 'info');
          setTimeout(processNext, delay * 1000);
        }, 500);
        
      } else {
        sendLog(`Timeout ao aguardar botão de envio para ${phone}.`, 'error');
        setTimeout(processNext, 5000);
      }
    }).catch(err => {
      sendLog(`Erro ao executar clique para ${phone}: ${err.message}`, 'error');
      if (!isCampaignRunning) return;
      setTimeout(processNext, 5000);
    });
  });
}

function stopCampaign() {
  isCampaignRunning = false;
  sendLog('Campanha parada pelo usuário.', 'info');
}

module.exports = {
  setMainWindow,
  createWaWindow,
  startCampaign,
  stopCampaign
};
