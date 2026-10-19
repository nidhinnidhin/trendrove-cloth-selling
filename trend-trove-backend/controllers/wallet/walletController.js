const Wallet = require('../../models/wallet/walletModel');

const getWalletDetails = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or user ID missing'
      });
    }

    let wallet = await Wallet.findOne({ userId: req.user.id });

    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.user.id,
        balance: 0,
        transactions: []
      });
    }

    // Sort transactions newest first
    const sortedTransactions = wallet.transactions?.length
      ? [...wallet.transactions].sort((a, b) => new Date(b.date) - new Date(a.date))
      : [];

    // Calculate referral earnings
    const referralEarnings = sortedTransactions
      .filter(t => t.description.toLowerCase().includes('referral'))
      .reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : 0), 0);

    res.status(200).json({
      success: true,
      balance: wallet.balance,
      transactions: sortedTransactions,
      referralEarnings
    });
  } catch (error) {
    console.error('Error in getWalletDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wallet details',
      error: error.message
    });
  }
};

// Add transaction (credit or debit)
const addTransaction = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or user ID missing'
      });
    }
    const { amount, type, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    if (!['credit', 'debit'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction type' });
    }

    let wallet = await Wallet.findOne({ userId: req.user.id });

    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.user.id,
        balance: 0,
        transactions: []
      });
    }

    if (type === 'credit') {
      wallet.balance += amount;
    } else if (type === 'debit') {
      if (wallet.balance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient wallet balance'
        });
      }
      wallet.balance -= amount;
    }

    wallet.transactions.push({
      userId: req.user.id,
      type,
      amount,
      description,
      date: new Date()
    });

    await wallet.save();

    res.status(200).json({
      success: true,
      message: 'Transaction successful',
      balance: wallet.balance,
      transaction: wallet.transactions[wallet.transactions.length - 1]
    });
  } catch (error) {
    console.error('Error in addTransaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing transaction'
    });
  }
};

// Internal helper: credit wallet for refund (called from checkout controller)
const creditWalletRefund = async (userId, amount, description) => {
  try {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId, balance: 0, transactions: [] });
    }
    wallet.balance += amount;
    wallet.transactions.push({
      userId,
      type: 'credit',
      amount,
      description,
      date: new Date()
    });
    await wallet.save();
    return wallet;
  } catch (error) {
    console.error('Error crediting wallet refund:', error);
    throw error;
  }
};

module.exports = {
  getWalletDetails,
  addTransaction,
  creditWalletRefund
};