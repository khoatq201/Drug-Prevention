// Test JWT Token Decoder
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODcwYWM1YzkyYjI1ZTFiODZiNDhiYzIiLCJpYXQiOjE3NTIyMTc5NTcsImV4cCI6MTc1MjMwNDM1N30.WDPGn49KKIS8pgSJMzocgjFjggcfUgb-DvtahRaXC9M";

// Decode JWT payload
try {
  const payload = JSON.parse(atob(token.split(".")[1]));
  console.log("JWT Payload:", payload);

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  console.log("Current time:", now);
  console.log("Token expires:", payload.exp);
  console.log("Token expired?", now > payload.exp);
} catch (error) {
  console.error("JWT decode error:", error);
}
