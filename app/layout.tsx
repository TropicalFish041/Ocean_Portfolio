import type { Metadata } from 'next';
import './globals.css';
import './svg-assets.css';

export const metadata: Metadata = {
  title: '“Deep calleth unto deep.”',
  description: 'An illustrated journey through computer science, classics and creative projects.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><head><link rel="preload" as="image" type="image/svg+xml" href="/ocean/night-frame-0.svg" /><link rel="preconnect" href="https://api.fontshare.com" /><link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" /><link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=neco@500,700,900&display=swap" /></head><body>{children}</body></html>;
}
