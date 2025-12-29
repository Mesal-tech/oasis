import React from 'react';
import { usePrivy } from '@privy-io/react-auth';

export const LoginButton = () => {
    const { login, logout, authenticated, user } = usePrivy();

    const handleLogin = () => {
        login();
    };

    const handleLogout = () => {
        logout();
    };

    if (authenticated) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-white/80">
                    {user?.email?.address || user?.wallet?.address ? (
                        <>
                            {user.email?.address ||
                                user.wallet?.address.slice(0, 6) + '...' + user.wallet?.address.slice(-4)}
                        </>
                    ) : (
                        'User'
                    )}
                </span>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded-lg transition-colors"
                >
                    Logout
                </button>
            </div>
        );
    }

    return (
        <button
            title="Login With Privy"
            onClick={handleLogin}
            className="w-full cursor-pointer flex items-center justify-center gap-2 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
        >
            <img src="/assets/misc/privy.svg" className="w-5 h-5" />
            <span>Login</span>
        </button>
    );
};
