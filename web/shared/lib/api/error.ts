import axios from "axios";

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong.") {
  const { generalError, fieldErrors } = parseApiErrors(error, fallback);
  const firstField = Object.keys(fieldErrors)[0];
  if (firstField) {
    const formattedField = firstField.charAt(0).toUpperCase() + firstField.slice(1);
    return `${formattedField}: ${fieldErrors[firstField]}`;
  }
  return generalError || fallback;
}

export function parseApiErrors(error: unknown, fallback = "Something went wrong.") {
  const result: { fieldErrors: Record<string, string>, generalError: string | null } = {
    fieldErrors: {},
    generalError: null
  };

  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (data?.error?.details && Array.isArray(data.error.details) && data.error.details.length > 0) {
      data.error.details.forEach((detail: { path?: string[]; message?: string }) => {
        const field = detail.path && detail.path.length > 0 ? detail.path.join('.') : '';
        if (field && !result.fieldErrors[field]) {
          result.fieldErrors[field] = detail.message ?? '';
        }
      });
      // Also grab general message if present, but field errors take precedence for those fields
      if (!Object.keys(result.fieldErrors).length) {
        result.generalError = data?.error?.message || data?.message || fallback;
      }
      return result;
    }
    
    result.generalError = data?.error?.message || data?.message || error.message || fallback;
    return result;
  }

  if (error instanceof Error) {
    result.generalError = error.message;
    return result;
  }

  result.generalError = fallback;
  return result;
}











