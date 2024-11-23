import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  exp?: number;
  [key: string]: any;
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded: JWTPayload = jwtDecode(token);
    if (!decoded.exp) {
      return true;
    }
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Invalid token", error);
    return true;
  }
}
