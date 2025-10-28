import React from "react";

// Always authenticated: return a dummy user and no-op functions
export const useAuth = () => ({
  authState: {
    type: "authenticated",
    user: {
      id: 1,
      email: "demo@demo.com",
      displayName: "Demo User",
      avatarUrl: null,
      role: "admin", // or "user"
      status: "approved"
    }
  },
  logout: () => {},
  onLogin: () => {},
});

// Optionally, you can remove the AuthProvider component if not needed,
// or make it just render children directly:
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
