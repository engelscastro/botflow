import { processFlowIncomingMessage, setServerFlows } from './server/flowEngine.js';
import { INITIAL_FLOWS } from './src/data/initialData.js';

setServerFlows(INITIAL_FLOWS, 'flow-bancodeleite-01');
async function run() {
  const from = "5511999999999";
  let resp = await processFlowIncomingMessage(from, "Oi", () => null);
  console.log("BOT:", resp);
  
  resp = await processFlowIncomingMessage(from, "2", () => null);
  console.log("BOT:", resp);

  resp = await processFlowIncomingMessage(from, "2", () => null);
  console.log("BOT:", resp);

  resp = await processFlowIncomingMessage(from, "5 potes", () => null);
  console.log("BOT:", resp);
}
run();
