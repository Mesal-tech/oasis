'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { Provider } from 'react-redux';
import store from '../lib/store';
import PlayerProvider from './providers/PlayerProvider';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import DataPreloader from './components/DataPreloader';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider store={store}>
          {/* DataPreloader runs once at app root level */}
          <DataPreloader />
          
          <PlayerProvider>
            <div className="flex h-screen w-full bg-black text-white overflow-hidden">
              {/* Sidebar (Desktop) / Mobile Nav (Bottom) */}
              <Sidebar />

              <div className="flex-1 flex flex-col h-full w-full relative">
                 {/* Mobile Header (Sticky) */}
                 <Header />

                 {/* Main Content Area */}
                 <main className="flex-1 overflow-y-auto w-full relative pb-32 md:pb-0" id="screensContainer">
                   {children}
                 </main>
              </div>
            </div>
          </PlayerProvider>
        </Provider>
      </body>
    </html>
  );
}

