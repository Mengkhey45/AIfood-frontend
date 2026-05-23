'use client';

import Link from 'next/link';
import { Bell, Menu, ClipboardList, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

interface NavbarProps {
  currentPage?: 'menu' | 'dashboard' | 'insights' | 'orders';
}

export function Navbar({ currentPage }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600">
            <Coffee className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">RestroAI</h1>
            <p className="text-xs text-neutral-500">Smart Restaurant System</p>
          </div>
        </div>

        <div className="hidden gap-2 md:flex">
          <Link href="/menu">
            <Button
              variant={currentPage === 'menu' ? 'default' : 'ghost'}
              className={currentPage === 'menu' ? 'bg-sky-500 hover:bg-sky-600' : ''}
            >
              Menu
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              variant={currentPage === 'dashboard' ? 'default' : 'ghost'}
              className={currentPage === 'dashboard' ? 'bg-sky-500 hover:bg-sky-600' : ''}
            >
              Dashboard
            </Button>
          </Link>
          <Link href="/insights">
            <Button
              variant={currentPage === 'insights' ? 'default' : 'ghost'}
              className={currentPage === 'insights' ? 'bg-sky-500 hover:bg-sky-600' : ''}
            >
              Insights
            </Button>
          </Link>
          <Link href="/orders">
            <Button
              variant={currentPage === 'orders' ? 'default' : 'ghost'}
              className={currentPage === 'orders' ? 'bg-sky-500 hover:bg-sky-600' : ''}
            >
              Orders
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
