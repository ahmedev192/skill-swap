import React, { useState } from 'react';
import { Gift, Check, X } from 'lucide-react';
import { referralService } from '../../services/referralService';

interface ReferralCodeInputProps {
  onReferralApplied?: (success: boolean, message: string, creditsEarned?: number) => void;
  disabled?: boolean;
}

const ReferralCodeInput: React.FC<ReferralCodeInputProps> = ({ 
  onReferralApplied, 
  disabled = false 
}) => {
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const handleApplyReferral = async () => {
    if (!referralCode.trim()) {
      setMessage('Please enter a referral code');
      setIsSuccess(false);
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      
      const result = await referralService.useReferralCode(referralCode.trim());
      
      setIsSuccess(result.success);
      setMessage(result.message);
      
      if (onReferralApplied) {
        onReferralApplied(result.success, result.message, result.creditsEarned);
      }
      
      if (result.success) {
        setReferralCode(''); // Clear the input on success
      }
    } catch (error) {
      console.error('Failed to apply referral code:', error);
      setIsSuccess(false);
      setMessage('Failed to apply referral code. Please try again.');
      
      if (onReferralApplied) {
        onReferralApplied(false, 'Failed to apply referral code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReferralCode(e.target.value.toUpperCase());
    // Clear message when user starts typing
    if (message) {
      setMessage(null);
      setIsSuccess(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Gift className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-medium text-gray-900">Have a referral code?</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-1">
            Referral Code
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="referralCode"
              value={referralCode}
              onChange={handleInputChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyReferral();
                }
              }}
              placeholder="Enter referral code"
              disabled={disabled || loading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={handleApplyReferral}
              disabled={disabled || loading || !referralCode.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Apply'
              )}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg flex items-start space-x-2 ${
          isSuccess 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {isSuccess ? (
            <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
          ) : (
            <X className="h-5 w-5 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm">{message}</p>
        </div>
      )}

      <div className="bg-purple-50 rounded-lg p-3">
        <p className="text-sm text-purple-700">
          <strong>Bonus:</strong> Get 15 credits when you use a valid referral code!
        </p>
      </div>
    </div>
  );
};

export default ReferralCodeInput;
