import { useState, useCallback } from 'react';
import { ValidationRules, ValidationErrors, validateForm, sanitizeInput } from '../utils/validation';

interface UseFormValidationOptions {
  rules: ValidationRules;
  initialData?: any;
  onSubmit?: (data: any) => Promise<void> | void;
}

interface UseFormValidationReturn {
  data: any;
  errors: ValidationErrors;
  isValid: boolean;
  isSubmitting: boolean;
  setData: (data: any) => void;
  setField: (field: string, value: any) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearErrors: () => void;
  validate: () => boolean;
  validateField: (field: string) => boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for form validation and management
 */
export const useFormValidation = ({
  rules,
  initialData = {},
  onSubmit,
}: UseFormValidationOptions): UseFormValidationReturn => {
  const [data, setDataState] = useState(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setData = useCallback((newData: any) => {
    setDataState(sanitizeInput(newData));
  }, []);

  const setField = useCallback((field: string, value: any) => {
    setDataState(prev => ({
      ...prev,
      [field]: sanitizeInput(value),
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const setError = useCallback((field: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const validate = useCallback((): boolean => {
    const validationErrors = validateForm(data, rules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [data, rules]);

  const validateField = useCallback((field: string): boolean => {
    const fieldRules = rules[field];
    if (!fieldRules) return true;

    const { validateField: validateSingleField } = require('../utils/validation');
    const error = validateSingleField(data[field], fieldRules);
    
    if (error) {
      setError(field, error);
      return false;
    } else {
      clearError(field);
      return true;
    }
  }, [data, rules, setError, clearError]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!onSubmit) return;

    setIsSubmitting(true);
    clearErrors();

    try {
      const isValid = validate();
      if (isValid) {
        await onSubmit(data);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [data, onSubmit, validate, clearErrors]);

  const reset = useCallback(() => {
    setDataState(initialData);
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  const isValid = Object.keys(errors).length === 0;

  return {
    data,
    errors,
    isValid,
    isSubmitting,
    setData,
    setField,
    setError,
    clearError,
    clearErrors,
    validate,
    validateField,
    handleSubmit,
    reset,
  };
};
