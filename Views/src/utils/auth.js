import { jwtDecode } from "jwt-decode";

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getUserIdFromToken = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    console.log("Decoded Token:", decoded); // Debugging
    return decoded.userId || null;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};
