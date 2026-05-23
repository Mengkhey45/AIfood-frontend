'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, ShoppingCart, BarChart3, Sparkles, Zap, Smartphone, TrendingUp, Bell, Target, Coffee, Handshake } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-neutral-50">
      {/* Navigation */}
      <nav className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-sky-500 to-indigo-600">
              <Coffee className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-neutral-900">RestroAI</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/menu">
              <Button variant="ghost">Menu</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/insights">
              <Button variant="ghost">Insights</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-neutral-900">
              AI-Powered Restaurant <span className="bg-linear-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">Analytics</span>
            </h1>
            <p className="text-xl text-neutral-600">
              Manage your restaurant business smarter. Get real-time orders, analytics, and AI-driven insights.
            </p>
          </div>

            <div className="flex flex-col gap-4 sm:flex-row justify-center">
            <Link href="/menu">
              <Button size="lg" className="w-full bg-sky-500 hover:bg-sky-600 gap-2 sm:w-auto">
                Start Ordering
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                View Dashboard
                <BarChart3 className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold text-neutral-900">Everything You Need</h2>
            <p className="text-neutral-600">Complete solution for restaurant management and growth</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Menu Management */}
              <Card className="overflow-hidden transition-all hover:shadow-lg">
              <div className="bg-linear-to-br from-sky-500 to-indigo-600 p-6 text-white">
                <ShoppingCart className="h-8 w-8" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-neutral-900">Menu Management</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Beautiful food ordering interface with QR code support, cart management, and real-time availability.
                </p>
                <Link href="/menu" className="mt-4 block">
                  <Button variant="outline" className="w-full">
                    Open Menu
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Analytics Dashboard */}
            <Card className="overflow-hidden transition-all hover:shadow-lg">
              <div className="bg-linear-to-br from-green-500 to-emerald-600 p-6 text-white">
                <BarChart3 className="h-8 w-8" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-neutral-900">Live Analytics</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Real-time dashboards showing sales trends, revenue breakdown, popular items, and peak hours.
                </p>
                <Link href="/dashboard" className="mt-4 block">
                  <Button variant="outline" className="w-full">
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </Card>

            {/* AI Insights */}
            <Card className="overflow-hidden transition-all hover:shadow-lg">
              <div className="bg-linear-to-br from-purple-500 to-pink-600 p-6 text-white">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-neutral-900">AI Insights</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Smart AI recommendations based on your sales data, customer behavior, and trends.
                </p>
                <Link href="/insights" className="mt-4 block">
                  <Button variant="outline" className="w-full">
                    View Insights
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="px-6 py-16 bg-neutral-50">
        <div className="mx-auto max-w-6xl space-y-8">
          <h2 className="text-3xl font-bold text-neutral-900">Key Features</h2>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { icon: <Smartphone className="h-6 w-6 text-sky-600" />, title: 'Mobile Responsive', desc: 'Works perfectly on desktop, tablet, and mobile devices' },
              { icon: <BarChart3 className="h-6 w-6 text-sky-600" />, title: 'Real-time Analytics', desc: 'Live dashboard with instant sales and order tracking' },
              { icon: <Zap className="h-6 w-6 text-sky-600" />, title: 'AI Powered', desc: 'Smart recommendations based on sales patterns and trends' },
              { icon: <TrendingUp className="h-6 w-6 text-sky-600" />, title: 'Growth Insights', desc: 'Detailed reports on best-selling items and peak hours' },
              { icon: <Bell className="h-6 w-6 text-sky-600" />, title: 'Smart Alerts', desc: 'Get notified about important trends and opportunities' },
              { icon: <Target className="h-6 w-6 text-sky-600" />, title: 'Targeted Strategies', desc: 'AI-suggested promotions and menu optimizations' },
            ].map((feature, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50">{feature.icon}</div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">{feature.title}</h4>
                    <p className="text-sm text-neutral-600">{feature.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-2xl bg-linear-to-r from-sky-500 to-indigo-600 p-12 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to Transform Your Restaurant?</h2>
          <p className="mt-4 text-lg text-sky-50">
            Start managing orders, tracking sales, and getting AI insights today.
          </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center">
            <Link href="/menu">
              <Button size="lg" className="w-full bg-white text-sky-600 hover:bg-sky-50 sm:w-auto gap-2">
                <ShoppingCart className="h-5 w-5" />
                View Menu
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="w-full border-white text-white hover:bg-sky-600 sm:w-auto gap-2">
                <BarChart3 className="h-5 w-5" />
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-neutral-900">RestroAI</span>
              <span className="text-sm text-neutral-500">© 2024. All rights reserved.</span>
            </div>
            <div className="text-sm text-neutral-500 flex items-center gap-2">
              <Handshake className="h-4 w-4" /> Built with Next.js, Recharts & Tailwind CSS
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
