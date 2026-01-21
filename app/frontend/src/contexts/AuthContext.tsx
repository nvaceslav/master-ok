import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: number;
    name: string;
    phone: string;
    role: 'client' | 'master' | 'admin';
    avatar: string | null;
    city: string;
    rating: number;
    completed_orders: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('masterok_token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUser = () => {
            const storedToken = localStorage.getItem('masterok_token');
            const storedUser = localStorage.getItem('masterok_user');
            
            if (storedToken && storedUser) {
                try {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    localStorage.removeItem('masterok_token');
                    localStorage.removeItem('masterok_user');
                }
            }
            setIsLoading(false);
        };
        
        loadUser();
    }, []);

    const login = (userData: User, userToken: string) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('masterok_token', userToken);
        localStorage.setItem('masterok_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('masterok_token');
        localStorage.removeItem('masterok_user');
        window.location.href = '/auth';
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            logout,
            isAuthenticated: !!user && !!token,
            isLoading,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;