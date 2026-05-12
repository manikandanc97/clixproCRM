export function getApiErrorMessage(error: unknown, fallback = "Something went wrong.") {
  if (typeof error === "object" && error && "response" in error) {
    const responseError = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
    };

    return responseError.response?.data?.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}











