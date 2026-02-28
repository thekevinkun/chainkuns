// ============================================
// NextAuth v5 API Route Handler
// This single file handles ALL auth endpoints:
// - GET  /api/auth/session  → get current session
// - POST /api/auth/signin   → log in
// - POST /api/auth/signout  → log out
// - GET  /api/auth/csrf     → get CSRF token
// ============================================

import { handlers } from "@/auth"; // import the handlers we defined in auth.ts

// Export GET and POST handlers
// NextAuth handles all the routing internally
export const { GET, POST } = handlers;
