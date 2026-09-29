# Vetrix Backend

Vetrix is a Node.js/Express backend for an AI-assisted Web3 transaction dashboard and chat agent.

## Features

- AI intent parsing with Gemini
- Multi-turn chat sessions
- Wallet balance and portfolio lookup
- ETH and ERC-20 transfer support
- Transaction safety confirmation flow
- Contact book and transaction memory
- Market price endpoint with caching
- Alchemy transaction-history integration
- Local JSON persistence for demo/college-project use
- Health and API endpoints

## Requirements

- Node.js 18+ (Node.js 20 LTS recommended)
- npm
- Gemini API key for AI chat
- Alchemy RPC URL for enhanced wallet history
- A dedicated Sepolia test wallet if autonomous transaction execution is enabled

## Installation

### Windows

1. Open this backend folder in Command Prompt or PowerShell.
2. Run:

```bash
npm install
```

3. Copy `.env.example` to `.env`.
4. Fill in the required values.
5. Start the server:

```bash
npm start
```

Or double-click `install.bat` once and then `start.bat`.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | No | API port. Defaults to `3001`. |
| `GEMINI_API_KEY` | For AI chat | Gemini API key. |
| `GEMINI_MODEL` | No | Preferred Gemini model. |
| `ALCHEMY_RPC_URL` | Recommended | Alchemy RPC endpoint for transaction history. |
| `BOT_PRIVATE_KEY` | Only for execution | Private key of a dedicated **Sepolia test wallet**. Never use a personal/mainnet wallet key. |
| `CORS_ORIGINS` | No | Comma-separated frontend origins. Defaults to common local Vite/React ports. |

## API endpoints

### Health

`GET /health`

Returns backend status and timestamp.

### Chat

`POST /api/chat`

Example body:

```json
{
  "message": "show my balance",
  "session_id": "demo-session-1",
  "wallet_address": "0xYourWalletAddress"
}
```

### Clear chat session

`POST /api/chat/clear`

```json
{
  "session_id": "demo-session-1"
}
```

### Portfolio

`GET /api/portfolio/:address?chain=sepolia`

### Wallet balance

`GET /api/wallet/balance/:address?chain=sepolia`

### Transaction history

`GET /api/wallet/history/:address`

### Market prices

`GET /api/market/prices`

## Project structure

The project intentionally keeps the JavaScript modules in one portable folder so it can be copied and run without a build step:

- `server.js` - Express application entry point
- `chatRoutes.js` - chat and portfolio routes
- `apiRoutes.js` - wallet and market routes
- `intentController.js` - intent routing and transaction flow
- `llmService.js` - Gemini intent parsing
- `portfolioService.js` - wallet balances
- `walletService.js` - test-wallet transaction execution
- `chainService.js` - supported networks
- `tokenService.js` - ERC-20 addresses and ABI
- `gasService.js` - gas estimation
- `contactService.js` - contact resolution
- `memoryService.js` - repeat-transaction memory
- `db.js` - local JSON persistence
- `sessionStore.js` - multi-turn in-memory sessions

## Safety notes

- Use a dedicated Sepolia test wallet for `BOT_PRIVATE_KEY`.
- Never commit `.env` or private keys to GitHub.
- Autonomous execution is disabled when `BOT_PRIVATE_KEY` is missing.
- The application asks for confirmation before the transfer execution step.
- Sepolia test ETH/tokens have no intended real-world value, but private keys must still be protected.

## Troubleshooting

### `Cannot find module './src/.../...'`

This project has been normalized to a single-folder structure. The current `server.js` uses the local route files directly.

### `npm.ps1 cannot be loaded`

Use Command Prompt and run `npm start`, or run PowerShell with an execution policy that permits npm scripts.

### Server starts but AI chat does not work

Check that `GEMINI_API_KEY` is present in `.env`. The server can still start without it, but AI intent parsing will use its safe fallback response.

### History is empty

Set `ALCHEMY_RPC_URL` to a valid Alchemy RPC endpoint. The history endpoint intentionally returns an empty list when the RPC URL is not configured.
