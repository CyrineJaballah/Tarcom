/**
 * A robust fetch wrapper that handles Render's free tier spin-up delays
 * and common network errors by automatically retrying.
 */
export async function fetchWithRetry(
  url: string, 
  options: RequestInit = {}, 
  maxRetries = 10, 
  delay = 10000,
  onRetry?: (attempt: number) => void
): Promise<Response> {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        if (onRetry) onRetry(attempt);
        await new Promise((r) => setTimeout(r, delay));
      }

      const response = await fetch(url, options);

      // Render free tier status (502/503/504) indicator
      if (!response.ok && (response.status === 502 || response.status === 503 || response.status === 504)) {
        lastError = new Error(`Server is waking up (Status ${response.status})`);
        continue;
      }

      return response;
    } catch (error: any) {
      lastError = error;
      // Network errors (e.g. server unreachable) should also trigger a retry
      const isNetworkError = error instanceof TypeError || error.name === 'TypeError' || error.message === 'Failed to fetch';
      if (isNetworkError) {
        continue;
      }
      // Re-throw other errors immediately (like logic errors)
      throw error;
    }
  }

  throw lastError || new Error("Le serveur met trop de temps à répondre.");
}
