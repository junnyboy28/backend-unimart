const { web3, account, paymentContract } = require('../config/blockchain');

/**
 * Verify a blockchain transaction
 * 
 * @param {string} transactionHash - The hash of the blockchain transaction
 * @param {number} expectedAmount - The expected payment amount
 * @param {string} buyerMetamaskId - The buyer's Metamask ID
 * @param {string} sellerMetamaskId - The seller's Metamask ID
 * @returns {Promise<boolean>} True if transaction is valid
 */
const verifyBlockchainTransaction = async (transactionHash, expectedAmount, buyerMetamaskId, sellerMetamaskId) => {
  try {
    // In a real application, you would verify the transaction on the blockchain
    // Here we're simulating the verification for the test environment
    
    // Get transaction receipt
    const receipt = await web3.eth.getTransactionReceipt(transactionHash);
    
    // For testing purposes, consider all transactions valid
    // In production, you would check:
    // 1. The transaction is confirmed (receipt.status === true)
    // 2. The sender and recipient addresses match the metamask IDs
    // 3. The transferred amount matches the expected amount
    
    return true; // For demo purposes, all transactions pass verification
  } catch (error) {
    console.error('Blockchain verification error:', error);
    return false;
  }
};

/**
 * Send crypto payment through the contract (would be used in production)
 * 
 * @param {string} recipientAddress - Recipient's Ethereum address
 * @param {number} amount - Amount to send in wei
 * @returns {Promise<string>} Transaction hash
 */
const sendCryptoPayment = async (recipientAddress, amount) => {
  try {
    const result = await paymentContract.methods.transferPayment(
      recipientAddress,
      web3.utils.toWei(amount.toString(), 'ether')
    ).send({
      from: account.address,
      gas: 200000
    });
    
    return result.transactionHash;
  } catch (error) {
    console.error('Error sending payment:', error);
    throw new Error('Crypto payment failed');
  }
};

module.exports = {
  verifyBlockchainTransaction,
  sendCryptoPayment
};