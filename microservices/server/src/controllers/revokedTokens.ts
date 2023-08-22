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
