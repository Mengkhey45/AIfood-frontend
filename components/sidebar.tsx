'use client';

import Link from 'next/link';
import { Home, BarChart3, Brain, ClipboardList, Settings, LogOut, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  currentPage?: 'dashboard' | 'insights' | 'orders';
}

export function Sidebar({ currentPage }: SidebarProps) {
  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard', id: 'dashboard' },
    { icon: ClipboardList, label: 'Orders', href: '/orders', id: 'orders' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard', id: 'analytics' },
    { icon: Brain, label: 'AI Insights', href: '/insights', id: 'insights' },
    { icon: Settings, label: 'Settings', href: '#', id: 'settings' },
  ];

  return (
    <div className="hidden h-screen w-64 flex-col border-r border-neutral-200 bg-white p-6 md:flex">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600">
          <Coffee className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-neutral-900">RestroAI</h2>
          <p className="text-xs text-neutral-500">Admin Panel</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          return (
            <Link key={item.id} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={`w-full justify-start gap-3 ${
                  isActive ? 'bg-sky-500 hover:bg-sky-600' : 'hover:bg-neutral-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-neutral-200 pt-4">
        <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:bg-red-50">
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
