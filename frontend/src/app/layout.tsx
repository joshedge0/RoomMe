import type React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'RoomMe',
  description:
    'Coordinate and collaborate with those you live with.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // temp dummy auth function
  async function auth() {
    return {
      user: {
        id: "temp-id",
        name: "Fake User",
        email: "temp@joshedge.ca",
      },
      expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 hour expiry
    };
  }

  const session = await auth();
  
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <link rel='icon' href='/favicon.ico' sizes='any' />
      </head>
      <body className="bg-background antialiased">
        <div className="w-full max-w-6xl mx-auto">
          <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
              <div className="flex flex-col min-h-screen">
                <Header />
                <div className='grow'>{children}</div>
              </div>
              
              <Toaster
              position="bottom-center" />
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
