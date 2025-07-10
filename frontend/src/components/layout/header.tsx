'use client';

import Navbar from './navbar';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export function Header() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  //const currentTheme = mounted ? resolvedTheme || theme : 'light';

  return (
    <header className='p-4 left-0 right-0 top-0 z-50 flex items-center justify-left border-b border-border bg-background px-6'>
      <div className='flex items-center justify-center mr-16'>
        <h1 className="text-xl font-bold">RoomMe</h1>
      </div>
      <Navbar />
    </header>
  );
}
