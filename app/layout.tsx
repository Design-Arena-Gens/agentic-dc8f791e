import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'What do you want?',
  description: 'Share what you want ? succinctly and clearly.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div id="__app__" className="app-shell">
          {children}
        </div>
      </body>
    </html>
  );
}
