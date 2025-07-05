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

// Re-export config for easy access
export { default as contractConfig } from "./config.json"
