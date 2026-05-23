'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchWithCache } from '@/lib/fetchCache';

import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { StatCard } from '@/components/stat-card';
import { SalesTrendChart, PopularItemsChart, RevenueBreakdownChart, PeakHoursChart } from '@/components/charts';
import { AIInsightCard } from '@/components/ai-insight-card';
import { RecentOrders } from '@/components/recent-orders';
import { QRModal } from '@/components/qr-modal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, ShoppingBag, Clock, Zap, Target, QrCode, Download } from 'lucide-react';

export default function DashboardPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
  const [analytics, setAnalytics] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const formatRecentTime = (dateStr?: string) => {
    if (!dateStr) return 'Unknown time';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [{ ok: okAnalytics, json: analyticsJson }, { ok: okAI, json: aiJson }, { ok: okOrders, json: ordersJson }] = await Promise.all([
          fetchWithCache(`${apiBaseUrl}/api/analytics`),
          fetchWithCache(`${apiBaseUrl}/api/ai/analyze`, { method: 'POST' }),
          fetchWithCache(`${apiBaseUrl}/api/orders`),
        ]);

        if (okAnalytics) {
          const data = await analyticsJson();
          setAnalytics(data.data);
        }

        if (okAI) {
          const data = await aiJson();
          setAiInsights(data.data);
        }

        if (okOrders) {
          const data = await ordersJson();
          const sorted = data
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map((order: any) => ({
              id: order.id,
              customer: order.customer ?? order.customerName ?? 'Guest',
              items: (order.items ?? []).map((item: any) => item.name ?? 'Item'),
              amount: order.total ?? 0,
              status: order.status ?? 'pending',
              time: formatRecentTime(order.createdAt),
            }));
          setRecentOrders(sorted);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar currentPage="dashboard" />

      <div className="flex">
        <Sidebar currentPage="dashboard" />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
                <p className="mt-1 text-neutral-600">Welcome back! Here&apos;s your business performance.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Export Report</Button>
                <Button className="bg-sky-500 hover:bg-sky-600">Generate AI Insights</Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Orders"
                value={analytics?.totalOrders?.toString() || '0'}
                icon={<ShoppingBag className="h-6 w-6" />}
                gradient="orange"
              />
              <StatCard
                title="Total Revenue"
                value={`$${analytics?.totalRevenue?.toFixed(2) || '0.00'}`}
                unit="USD"
                icon={<DollarSign className="h-6 w-6" />}
                gradient="green"
              />
              <StatCard
                title="Best Selling Item"
                value={analytics?.bestSellingItem || 'N/A'}
                unit={analytics?.bestSellingItemCount ? `${analytics.bestSellingItemCount} sold` : ''}
                icon={<TrendingUp className="h-6 w-6" />}
                gradient="blue"
              />
              <StatCard
                title="Peak Ordering Time"
                value={analytics?.peakHour || 'N/A'}
                unit="Avg"
                icon={<Clock className="h-6 w-6" />}
                gradient="purple"
              />
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
              <SalesTrendChart data={analytics?.charts?.salesTrend} />
              <PopularItemsChart data={analytics?.charts?.popularItems} />
              <PeakHoursChart data={analytics?.charts?.peakHours} />
              <RevenueBreakdownChart data={analytics?.charts?.revenueBreakdown} />
            </div>

            {/* AI Insights Section */}
            <div>
              <h2 className="mb-4 text-2xl font-bold text-neutral-900">AI Insights & Recommendations</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {aiInsights?.recommendations ? (
                  aiInsights.recommendations.map((rec: any, idx: number) => (
                    <AIInsightCard
                      key={idx}
                      title={rec.title}
                      description={rec.description}
                      type={rec.type}
                    />
                  ))
                ) : (
                  <div className="col-span-2 rounded-lg bg-white p-6 text-center text-neutral-500">
                    {isLoading ? "Generating AI Insights..." : "No insights available yet."}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <RecentOrders orders={recentOrders} />

            {/* Additional Insights */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-900">
                <Zap className="h-5 w-5 text-sky-500" />
                Quick Actions
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link href="/menu#promotion-panel">
                    <Target className="h-4 w-4" />
                    Set Promotions
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link href="/insights">
                    <TrendingUp className="h-4 w-4" />
                    View Analytics
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link href="/menu#manage-menu">
                    <ShoppingBag className="h-4 w-4" />
                    Manage Menu
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start gap-2 border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                  onClick={() => setIsQRModalOpen(true)}
                >
                  <QrCode className="h-4 w-4" />
                  Generate QR Menu
                </Button>
              </div>
            </Card>

            <QRModal 
              isOpen={isQRModalOpen} 
              onClose={() => setIsQRModalOpen(false)} 
              menuUrl={typeof window !== 'undefined' ? `${window.location.origin}/menu` : 'http://localhost:3000/menu'} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
