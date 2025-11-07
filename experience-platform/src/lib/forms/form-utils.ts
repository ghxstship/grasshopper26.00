import { UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { ZodSchema } from 'zod';

/**
 * Form utility functions for React Hook Form + Zod integration
 */

/**
 * Get error message for a specific field
 */
export function getFieldError<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: Path<T>
): string | undefined {
  const error = form.formState.errors[fieldName];
  return error?.message as string | undefined;
}

/**
 * Check if a field has an error
 */
export function hasFieldError<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: Path<T>
): boolean {
  return !!form.formState.errors[fieldName];
}

/**
 * Get all form errors as an array
 */
export function getAllErrors<T extends FieldValues>(
  form: UseFormReturn<T>
): Array<{ field: string; message: string }> {
  const errors = form.formState.errors;
  return Object.keys(errors).map((key) => ({
    field: key,
    message: errors[key]?.message as string,
  }));
}

/**
 * Reset form with optional default values
 */
export function resetForm<T extends FieldValues>(
  form: UseFormReturn<T>,
  defaultValues?: Partial<T>
) {
  form.reset(defaultValues as any);
}

/**
 * Handle form submission with error handling
 */
export async function handleFormSubmit<T extends FieldValues>(
  form: UseFormReturn<T>,
  onSubmit: (data: T) => Promise<void> | void,
  onError?: (error: Error) => void
) {
  return form.handleSubmit(
    async (data) => {
      try {
        await onSubmit(data);
      } catch (error) {
        if (onError) {
          onError(error as Error);
        } else {
          console.error('Form submission error:', error);
        }
      }
    },
    (errors) => {
      console.error('Form validation errors:', errors);
    }
  );
}

/**
 * Validate form data against a Zod schema
 */
export function validateWithZod<T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((error) => {
    const path = error.path.join('.');
    errors[path] = error.message;
  });
  
  return { success: false, errors };
}

/**
 * Format form data for API submission
 * Removes empty strings and null values
 */
export function formatFormData<T extends Record<string, any>>(
  data: T,
  options: {
    removeEmpty?: boolean;
    removeNull?: boolean;
    trim?: boolean;
  } = {}
): Partial<T> {
  const { removeEmpty = true, removeNull = true, trim = true } = options;
  
  const formatted: any = {};
  
  Object.keys(data).forEach((key) => {
    let value = data[key];
    
    // Trim strings
    if (trim && typeof value === 'string') {
      value = value.trim();
    }
    
    // Skip empty strings
    if (removeEmpty && value === '') {
      return;
    }
    
    // Skip null values
    if (removeNull && value === null) {
      return;
    }
    
    formatted[key] = value;
  });
  
  return formatted;
}

/**
 * Convert form errors to toast notifications
 */
export function errorsToToast<T extends FieldValues>(
  form: UseFormReturn<T>,
  toast: (message: string) => void
) {
  const errors = getAllErrors(form);
  errors.forEach((error) => {
    toast(`${error.field}: ${error.message}`);
  });
}

/**
 * Set multiple form errors programmatically
 */
export function setFormErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  errors: Record<string, string>
) {
  Object.keys(errors).forEach((key) => {
    form.setError(key as Path<T>, {
      type: 'manual',
      message: errors[key],
    });
  });
}

/**
 * Clear all form errors
 */
export function clearFormErrors<T extends FieldValues>(
  form: UseFormReturn<T>
) {
  form.clearErrors();
}

/**
 * Watch multiple fields at once
 */
export function watchFields<T extends FieldValues>(
  form: UseFormReturn<T>,
  fields: Array<Path<T>>
): Partial<T> {
  const values: any = {};
  fields.forEach((field) => {
    values[field] = form.watch(field);
  });
  return values;
}

/**
 * Check if form is pristine (no changes)
 */
export function isFormPristine<T extends FieldValues>(
  form: UseFormReturn<T>
): boolean {
  return !form.formState.isDirty;
}

/**
 * Check if form is valid
 */
export function isFormValid<T extends FieldValues>(
  form: UseFormReturn<T>
): boolean {
  return form.formState.isValid;
}

/**
 * Get form submission state
 */
export function getSubmissionState<T extends FieldValues>(
  form: UseFormReturn<T>
): {
  isSubmitting: boolean;
  isSubmitted: boolean;
  isSubmitSuccessful: boolean;
  submitCount: number;
} {
  return {
    isSubmitting: form.formState.isSubmitting,
    isSubmitted: form.formState.isSubmitted,
    isSubmitSuccessful: form.formState.isSubmitSuccessful,
    submitCount: form.formState.submitCount,
  };
}
