import { ethers } from 'ethers';

export const formatTransactionAmount = (amount, fractionDigits = 4) =>
  Number.parseFloat(String(amount)).toFixed(fractionDigits);

export const isValidEthereumAddress = (address) => {
  if (typeof address !== 'string' || !address) return false;
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

const transactionStatusLabels = {
  signing: 'Awaiting Signature',
  broadcasting: 'Broadcasting',
  confirming: 'Confirming',
  confirmed: 'Confirmed',
  pending: 'Pending',
  submitted: 'Pending',
  success: 'Completed',
  successful: 'Completed',
  completed: 'Completed',
  failed: 'Failed',
  error: 'Failed',
  idle: 'Idle',
};

export const formatTransactionStatus = (status) => {
  const normalizedStatus = String(status ?? '').trim().toLowerCase();
  return transactionStatusLabels[normalizedStatus]
    ?? normalizedStatus.replace(/\b\w/g, character => character.toUpperCase());
};

export const generateShortTransactionId = (transactionId, prefixLength = 8, suffixLength = 6) => {
  if (transactionId == null) return '';
  const id = String(transactionId);
  if (id.length <= prefixLength + suffixLength) return id;
  return `${id.slice(0, prefixLength)}...${suffixLength ? id.slice(-suffixLength) : ''}`;
};