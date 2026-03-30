// backend/src/controllers/intentController.js — V2 MODIFIED
// Core change: transfer handler now calls walletService.executeTransaction()
// instead of returning a confirm payload to the frontend.

const { parseUserIntent } = require('../services/llmService');
const { getSession, updateSession, clearSession } = require('../utils/sessionStore');
const { getBalances } = require('../services/portfolioService');
const { estimateGas } = require('../services/gasService');
const { isValidAddress, isValidAmount } = require('../services/web3Service');
const { getTokenAddress, getTokenDecimals } = require('../services/tokenService');
const { getChainConfig } = require('../services/chainService');
const { executeTransaction } = require('../services/walletService'); // V2 NEW

/**
 * Main chat handler — processes user message, parses intent, manages session,
 * and returns follow-up question, execution result, or error.
 */
const handleChat = async (req, res) => {
  try {
    const { message, session_id, wallet_address } = req.body;

    // Input validation
    if (!message || !session_id) {
      return res.json({
        next_step: 'error',
        message: 'Missing required fields: message and session_id are required.',
      });
    }

    // Get current session state
    const currentSession = getSession(session_id);

    // Parse user intent via Gemini + Zod
    const intent = await parseUserIntent(message, currentSession);

    // Merge parsed fields into session
    const updatedSession = updateSession(session_id, intent);

    // Route based on action
    switch (updatedSession.action) {
      case 'balance':
        return await handleBalance(res, wallet_address, updatedSession);

      case 'transfer':
        return await handleTransfer(res, wallet_address, updatedSession, session_id);

      case 'swap':
        return handleSwap(res, updatedSession);

      case 'explanation':
        return res.json({
          next_step: 'ask_user',
          message: intent.human_readable_summary || 'I can help explain blockchain concepts. What would you like to know?',
        });

      case 'unknown':
      default:
        return res.json({
          next_step: 'ask_user',
          message: intent.human_readable_summary || "Hello! I'm Aura, your Web3 assistant. I can help you send tokens, check balances, or explain blockchain concepts. What would you like to do?",
        });
    }
  } catch (error) {
    console.error('Intent controller error:', error.message);
    return res.json({
      next_step: 'error',
      message: 'An internal error occurred. Please try again.',
    });
  }
};

/**
 * Handle balance/portfolio queries — unchanged from V1
 */
const handleBalance = async (res, walletAddress, session) => {
  if (!walletAddress) {
    return res.json({
      next_step: 'ask_user',
      message: 'Please connect your MetaMask wallet first so I can check your balance.',
    });
  }

  try {
    const portfolio = await getBalances(walletAddress, session.chain || 'sepolia');

    if (portfolio.error) {
      return res.json({
        next_step: 'error',
        message: `Unable to fetch balances: ${portfolio.error}`,
      });
    }

    // Format balance message
    const balanceLines = portfolio.balances.map(b =>
      `• ${b.asset}: ${b.amount}`
    ).join('\n');

    const message = `Here are your balances on ${portfolio.chain}:\n\n${balanceLines}`;

    return res.json({
      next_step: 'ask_user',
      message,
      data: {
        action: 'balance',
        chain: session.chain || 'sepolia',
        balances: portfolio.balances,
        confidence: session.confidence,
      },
    });
  } catch (error) {
    console.error('Balance fetch error:', error.message);
    return res.json({
      next_step: 'error',
      message: 'Unable to connect to the network. Please try again.',
    });
  }
};

/**
 * Handle transfer intents — V2 MODIFIED
 * Gap filling is identical to V1.
 * Once all fields are complete: EXECUTES the transaction server-side via walletService.
 */
const handleTransfer = async (res, walletAddress, session, sessionId) => {
  // Gap filling — check for missing required fields (unchanged from V1)
  const missingFields = [];

  if (!session.asset) {
    missingFields.push('asset');
  }
  if (!session.amount) {
    missingFields.push('amount');
  }
  if (!session.to_address) {
    missingFields.push('to_address');
  }

  // Ask for missing fields one at a time
  if (missingFields.length > 0) {
    const field = missingFields[0];
    const questions = {
      asset: 'Which token would you like to send? (ETH, USDC, USDT, or DAI)',
      amount: `How much ${session.asset || 'tokens'} would you like to send?`,
      to_address: 'What is the recipient wallet address? (0x...)',
    };

    return res.json({
      next_step: 'ask_user',
      message: questions[field],
      data: {
        action: 'transfer',
        missing_field: field,
        confidence: session.confidence,
        partial_intent: {
          asset: session.asset,
          amount: session.amount,
          to_address: session.to_address,
          chain: session.chain || 'sepolia',
        },
      },
    });
  }

  // Validate address
  if (!isValidAddress(session.to_address)) {
    return res.json({
      next_step: 'error',
      message: `The recipient address "${session.to_address}" is not a valid Ethereum address. Please provide a valid 0x... address.`,
    });
  }

  // Validate amount
  if (!isValidAmount(session.amount)) {
    return res.json({
      next_step: 'error',
      message: 'The amount provided is invalid. Please enter a positive number.',
    });
  }

  // Default chain to sepolia
  if (!session.chain) {
    session.chain = 'sepolia';
  }

  const chainConfig = getChainConfig(session.chain);

  // Estimate gas (for logging/display — bot pays gas from its own wallet)
  let gasEstimate = null;
  try {
    gasEstimate = await estimateGas(
      session.chain,
      'transfer',
      session.asset,
      session.amount,
      session.to_address,
      walletAddress
    );
  } catch (e) {
    console.error('Gas estimation failed:', e.message);
    gasEstimate = {
      gasLimit: '65000',
      gasPrice: '20 Gwei',
      estimatedCostEth: '0.00130000',
      estimatedCostUsd: '3.2500',
    };
  }

  // ── V2: EXECUTE TRANSACTION DIRECTLY ─────────────────────────
  // Instead of returning a confirm payload, we sign and broadcast now.
  try {
    const result = await executeTransaction(session);

    // Clear session after successful tx
    clearSession(sessionId);

    const summary = session.asset === 'ETH'
      ? `${session.amount} ETH`
      : `${session.amount} ${session.asset}`;

    return res.json({
      next_step: 'done',
      message: `✅ Transaction confirmed! I sent ${summary} to ${session.to_address} on ${chainConfig.name}.\n\nTransaction Hash: ${result.txHash}\nEstimated Gas: ${gasEstimate.estimatedCostEth} ETH`,
      txHash: result.txHash,
      explorer: result.explorer,
      data: {
        action: 'transfer',
        chain: session.chain,
        asset: session.asset,
        amount: session.amount,
        to_address: session.to_address,
        txHash: result.txHash,
        explorer: result.explorer,
        gasEstimate: gasEstimate.estimatedCostEth,
        gasPriceGwei: gasEstimate.gasPrice,
        confidence: session.confidence,
        risk_flags: session.risk_flags || [],
      },
    });
  } catch (execError) {
    console.error('Transaction execution error:', execError.message);

    // Provide user-friendly error messages
    let errorMsg = `Transaction failed: ${execError.message}`;
    if (execError.message.includes('insufficient funds')) {
      errorMsg = 'Transaction failed: The bot wallet has insufficient Sepolia ETH to cover the amount plus gas fees. Please fund the bot wallet.';
    } else if (execError.message.includes('nonce')) {
      errorMsg = 'Transaction failed: Nonce conflict. Please try again in a moment.';
    } else if (execError.message.includes('network')) {
      errorMsg = 'Transaction failed: Unable to connect to the network. Please try again.';
    }

    return res.json({
      next_step: 'error',
      message: errorMsg,
    });
  }
};

/**
 * Handle swap intents (mocked for demo — documented as future work) — unchanged from V1
 */
const handleSwap = (res, session) => {
  const swap = session.swap;

  if (!swap || !swap.from || !swap.to) {
    return res.json({
      next_step: 'ask_user',
      message: 'Token swaps are planned for a future release. Currently, I can help you with transfers and balance checks. Would you like to do something else?',
    });
  }

  return res.json({
    next_step: 'ask_user',
    message: `Token swap (${swap.from} → ${swap.to}) is a planned feature and will be available in a future update. For now, I can help you send tokens or check your balance.`,
    data: {
      action: 'swap',
      swap: swap,
      confidence: session.confidence,
      status: 'planned_feature',
    },
  });
};

module.exports = { handleChat };
