import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Users, 
  DollarSign, 
  Copy,
  Share,
  Check
} from 'lucide-react';
import { referralService, ReferralStats } from '../../services/referralService';
import { useAuth } from '../../contexts/AuthContext';

const ReferralSection: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReferralStats();
  }, []);

  const loadReferralStats = async () => {
    try {
      setLoading(true);
      const referralStats = await referralService.getReferralStats();
      setStats(referralStats);
    } catch (error) {
      console.error('Failed to load referral stats:', error);
      setError('Failed to load referral statistics');
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = async () => {
    try {
      setGenerating(true);
      const result = await referralService.generateReferralCode();
      await loadReferralStats(); // Refresh stats
    } catch (error) {
      console.error('Failed to generate referral code:', error);
      setError('Failed to generate referral code');
    } finally {
      setGenerating(false);
    }
  };

  const copyReferralCode = async () => {
    if (!stats?.referralCode) return;
    
    const success = await referralService.copyReferralCode(stats.referralCode);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareReferralLink = async () => {
    if (!stats?.referralCode) return;
    
    const referralLink = referralService.generateReferralLink(stats.referralCode);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join SkillSwap!',
          text: 'Join me on SkillSwap and earn credits when you sign up!',
          url: referralLink
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying the link
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Gift className="h-6 w-6 text-purple-600 mr-2" />
          Referral Program
        </h2>
        {!stats?.referralCode && (
          <button
            onClick={generateReferralCode}
            disabled={generating}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
          >
            {generating ? 'Generating...' : 'Generate Code'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {stats && (
        <div className="space-y-6">
          {/* Referral Code Section */}
          {stats.referralCode && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your Referral Code</h3>
              <div className="flex items-center space-x-3">
                <code className="flex-1 bg-white px-3 py-2 rounded border text-lg font-mono text-purple-600">
                  {stats.referralCode}
                </code>
                <button
                  onClick={copyReferralCode}
                  className="bg-white text-purple-600 px-3 py-2 rounded border hover:bg-gray-50 flex items-center"
                >
                  {copied ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={shareReferralLink}
                  className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 flex items-center"
                >
                  <Share className="h-5 w-5 mr-1" />
                  Share
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Share this code with friends to earn 15 credits when they join!
              </p>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Friends Referred</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.referredUsersCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Credits Earned</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCreditsEarned}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <Gift className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.hasUsedReferral ? 'Bonus Used' : 'Eligible'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">How it works</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">1</span>
                Share your referral code with friends
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">2</span>
                When they sign up using your code, you both get 15 credits
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">3</span>
                Use credits to book skill sessions with other users
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralSection;
