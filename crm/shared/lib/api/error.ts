import axios from "axios";

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong.") {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    
    console.log("getApiErrorMessage -> Axios Error Data:", data);

    if (data?.error?.details && Array.isArray(data.error.details) && data.error.details.length > 0) {
      // Get the first validation error and prefix it with the field name if available
      const firstError = data.error.details[0];
      const field = firstError.path && firstError.path.length > 0 ? firstError.path.join('.') : '';
      const formattedField = field ? field.charAt(0).toUpperCase() + field.slice(1) : '';
      return formattedField ? `${formattedField}: ${firstError.message}` : firstError.message;
    }
    
    return data?.error?.message || data?.message || error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}











