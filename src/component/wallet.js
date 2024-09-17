// Remove this if you want to use it in simple react app sheikh
'use client';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [history, setHistory] = useState([]);
  const [transactionHash, setTransactionHash] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false); // General loading state
  const [isSending, setIsSending] = useState(false); // Loading state for sending transactions
  const [isBalanceUpdating, setIsBalanceUpdating] = useState(false); // Loading state for updating balance

  useEffect(() => {
    const localProvider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    setProvider(localProvider);

    if (wallet) {
      fetchBalance(wallet.address);
      fetchTransactionHistory(wallet.address);
    }
  }, [wallet]);

  const createWallet = () => {
    setIsLoading(true);
    const localWallet = new ethers.Wallet(
      '0x50e6e932a867e105631bd6803cf3f06b06eac976749f297bae46ac811d8c4c5d',
      provider
    );
    setWallet(localWallet);
    setHistory([]);
    setBalance(0);
    setIsLoading(false);
  };

  const fetchTransactionHistory = async (address) => {
    if (!provider) return;

    const blockNumber = await provider.getBlockNumber();
    const history = [];

    for (let i = blockNumber; i >= Math.max(blockNumber - 1000, 0); i--) {
      const block = await provider.getBlock(i);

      if (block && block.transactions) {
        for (const txHash of block.transactions) {
          const tx = await provider.getTransaction(txHash);

          if (tx && (tx.to === address || tx.from === address)) {
            const direction = tx.to === address ? 'Received' : 'Sent';
            history.push({
              type: direction,
              amount: ethers.formatEther(tx.value),
              date: new Date(block.timestamp * 1000).toISOString(),
              hash: tx.hash,
            });
          }
        }
      }
    }

    setHistory(history);
  };

  const fetchBalance = async (address) => {
    if (provider) {
      setIsBalanceUpdating(true); // Start loading
      const balanceInWei = await provider.getBalance(address);
      const balanceInEth = ethers.formatEther(balanceInWei);
      setBalance(balanceInEth);
      setIsBalanceUpdating(false); // End loading
    }
  };

  const sendTransaction = async () => {
    if (!wallet || !provider || !receiverAddress || !amount) return;

    const tx = {
      to: receiverAddress,
      value: ethers.parseEther(amount),
    };

    setIsSending(true);
    try {
      const signer = wallet.connect(provider);
      const txResponse = await signer.sendTransaction(tx);
      setTransactionHash(txResponse.hash);

      await txResponse.wait();
      fetchBalance(wallet.address);

      setHistory([
        ...history,
        {
          type: 'Sent',
          amount: parseFloat(amount),
          date: new Date().toISOString(),
          hash: txResponse.hash,
        },
      ]);
      setAmount('');
    } catch (error) {
      console.error('Transaction failed:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="p-6 max-w-lg w-full bg-white rounded-xl shadow-md space-y-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Cryptocurrency Wallet</h1>
        {!wallet ? (
          <button
            onClick={createWallet}
            className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Wallet...' : 'Create Wallet'}
          </button>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Wallet Address</h2>
            <p className="text-gray-700 break-words">{wallet.address}</p>
            <h2 className="text-xl font-semibold">Balance</h2>
            <p className="text-gray-700">{balance} ETH</p>
            <button
              onClick={() => fetchBalance(wallet.address)}
              className={`w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 ${
                isBalanceUpdating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isBalanceUpdating}
            >
              {isBalanceUpdating ? 'Updating Balance...' : 'Update Balance'}
            </button>
            <h2 className="text-xl font-semibold">Send Transaction</h2>
            <div className="space-y-2">
              <input
                type="text"
                value={receiverAddress}
                onChange={(e) => setReceiverAddress(e.target.value)}
                placeholder="Receiver Address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount in ETH"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={sendTransaction}
                className={`w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 ${
                  isSending ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isSending}
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </div>
            {transactionHash && (
              <p className="mt-4">
                Transaction Hash:{' '}
                <a
                  href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline break-words"
                >
                  {transactionHash}
                </a>
              </p>
            )}
            <h2 className="text-xl font-semibold">Transaction History</h2>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
              <ul className="list-disc pl-5 space-y-2">
                {history.map((tx, index) => (
                  <li key={index} className="text-gray-700 break-words">
                    {tx.date} - {tx.type} - {tx.amount} ETH -{' '}
                    <a
                      href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline break-words"
                    >
                      {tx.hash}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
