'use client';

import { useEffect, useState } from 'react';
import { fetchWithCache } from '@/lib/fetchCache';

import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { AIInsightCard } from '@/components/ai-insight-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Send,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Calendar,
  BarChart3,
  Clock,
  Coffee,
  DollarSign,
  Star,
  PieChart,
  Utensils,
} from 'lucide-react';
import { toast } from 'sonner';

export default function InsightsPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const escapeCsvValue = (value: unknown) => {
    const text = value === null || value === undefined ? '' : String(value);
    return `"${text.replaceAll('"', '""')}"`;
  };

  const buildCsv = (rows: Array<Record<string, unknown>>) => {
    const headers = ['Order ID', 'Date', 'Item Name', 'Category', 'Quantity', 'Price', 'Total'];
    const lines = [headers.map(escapeCsvValue).join(',')];

    rows.forEach((row) => {
      lines.push(
        [
          row.orderId,
          row.date,
          row.itemName,
          row.category,
          row.quantity,
          row.price,
          row.total,
        ].map(escapeCsvValue).join(',')
      );
    });

    return lines.join('\n');
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [{ ok: okAI, json: aiJson }, { ok: okAnalytics, json: analyticsJson }] = await Promise.all([
          fetchWithCache(`${apiBaseUrl}/api/ai/analyze`, { method: 'POST' }),
          fetchWithCache(`${apiBaseUrl}/api/analytics`),
        ]);

        if (okAI) {
          const data = await aiJson();
          setAiInsights(data.data);
        }
        if (okAnalytics) {
          const data = await analyticsJson();
          setAnalytics(data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const savedValue = window.localStorage.getItem('restroai-notifications-enabled');
    setNotificationsEnabled(savedValue === 'true');
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/reports?timeframe=all`);
      if (!response.ok) throw new Error('Failed to fetch report data');
      const result = await response.json();
      const details = result.details;

      if (!details || details.length === 0) {
        alert('No data to export');
        return;
      }

      const normalizedRows = details.map((row: any) => ({
        orderId: row.orderId ?? '',
        date: row.date ? new Date(row.date).toISOString() : '',
        itemName: row.itemName ?? '',
        category: row.category ?? '',
        quantity: row.quantity ?? 0,
        price: Number(row.price ?? 0).toFixed(2),
        total: Number(row.total ?? Number(row.quantity ?? 0) * Number(row.price ?? 0)).toFixed(2),
      }));

      const csvData = buildCsv(normalizedRows);
      const blob = new Blob([`\ufeff${csvData}`], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `restroai_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleTelegramSend = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/telegram/report`, { method: 'POST' });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to send Telegram message');
      }

      toast.success('Telegram message sent.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send Telegram message');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar currentPage="insights" />

      <div className="flex">
        <Sidebar currentPage="insights" />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">AI Insights & Reports</h1>
                <p className="mt-1 text-neutral-600">AI-generated recommendations to boost your business</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={handleExport} disabled={isExporting}>
                  <Download className="h-4 w-4" />
                  {isExporting ? 'Exporting...' : 'Export CSV'}
                </Button>
                <Button className="gap-2 bg-sky-500 hover:bg-sky-600" onClick={handleTelegramSend}>
                  <Send className="h-4 w-4" />
                  Send to Telegram
                </Button>
              </div>
            </div>

            {/* Daily Report Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-sky-500" />
                <h2 className="text-2xl font-bold text-neutral-900">Today&apos;s Report</h2>
                <Badge variant="outline">{today}</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-neutral-600">Today&apos;s Orders</p>
                      <h3 className="mt-2 text-3xl font-bold text-neutral-900">{analytics?.totalOrders || 0}</h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        +18% from yesterday
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-neutral-600">Today&apos;s Revenue</p>
                      <h3 className="mt-2 text-3xl font-bold text-neutral-900">${analytics?.totalRevenue?.toFixed(2) || '0.00'}</h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        +12% from yesterday
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-neutral-600">Avg Order Value</p>
                      <h3 className="mt-2 text-3xl font-bold text-neutral-900">$15.32</h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        +5% from yesterday
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                      <PieChart className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* AI Daily Insights */}
              <div className="space-y-3">
                <h3 className="font-semibold text-neutral-900">AI Insights for Today</h3>
                {isLoading ? (
                  <Card className="p-6 text-center text-neutral-500">Generating insights...</Card>
                ) : aiInsights?.recommendations ? (
                  aiInsights.recommendations.map((rec: any, idx: number) => (
                    <AIInsightCard
                      key={idx}
                      title={rec.title}
                      description={rec.description}
                      type={rec.type}
                    />
                  ))
                ) : (
                  <Card className="p-6 text-center text-neutral-500">No insights available.</Card>
                )}
              </div>
            </div>

            {/* Weekly Analytics */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-neutral-900">Weekly Analytics</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-6">
                  <h3 className="mb-4 font-semibold text-neutral-900">Top Performing Items This Week</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Burgers', sales: 342, trend: '+18%' },
                      { name: 'Pizza Margherita', sales: 298, trend: '+12%' },
                      { name: 'Fried Chicken', sales: 245, trend: '+8%' },
                      { name: 'Pasta Carbonara', sales: 189, trend: '+22%' },
                      { name: 'Caesar Salad', sales: 156, trend: '-5%' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg bg-neutral-50 p-3">
                        <div>
                          <p className="font-medium text-neutral-900">{item.name}</p>
                          <p className="text-xs text-neutral-500">{item.sales} orders</p>
                        </div>
                        <Badge
                          className={
                            item.trend.includes('+')
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }
                        >
                          {item.trend}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="mb-4 font-semibold text-neutral-900">Recommendations for Next Week</h3>
                  <div className="space-y-3">
                    {[
                      'Increase burger stock by 20% - strong demand trend',
                      'Launch Caesar Salad promotion - sales declining',
                      'Create Burger + Fries combo deal - high correlation',
                      'Stock up on pasta ingredients - growing popularity',
                      'Run weekend special on chicken wings',
                    ].map((rec, idx) => (
                      <div key={idx} className="flex gap-3 rounded-lg bg-blue-50 p-3">
                        <Sparkles className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
                        <p className="text-sm text-neutral-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Trend Analysis */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-neutral-900">Trend Analysis</h2>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="p-6">
                  <h4 className="mb-3 font-semibold text-neutral-900">Morning Peak (8-10 AM)</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-neutral-600 flex items-center gap-2"><Coffee className="h-4 w-4 text-sky-600" />Coffee sales: <span className="font-bold text-green-600">+35%</span></p>
                    <p className="text-neutral-600 flex items-center gap-2"><Star className="h-4 w-4 text-sky-600" />Breakfast items: <span className="font-bold text-green-600">+28%</span></p>
                    <p className="text-neutral-600 flex items-center gap-2"><DollarSign className="h-4 w-4 text-sky-600" />Avg spend: <span className="font-bold">$8.50</span></p>
                  </div>
                </Card>

                <Card className="p-6">
                  <h4 className="mb-3 font-semibold text-neutral-900">Lunch Rush (12-2 PM)</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-neutral-600 flex items-center gap-2"><Star className="h-4 w-4 text-sky-600" />Burgers: <span className="font-bold text-green-600">+45%</span></p>
                    <p className="text-neutral-600 flex items-center gap-2"><PieChart className="h-4 w-4 text-sky-600" />Pizza: <span className="font-bold text-green-600">+38%</span></p>
                    <p className="text-neutral-600 flex items-center gap-2"><DollarSign className="h-4 w-4 text-sky-600" />Avg spend: <span className="font-bold">$16.75</span></p>
                  </div>
                </Card>

                <Card className="p-6">
                  <h4 className="mb-3 font-semibold text-neutral-900">Dinner Time (6-8 PM)</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-neutral-600 flex items-center gap-2"><Utensils className="h-4 w-4 text-sky-600" />Pasta: <span className="font-bold text-green-600">+32%</span></p>
                    <p className="text-neutral-600 flex items-center gap-2"><Star className="h-4 w-4 text-sky-600" />Premium items: <span className="font-bold text-green-600">+22%</span></p>
                    <p className="text-neutral-600 flex items-center gap-2"><DollarSign className="h-4 w-4 text-sky-600" />Avg spend: <span className="font-bold">$18.90</span></p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Notification Status */}
            <Card className="border-l-4 border-l-sky-500 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-900">Telegram Notifications</h3>
                  <p className="mt-1 text-sm text-neutral-600">
                    Receive daily AI insights and alerts directly on Telegram
                  </p>
                </div>
                <Button
                  className="bg-sky-500 hover:bg-sky-600"
                  onClick={() => {
                    const nextValue = !notificationsEnabled;
                    setNotificationsEnabled(nextValue);
                    window.localStorage.setItem('restroai-notifications-enabled', String(nextValue));
                    toast.success(nextValue ? 'Notifications enabled.' : 'Notifications disabled.');

                    if (nextValue) {
                      handleTelegramSend();
                    }
                  }}
                >
                  {notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
