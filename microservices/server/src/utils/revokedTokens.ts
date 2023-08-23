// Create an in-memory set to store revoked tokens
const revokedTokens = new Set<string>(); // Use string type for tokens

// Function to add a revoked token to the set
export const addRevokedToken = (token: string) => {
  revokedTokens.add(token);
};

// Function to check if a token is revoked
export const isTokenRevoked = (token: string): boolean => {
  return revokedTokens.has(token);
};

// Schedule a cleanup task to run every 10 minutes
setInterval(() => {
  const currentTime = Date.now();
  const tokensToRemove: string[] = [];

  for (const token of revokedTokens) {
    // Check if the token has expired (10 minutes = 600,000 milliseconds)
    if (currentTime - Number(token) > 600000) {
      tokensToRemove.push(token);
    }
  }

  // Remove expired tokens from the set
  for (const tokenToRemove of tokensToRemove) {
    revokedTokens.delete(tokenToRemove);
  }
}, 600000); // Run every 10 minutes
