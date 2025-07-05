/**
 * Main export file for smart contract integration
 * Import everything you need from here
 */

export { clientTransactions } from "./client-transactions.js"
export { ContractQueries } from "./queries.js"
export {
  createItem,
  getAllItems,
  getItemInfo,
  purchaseItem,
  isItemOwner,
  updateItem,
} from "./utils.js"

// Export sweepstakes functionality
export {
  createSweepstakes,
  enterSweepstakes,
  selectWinner,
  submitProofOfDelivery,
  getActiveSweepstakes,
  getHostSweepstakes,
  getParticipantEntries,
  hasEnteredSweepstakes,
  getSweepstakesInfo,
  formatSweepAmount,
  formatUsdAmount,
  formatTimestamp,
  getSweepstakesStatus
} from "./sweepstakes"

export * from "./types"

// Re-export config for easy access
export { default as contractConfig } from "./config.json"
