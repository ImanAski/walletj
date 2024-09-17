// app/api/wallet/route.js
import { ethers } from 'ethers';

export async function GET(request) {
  // Check if wallet exists in local storage (simulate with memory storage)
  if (typeof window !== 'undefined') {
    const wallet = localStorage.getItem('wallet');
    if (wallet) {
      return new Response(JSON.stringify({ wallet: JSON.parse(wallet) }), { status: 200 });
    }
  }
  return new Response(JSON.stringify({ message: 'Wallet not found' }), { status: 404 });
}

export async function POST(request) {
  const { userId } = await request.json();
  const wallet = ethers.Wallet.createRandom();
  const walletData = {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem('wallet', JSON.stringify(walletData));
  }
  return new Response(JSON.stringify({ wallet: walletData }), { status: 201 });
}
