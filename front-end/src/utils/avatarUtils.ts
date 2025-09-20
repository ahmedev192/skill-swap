/**
 * Utility function to get the best available avatar URL for a user
 * Prioritizes customAvatarUrl over profileImageUrl, with fallback to null
 */
export const getUserAvatarUrl = (user: { customAvatarUrl?: string; profileImageUrl?: string }): string | null => {
  return user.customAvatarUrl || user.profileImageUrl || null;
};

/**
 * Utility function to get avatar URL with a default fallback
 */
export const getUserAvatarUrlWithFallback = (user: { customAvatarUrl?: string; profileImageUrl?: string }): string => {
  return user.customAvatarUrl || user.profileImageUrl || '';
};
