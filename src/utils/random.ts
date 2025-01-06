export const generateRandomFileName = (): string => {
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};
