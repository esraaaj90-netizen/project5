import { Readex_Pro } from 'next/font/google';
import './globals.css';

const font = Readex_Pro({ subsets: ['arabic', 'latin'], variable: '--font', display: 'swap' });

export const metadata = { title: 'معًا – لنبني مهارات' };

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={font.variable}>
      <body>{children}</body>
    </html>
  );
}
