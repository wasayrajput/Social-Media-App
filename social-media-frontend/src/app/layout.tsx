import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/providers';
import Navbar from '@/components/Navbar/navbar'; // Apne Navbar ka sahi path yahan dein

export const metadata: Metadata = {
  title: 'Connect Pulse',
  description: 'Social Media Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}