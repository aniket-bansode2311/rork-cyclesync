// Centralized error handling for API requests
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const handleAPIError = (error: any): APIError => {
  if (error instanceof APIError) {
    return error;
  }

  // Handle fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new APIError('Network error. Please check your connection.', 0, 'NETWORK_ERROR');
  }

  // Handle rate limiting
  if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
    const retryAfter = error.retryAfter || 60; // Default to 60 seconds
    return new APIError(
      `Too many requests. Please wait ${retryAfter} seconds before trying again.`,
      429,
      'RATE_LIMITED',
      retryAfter
    );
  }

  // Handle server errors
  if (error.status >= 500) {
    return new APIError('Server error. Please try again later.', error.status, 'SERVER_ERROR');
  }

  // Handle client errors
  if (error.status >= 400) {
    return new APIError(error.message || 'Request failed', error.status, 'CLIENT_ERROR');
  }

  // Generic error
  return new APIError(error.message || 'An unexpected error occurred', 500, 'UNKNOWN_ERROR');
};

export const isRetryableError = (error: APIError): boolean => {
  return (
    error.status === 429 || // Rate limited
    error.status >= 500 || // Server errors
    error.code === 'NETWORK_ERROR' // Network errors
  );
};

export const getRetryDelay = (attempt: number, error?: APIError): number => {
  if (error?.status === 429 && error.retryAfter) {
    return error.retryAfter * 1000; // Convert to milliseconds
  }
  
  // Exponential backoff with jitter
  const baseDelay = Math.pow(2, attempt) * 1000;
  const jitter = Math.random() * 1000;
  return Math.min(baseDelay + jitter, 30000); // Max 30 seconds
};