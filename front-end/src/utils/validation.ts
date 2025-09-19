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
  sessionNotes: {
    maxLength: 1000,
  },
  sessionLocation: {
    maxLength: 200,
  },
  sessionMeetingLink: {
    maxLength: 500,
    pattern: /^https?:\/\/.+/,
  },
  cancellationReason: {
    required: true,
    minLength: 5,
    maxLength: 500,
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
 * Skills form validation rules
 */
export const skillsValidationRules = {
  createUserSkill: {
    skillId: {
      required: true,
      custom: (value: any) => {
        if (!value || value <= 0) {
          return 'Please select a valid skill';
        }
        return null;
      },
    },
    type: {
      required: true,
      custom: (value: any) => {
        if (!value || (value !== 1 && value !== 2)) {
          return 'Please select a skill type';
        }
        return null;
      },
    },
    level: {
      required: true,
      custom: (value: any) => {
        if (!value || value < 1 || value > 3) {
          return 'Please select a valid skill level';
        }
        return null;
      },
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 1000,
      custom: (value: any) => {
        if (!value || value.trim().length < 10) {
          return 'Description must be at least 10 characters long';
        }
        return null;
      },
    },
    creditsPerHour: {
      required: true,
      custom: (value: any) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0.1 || numValue > 1000) {
          return 'Credits per hour must be between 0.1 and 1000';
        }
        return null;
      },
    },
  },
  updateUserSkill: {
    level: {
      custom: (value: any) => {
        if (value !== undefined && (value < 1 || value > 3)) {
          return 'Please select a valid skill level';
        }
        return null;
      },
    },
    description: {
      maxLength: 1000,
      custom: (value: any) => {
        if (value && value.trim().length < 10) {
          return 'Description must be at least 10 characters long';
        }
        return null;
      },
    },
    creditsPerHour: {
      custom: (value: any) => {
        if (value !== undefined) {
          const numValue = parseFloat(value);
          if (isNaN(numValue) || numValue < 0.1 || numValue > 1000) {
            return 'Credits per hour must be between 0.1 and 1000';
          }
        }
        return null;
      },
    },
  },
  createSkill: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 500,
    },
    category: {
      required: true,
      minLength: 2,
      maxLength: 50,
    },
  },
  updateSkill: {
    name: {
      minLength: 2,
      maxLength: 100,
    },
    description: {
      maxLength: 500,
    },
    category: {
      minLength: 2,
      maxLength: 50,
    },
  },
};

/**
 * Session form validation rules
 */
export const sessionValidationRules = {
  createSession: {
    teacherId: {
      required: true,
      minLength: 1,
    },
    userSkillId: {
      required: true,
      custom: (value: any) => {
        if (!value || value <= 0) {
          return 'Please select a valid skill';
        }
        return null;
      },
    },
    scheduledStart: {
      required: true,
      custom: (value: any, formData?: any) => {
        if (!value) return 'Start time is required';
        const startTime = new Date(value);
        const now = new Date();
        if (startTime <= now) {
          return 'Session must be scheduled for a future time';
        }
        if (formData?.scheduledEnd && startTime >= new Date(formData.scheduledEnd)) {
          return 'Start time must be before end time';
        }
        return null;
      },
    },
    scheduledEnd: {
      required: true,
      custom: (value: any, formData?: any) => {
        if (!value) return 'End time is required';
        const endTime = new Date(value);
        const now = new Date();
        if (endTime <= now) {
          return 'Session must be scheduled for a future time';
        }
        if (formData?.scheduledStart && endTime <= new Date(formData.scheduledStart)) {
          return 'End time must be after start time';
        }
        return null;
      },
    },
    notes: commonRules.sessionNotes,
    location: {
      custom: (value: any, formData?: any) => {
        if (formData?.isOnline === false && (!value || value.trim() === '')) {
          return 'Location is required for in-person sessions';
        }
        return null;
      },
    },
    meetingLink: {
      custom: (value: any, formData?: any) => {
        if (formData?.isOnline === true && value && !commonRules.sessionMeetingLink.pattern?.test(value)) {
          return 'Please enter a valid meeting link (starting with http:// or https://)';
        }
        return null;
      },
    },
  },
  updateSession: {
    scheduledStart: {
      custom: (value: any, formData?: any) => {
        if (value) {
          const startTime = new Date(value);
          const now = new Date();
          if (startTime <= now) {
            return 'Session must be scheduled for a future time';
          }
          if (formData?.scheduledEnd && startTime >= new Date(formData.scheduledEnd)) {
            return 'Start time must be before end time';
          }
        }
        return null;
      },
    },
    scheduledEnd: {
      custom: (value: any, formData?: any) => {
        if (value) {
          const endTime = new Date(value);
          const now = new Date();
          if (endTime <= now) {
            return 'Session must be scheduled for a future time';
          }
          if (formData?.scheduledStart && endTime <= new Date(formData.scheduledStart)) {
            return 'End time must be after start time';
          }
        }
        return null;
      },
    },
    notes: commonRules.sessionNotes,
    location: commonRules.sessionLocation,
    meetingLink: commonRules.sessionMeetingLink,
  },
  cancelSession: {
    reason: commonRules.cancellationReason,
  },
  rescheduleSession: {
    newStart: {
      required: true,
      custom: (value: any, formData?: any) => {
        if (!value) return 'New start time is required';
        const startTime = new Date(value);
        const now = new Date();
        if (startTime <= now) {
          return 'New session time must be in the future';
        }
        if (formData?.newEnd && startTime >= new Date(formData.newEnd)) {
          return 'Start time must be before end time';
        }
        return null;
      },
    },
    newEnd: {
      required: true,
      custom: (value: any, formData?: any) => {
        if (!value) return 'New end time is required';
        const endTime = new Date(value);
        const now = new Date();
        if (endTime <= now) {
          return 'New session time must be in the future';
        }
        if (formData?.newStart && endTime <= new Date(formData.newStart)) {
          return 'End time must be after start time';
        }
        return null;
      },
    },
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
