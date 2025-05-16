const { Web3 } = require('web3');

// Connect to Ethereum network using the provided RPC endpoint
const web3 = new Web3(process.env.ETHEREUM_SEPOLIA_RPC);

// Make sure private key has 0x prefix
const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY.startsWith('0x') 
  ? process.env.BLOCKCHAIN_PRIVATE_KEY 
  : `0x${process.env.BLOCKCHAIN_PRIVATE_KEY}`;

// Create account from private key for transactions
const account = web3.eth.accounts.privateKeyToAccount(privateKey);

// Add account to wallet
web3.eth.accounts.wallet.add(account);

// Payment contract ABI (simplified for testing purposes)
const paymentContractABI = [
  {
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transferPayment',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// Contract instance
const paymentContract = new web3.eth.Contract(
  paymentContractABI,
  process.env.PAYMENT_CONTRACT_ADDRESS
);

module.exports = {
  web3,
  account,
  paymentContract,
};