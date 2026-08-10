/**
 * AI Environment Configuration & Validation
 * Ensures that the AI Gateway never runs if critical secrets are missing.
 */

export function validateAiEnvironment() {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey || apiKey.trim() === '') {
    // This throws an Error so that it fails immediately on the server side
    // and can be caught by the Gateway to return a proper 500 JSON.
    throw new Error('CRITICAL: GOOGLE_API_KEY is missing from environment variables.');
  }

  return {
    googleApiKey: apiKey
  };
}
