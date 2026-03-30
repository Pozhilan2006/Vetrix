# 🤖 Aura V2.1 — Research-Grade Autonomous Web3 Prototype

![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green?logo=nodedotjs)
![Ethers.js](https://img.shields.io/badge/Ethers.js-v6-purple)
![Gemini AI](https://img.shields.io/badge/Gemini-2.0_Flash-orange)

**Aura V2** is an advanced autonomous Web3 assistant built as a Final Year Project constraint. Unlike standard dApps where users must manually click through MetaMask popups to sign transactions, **Aura handles execution entirely on the server via a dedicated "burner wallet"**.

You just type naturally. Aura understands your intent, requests missing details, verifies balances, and autonomously executes blockchain transactions on your behalf.

<p align="center">
  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHUyNWFwcWh4N2dudDhmMnVyOHcxdjYzemF5ZTh2bTI0aDhlYXF1NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L1R1tvI9svkIWwpVYr/giphy.gif" alt="Aura Banner" width="400"/>
</p>

## ✨ Key Features

- 🧠 **Context Intelligence Layer:** Aura converts human-native names (e.g., "John") and fiat-native values (e.g., "$10 worth") into precise blockchain parameters via a local persistent identity store and **CoinGecko** price feeds.
- 🔄 **Transaction Context Recall:** Remembers your history. "Send the same as last time" autonomously pre-fills recipients and amounts from the audit log.
- 📇 **Persistent Contact Book:** Zero-Setup local database managing custom name-to-address mappings for a friction-less experience.
- 🤖 **Fast-Broadcast Autonomy:** Refactored execution model broadcasts transactions in **<2 seconds**, providing instant "Pending" UI feedback while confirming in the background.
- 🛡️ **Decision Engine & Safety Guard:** A deterministic multi-factor controller that enforces `min(0.1 ETH, 80% balance)` safety thresholds and protects gas reserves.
- 📜 **Verifiable Execution Model:** Maps natural language intent directly to on-chain `txHash` in a persistent audit trail.

## 🏗️ Version 2 Architecture Transition

In V1 (Non-Custodial), the bot was simply an intent parser that prepared transaction payloads for the user to manually sign in their browser extension. 

In **V2 (Autonomous Agent)**, the architecture shifts execution logic to the backend:
1. **User Types:** "Send 0.05 Sepolia ETH to Vitalik."
2. **AI Parses:** Gemini extracts the exact parameters and Zod validates them.
3. **Execution:** The backend uses the `walletService.js` to sign the transaction with the `BOT_PRIVATE_KEY` stored securely in the `.env`.
4. **Confirmation:** The user receives a clickable Etherscan hash back directly in the chat interface.

---

## 🛠️ Tech Stack

### Frontend (User Interface)
- **Framework:** Next.js (App Router), React 19
- **Styling:** Tailwind CSS V4, Framer Motion
- **Web3 Integration:** `ethers.js` (BrowserProvider) 

### Backend (Agent Brain & Context)
- **Server:** Node.js, Express.js
- **Intelligence:** `@google/generative-ai` (Gemini SDK)
- **Data Layer:** Lightweight Edge-Persistence (JSON-based audit & contact store)
- **Pricing:** **CoinGecko API** for real-time USD conversion
- **Web3 Engine:** `ethers.js` (V6) for server-side signing and broadcast
- **Validation:** `zod` for strict intent schema enforcement

---

## 🚀 Getting Started

### Prerequisites

You need [Node.js](https://nodejs.org/en/) installed and an Alchemy API Key.

### 1. Environment Variables Setup

You must create two `.env` files. 

**Backend (`backend/.env`):**
```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
PORT=3001
ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
BOT_PRIVATE_KEY=your_burner_wallet_private_key
```
> **Note:** The `BOT_PRIVATE_KEY` must have real Sepolia ETH to pay for transaction gas! Use a free Sepolia Faucet to fund it.

**Frontend (`frontend/.env`):**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/chat
```

### 2. Installation & Running

Open two separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to interact with Aura!

---

## ⚠️ Technical Limitations & Academic Notice

**IMPORTANT:** This system is a **Research-Grade Autonomous Prototype** developed as part of a Final Year Project for Rathinam College of Arts and Science | Bharathiar University. 

### Core Limitations
- **Burner Wallet Risk:** The system uses a "Burner Wallet" pattern. The private key resides on the backend server. **Do NOT use with significant real assets.**
- **Centralized Dependencies:** Real-time information relies on external APIs (Gemini, CoinGecko, Alchemy). Failure of these services will degrade system functionality.
- **Single-User Architecture:** This prototype currently lacks a robust multi-user authentication layer.
- **Asynchronous Confirmation:** Transaction confirmation is handled asynchronously; real-time block-status polling is out of scope for this version.

### Future Work
- Implementation of MPC (Multi-Party Computation) for secure key management.
- Integration of local Lightweight LLMs to remove external API dependency.
- On-chain intent verification via smart contract event logs.

<p align="center">Made with ❤️ for the Web3 Ecosystem</p>
