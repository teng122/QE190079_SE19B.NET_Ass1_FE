import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import ToastProvider from '@/components/ToastProvider';

export const metadata: Metadata = {
  title: 'TaskTrack — Task & Project Management',
  description: 'Manage your departments, projects, and tasks with TaskTrack.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <ToastProvider>
          <main>
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
