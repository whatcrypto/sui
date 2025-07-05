import { clientTransactions } from "./client-transactions.js"
import { ContractQueries } from "./queries.js"

// Initialize the queries instance
let contractQueries

// Lazy initialization to avoid circular imports
const getContractQueries = () => {
  if (!contractQueries) {
    contractQueries = new ContractQueries()
  }
  return contractQueries
}

/**
 * High-level utility functions that combine transactions and queries
 * These are the functions you'll import and use in your components
 */

export const createItem = async (name, description, price) => {
  return clientTransactions.createItem(name, description, price)
}

export const getAllItems = async () => {
  const queries = getContractQueries()
  const items = await queries.getAllItems()
  return items
}

export const getItemInfo = async (itemId) => {
  const queries = getContractQueries()
  return await queries.getItemInfo(itemId)
}

export const purchaseItem = async (itemId, amount) => {
  return clientTransactions.purchaseItem(itemId, amount)
}

export const isItemOwner = async (itemId, address) => {
  const queries = getContractQueries()
  return await queries.isOwner(itemId, address)
}

export const updateItem = async (itemId, newPrice) => {
  return clientTransactions.updateItem(itemId, newPrice)
}

/**
 * Add more utility functions that combine your transactions and queries
 */
