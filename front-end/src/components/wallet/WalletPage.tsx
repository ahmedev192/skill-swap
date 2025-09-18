import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft,
  CreditCard,
  Gift,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { creditsService, CreditTransaction, CreditBalance } from '../../services/creditsService';
import { referralService, ReferralStats } from '../../services/referralService';

const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'earning'>('overview');
  const [walletBalance, setWalletBalance] = useState<CreditBalance>({
    balance: 0,
    earned: 0,
    spent: 0,
    pending: 0
  });
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showUseReferralModal, setShowUseReferralModal] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState('');

  // Load wallet data
  useEffect(() => {
    const loadWalletData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const [balance, userTransactions, stats] = await Promise.all([
          creditsService.getUserCredits(user.id).catch(() => ({
            balance: 0,
            earned: 0,
            spent: 0,
            pending: 0
          })),
          creditsService.getCreditTransactions(user.id).catch(() => []),
          referralService.getReferralStats().catch(() => null)
        ]);
        
        setWalletBalance(balance);
        setTransactions(userTransactions);
        setReferralStats(stats);
      } catch (err) {
        setError('Failed to load wallet data');
        console.error('Error loading wallet data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadWalletData();
  }, [user]);

  // Referral functionality handlers
  const handleGenerateReferralCode = async () => {
    try {
      const referralCode = await referralService.generateReferralCode();
      setReferralStats(prev => prev ? { ...prev, referralCode } : null);
      setShowReferralModal(true);
    } catch (error) {
      console.error('Error generating referral code:', error);
      alert('Failed to generate referral code');
    }
  };

  const handleUseReferralCode = async () => {
    if (!referralCodeInput.trim()) {
      alert('Please enter a referral code');
      return;
    }

    try {
      const result = await referralService.useReferralCode(referralCodeInput.trim());
      alert(result.message);
      setShowUseReferralModal(false);
      setReferralCodeInput('');
      // Reload wallet data to show updated balance
      window.location.reload();
    } catch (error) {
      console.error('Error using referral code:', error);
      alert('Failed to use referral code');
    }
  };

  const copyReferralCode = () => {
    if (referralStats?.referralCode) {
      navigator.clipboard.writeText(referralStats.referralCode);
      alert('Referral code copied to clipboard!');
    }
  };

  const earningOpportunities = [
    {
      id: 1,
      title: 'Complete 5 more sessions this month',
      reward: '10 bonus credits',
      progress: 3,
      total: 5,
      icon: Clock
    },
    {
      id: 2,
      title: 'Refer a friend to SkillSwap',
      reward: '15 credits per referral',
      progress: 0,
      total: 1,
      icon: Gift
    },
    {
      id: 3,
      title: 'Maintain 4.8+ rating',
      reward: '5% bonus on all earnings',
      progress: 4.9,
      total: 4.8,
      icon: TrendingUp
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Earned':
      case 'Bonus':
        return ArrowUpRight;
      case 'Spent':
        return ArrowDownLeft;
      case 'Transfer':
        return CreditCard;
      default:
        return CreditCard;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'Earned':
      case 'Bonus':
        return 'text-green-600 dark:text-green-400';
      case 'Spent':
        return 'text-red-600 dark:text-red-400';
      case 'Transfer':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'Cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading wallet...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Time Credits Wallet
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your time credits and track your earnings
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Available Balance
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {walletBalance.balance}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Ready to spend
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <Wallet className="text-green-600 dark:text-green-400 h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {walletBalance.pending}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                In escrow
              </p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
              <Clock className="text-yellow-600 dark:text-yellow-400 h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Earned
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {walletBalance.earned}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                All time
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
              <TrendingUp className="text-blue-600 dark:text-blue-400 h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Spent
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {walletBalance.spent}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                All time
              </p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">
              <TrendingDown className="text-red-600 dark:text-red-400 h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'transactions', name: 'Transactions' },
              { id: 'earning', name: 'Earning Opportunities' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Transactions
              </h2>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {transactions.length > 0 ? (
                transactions.slice(0, 5).map((transaction) => {
                  const Icon = getTransactionIcon(transaction.type);
                  const colorClass = getTransactionColor(transaction.type);
                  const isPositive = transaction.type === 'Earned' || transaction.type === 'Bonus';
                  return (
                    <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className={`${colorClass} bg-gray-100 dark:bg-gray-700 p-2 rounded-lg`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {Math.abs(transaction.amount)} credits
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {transaction.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${colorClass}`}>
                          {isPositive ? '+' : '-'}{Math.abs(transaction.amount)}
                        </p>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(transaction.status)}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button 
                onClick={handleGenerateReferralCode}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Gift className="h-4 w-4" />
                <span>Refer Friends & Earn</span>
              </button>
              <button 
                onClick={() => {
                  // TODO: Implement earning tips modal or page
                  alert('Earning tips:\n• Complete sessions on time\n• Maintain high ratings\n• Be responsive to messages\n• Offer quality teaching');
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <TrendingUp className="h-4 w-4" />
                <span>View Earning Tips</span>
              </button>
              <button 
                onClick={() => setActiveTab('transactions')}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                <span>Transaction History</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Transaction History
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {transactions.length > 0 ? (
                transactions.map((transaction) => {
                  const Icon = getTransactionIcon(transaction.type);
                  const colorClass = getTransactionColor(transaction.type);
                  const isPositive = transaction.type === 'Earned' || transaction.type === 'Bonus';
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`${colorClass} bg-gray-100 dark:bg-gray-700 p-3 rounded-lg`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {Math.abs(transaction.amount)} credits
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {transaction.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusIcon(transaction.status)}
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-medium ${colorClass}`}>
                          {isPositive ? '+' : '-'}{Math.abs(transaction.amount)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'earning' && (
        <div className="space-y-6">
          {earningOpportunities.map((opportunity) => {
            const Icon = opportunity.icon;
            const progress = Math.min((opportunity.progress / opportunity.total) * 100, 100);
            
            return (
              <div key={opportunity.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                      <Icon className="text-blue-600 dark:text-blue-400 h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {opportunity.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Reward: {opportunity.reward}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{opportunity.progress} / {opportunity.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    // TODO: Implement detailed earning opportunity modal
                    alert(`Learn more about: ${opportunity.title}\n\nReward: ${opportunity.reward}\n\nThis feature will show detailed information about how to complete this earning opportunity.`);
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Learn More
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Referral Code Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Your Referral Code
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Share this code with friends to earn 15 credits when they join!
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={referralStats?.referralCode || ''}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={copyReferralCode}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowReferralModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Use Referral Code Modal */}
      {showUseReferralModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Use Referral Code
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Enter a referral code to earn 15 credits!
              </p>
              <input
                type="text"
                value={referralCodeInput}
                onChange={(e) => setReferralCodeInput(e.target.value)}
                placeholder="Enter referral code"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUseReferralModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUseReferralCode}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Use Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Use Referral Code Button */}
      {referralStats && !referralStats.hasUsedReferral && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setShowUseReferralModal(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Gift className="h-5 w-5" />
            <span>Use Referral Code</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletPage;