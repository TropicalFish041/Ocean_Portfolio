import type { Metadata } from 'next';
import './globals.css';
import './svg-assets.css';

export const metadata: Metadata = {
  title: 'Ruoshui Deng — Beneath the Surface',
  description: 'An illustrated journey through computer science, classics and creative projects.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
