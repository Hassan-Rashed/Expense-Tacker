# Expense Tracker (Angular 21)

## Run it
1. Unzip, then from the project root run `npm install`.
2. Install json-server once: `npm install -g json-server@0.17.4`
   (0.17.x gives numeric ids; newer versions use string ids, which this code also handles.)
3. Terminal 1 (API): `json-server --watch db.json --port 3000`
4. Terminal 2 (app): `ng serve`
5. Open http://localhost:4200

## Chatbot
`src/app/services/ai-chatbot.service.ts` has an `agentUrl`. Leave it empty to use the built-in
local assistant, or set it to your AI agent endpoint (POST `{message, expenses}` -> `{reply}`).
