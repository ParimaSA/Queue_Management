"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define types for AuthContext
interface AuthContextType {
    isAuthenticated: boolean;
    login: (username?: string) => void;
    logout: () => void;
    username: string;
}

// Create a context with an initial null value
const AuthContext = createContext<AuthContextType | null>(null);

const LOCAL_STORAGE_KEY = "is-logged-in";
const LOCAL_USERNAME_KEY = "username";

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState("");
    
    useEffect(() => {
        const storedAuthStatus = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedAuthStatus) {
            const storedAuthStatusInt = parseInt(storedAuthStatus);
            setIsAuthenticated(storedAuthStatusInt === 1);
        }
        const storedUsername = localStorage.getItem(LOCAL_USERNAME_KEY);
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    const login = (username?: string) => {
        setIsAuthenticated(true);
        localStorage.setItem(LOCAL_STORAGE_KEY, "1");
        if (username) {
            localStorage.setItem(LOCAL_USERNAME_KEY, username);
            setUsername(username);
        } else {
            localStorage.removeItem(LOCAL_USERNAME_KEY);
        }        
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.setItem(LOCAL_STORAGE_KEY, "0");
        // router.replace(LOGOUT_REDIRECT_URL);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, username }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}