/**
 * User Context Module
 * 
 * Provides authentication state management and socket initialization for the application.
 * Handles user session persistence, socket connection lifecycle, and logout functionality.
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { initSocket, disconnectSocket } from "../components/utils/socket";

/**
 * React context for user authentication and session management
 * @type {React.Context}
 */

const UserContext = createContext();

/**
 * User Provider Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * 
 * @example
 * // Wrap your application with UserProvider
 * <UserProvider>
 *   <App />
 * </UserProvider>
 * 
 * @returns {React.ReactElement} Context provider element
 */

export const UserProvider = ({ children }) => {
   /**
   * Current authenticated user state
   * @state
   * @type {Object|null}
   * @property {string} token - JWT authentication token
   * @property {string} email - User email address
   * @property {string} id - User ID
   * @property {string} [role] - User role (optional)
  */
  
  const [user, setUser] = useState(null);

  /**
   * Socket connection initialization state
   * @state
   * @type {boolean}
   */

  const [socketInitialized, setSocketInitialized] = useState(false);

   /**
   * Handles user authentication and socket initialization
   * @function
   * @param {Object} userData - User data object
   * @param {string} userData.token - Authentication token
   * @param {string} userData.email - User email
   * @param {string} userData.id - User ID
   */

  const handleSetUser = (userData) => {
    setUser(userData);
  };

  /**
   * Effect hook for session persistence and cleanup
   * @effect
   * @sideeffect
   * - Checks existing session on mount
   * - Initializes socket connection if authenticated
   * - Cleans up socket on unmount
   */
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:5000/authenticator/user", {
          credentials: "include",
        });

        if (response.ok) {
          const result = await response.json();
          const sessionUser = result.data.user;
          const token = result.data.token;

          // Step 1: Lookup correct user ID from /users/by-email
          const byEmailResponse = await fetch(
            `http://localhost:5000/users/by-email?email=${sessionUser.email}`
          );

          if (byEmailResponse.ok) {
            const { data: fixedUser } = await byEmailResponse.json();

            // Step 2: Set the corrected user in context
            handleSetUser({
              ...fixedUser,
              token,
            });
          } else {
            console.warn("Could not find user in main users table, using session user.");
            handleSetUser({ ...sessionUser, token });
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };

    checkSession();
  }, []);

  // Initialize socket when user is set, cleanup on logout or user change
  useEffect(() => {
    if (user?.id) {
      initSocket(user.id);
    }

    return () => {
      disconnectSocket();
    };
  }, [user?.id]);

  /**
   * Handles user logout
   * @async
   * @function
   * @throws {Error} When logout API call fails
   */
  const logout = async () => {
    try {
      await fetch("http://localhost:5000/authenticator/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser: handleSetUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export default UserContext;
