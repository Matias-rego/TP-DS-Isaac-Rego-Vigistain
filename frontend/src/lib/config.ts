export const BACKEND_URL =
  (import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const VITE_WS_URL =
  (import.meta.env.VITE_WS_URL ?? "ws://localhost:3000").replace(/\/$/, "");

  export default BACKEND_URL;