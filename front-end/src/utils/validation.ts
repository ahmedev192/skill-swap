/**
 * Validation utilities for form validation
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Validates a single field value against its rules
 */
export const validateField = (value: any, rules: ValidationRule): string | null => {
  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return 'This field is required';
  }

  // Skip other validations if value is empty and not required
  if (!value || (typeof value === 'string' && !value.trim())) {
    return null;
  }

  const stringValue = String(value);

  // Min length validation
  if (rules.minLength && stringValue.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters`;
  }

  // Max length validation
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return `Cannot exceed ${rules.maxLength} characters`;
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return 'Invalid format';
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

/**
 * Validates an object against validation rules
 */
export const validateForm = (data: any, rules: ValidationRules): ValidationErrors => {
  const errors: ValidationErrors = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const error = validateField(data[field], fieldRules);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
};

/**
 * Common validation rules
 */
export const commonRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 100,
  },
  password: {
    required: true,
    minLength: 6,
    maxLength: 100,
  },
  firstName: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  lastName: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  location: {
    required: true,
    maxLength: 100,
  },
  bio: {
    maxLength: 500,
  },
  timeZone: {
    maxLength: 50,
  },
  preferredLanguage: {
    maxLength: 50,
  },
  referralCode: {
    maxLength: 20,
  },
};

/**
 * Authentication form validation rules
 */
export const authValidationRules = {
  login: {
    email: commonRules.email,
    password: commonRules.password,
  },
  register: {
    firstName: commonRules.firstName,
    lastName: commonRules.lastName,
    email: commonRules.email,
    password: commonRules.password,
    location: commonRules.location,
  },
  forgotPassword: {
    email: commonRules.email,
  },
  resetPassword: {
    newPassword: commonRules.password,
    confirmPassword: {
      required: true,
      custom: (value: string, formData?: any) => {
        if (!value) return 'Please confirm your password';
        if (formData && value !== formData.newPassword) {
          return 'Passwords do not match';
        }
        return null;
      },
    },
  },
  changePassword: {
    currentPassword: commonRules.password,
    newPassword: commonRules.password,
    confirmPassword: {
      required: true,
      custom: (value: string, formData?: any) => {
        if (!value) return 'Please confirm your new password';
        if (formData && value !== formData.newPassword) {
          return 'Passwords do not match';
        }
        return null;
      },
    },
  },
  updateProfile: {
    firstName: { ...commonRules.firstName, required: false },
    lastName: { ...commonRules.lastName, required: false },
    bio: commonRules.bio,
    location: { ...commonRules.location, required: false },
    timeZone: commonRules.timeZone,
    preferredLanguage: commonRules.preferredLanguage,
  },
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  return commonRules.email.pattern!.test(email);
};

/**
 * Validates password strength
 */
export const getPasswordStrength = (password: string): { score: number; feedback: string[] } => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Use at least 8 characters');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include uppercase letters');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include numbers');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include special characters');
  }

  return { score, feedback };
};

/**
 * Sanitizes input by trimming whitespace
 */
export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return input.trim();
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
};
