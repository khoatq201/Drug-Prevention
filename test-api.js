// Test API call với token
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODcwYWM1YzkyYjI1ZTFiODZiNDhiYzIiLCJpYXQiOjE3NTIyMTc5NTcsImV4cCI6MTc1MjMwNDM1N30.WDPGn49KKIS8pgSJMzocgjFjggcfUgb-DvtahRaXC9M";

fetch("http://localhost:5000/api/auth/profile", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
})
  .then((response) => {
    console.log("Response status:", response.status);
    return response.json();
  })
  .then((data) => {
    console.log("Response data:", data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
