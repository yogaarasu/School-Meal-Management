export const STRICT_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const STRICT_PASSWORD_HINT =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
