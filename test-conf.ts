import { processFlowIncomingMessage, setServerFlows } from './server/flowEngine.js';
import { INITIAL_FLOWS } from './src/data/initialData.js';

setServerFlows(INITIAL_FLOWS, 'flow-bancodeleite-01');
async function run() {
  const from = "5511999999999";
  let resp = await processFlowIncomingMessage(from, "Oi", () => null);
  console.log("BOT:", resp);
  
  resp = await processFlowIncomingMessage(from, "1", () => null);
  console.log("BOT:", resp);

  resp = await processFlowIncomingMessage(from, "Guinho Barros", () => null);
  console.log("BOT:", resp);

  resp = await processFlowIncomingMessage(from, "12/06/1989", () => null);
  console.log("BOT:", resp);
  
  resp = await processFlowIncomingMessage(from, "Rua do Trabalho", () => null);
  console.log("BOT:", resp);

  resp = await processFlowIncomingMessage(from, "123", () => null);
  console.log("BOT:", resp);

  resp = await processFlowIncomingMessage(from, "Centro", () => null);
  console.log("BOT:", resp);
  
  resp = await processFlowIncomingMessage(from, "Perto da padaria", () => null);
  console.log("BOT:", resp);
  
  resp = await processFlowIncomingMessage(from, "14/08/2026", () => null);
  console.log("BOT:", resp);
  
  resp = await processFlowIncomingMessage(from, "Santa Mônica", () => null);
  console.log("BOT:", resp);

  resp = await processFlowIncomingMessage(from, "1", () => null);
  console.log("BOT:", resp);
}
run();
