// src/app/layout.js
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={inter.className}>
        <body>
            {children}
        </body>
        </html>
    );
}