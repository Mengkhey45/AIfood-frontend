'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchWithCache, clearFetchCache } from '@/lib/fetchCache';

import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  ChefHat,
  CheckCircle2,
  XCircle,
  PackageCheck,
  RefreshCw,
  Search,
  Filter,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

type StatusFilter = 'all' | 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string; borderColor: string }> = {
  pending: {
    label: 'Pending',
    icon: <Clock className="h-4 w-4" />,
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  preparing: {
    label: 'Preparing',
    icon: <ChefHat className="h-4 w-4" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  ready: {
    label: 'Ready',
    icon: <PackageCheck className="h-4 w-4" />,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  completed: {
    label: 'Completed',
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  cancelled: {
    label: 'Cancelled',
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

const NEXT_STATUS: Record<string, string> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'completed',
};

export default function OrdersPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      // For manual refresh or periodic refresh, bypass cache to get latest orders.
      const useCache = !showRefresh;
      let data: any = null;

      if (useCache) {
        const res = await fetchWithCache(`${apiBaseUrl}/api/orders`);
        if (res.ok) data = await res.json();
      } else {
        // Clear relevant cache so subsequent navigations pick up fresh data
        clearFetchCache(`${apiBaseUrl}/api/orders`);
        const response = await fetch(`${apiBaseUrl}/api/orders`);
        if (response.ok) data = await response.json();
      }

      if (data) {
        const sorted = data.sort(
          (a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sorted);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchOrders(), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await fetch(`${apiBaseUrl}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
              : order
          )
        );
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const formatFullTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Stats
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;
  const todayRevenue = orders
    .filter((o) => {
      const orderDate = new Date(o.createdAt).toDateString();
      const today = new Date().toDateString();
      return orderDate === today && o.status !== 'cancelled';
    })
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const statusFilters: { value: StatusFilter; label: string; count?: number }[] = [
    { value: 'all', label: 'All Orders', count: orders.length },
    { value: 'pending', label: 'Pending', count: pendingCount },
    { value: 'preparing', label: 'Preparing', count: preparingCount },
    { value: 'ready', label: 'Ready', count: readyCount },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar currentPage="orders" />

      <div className="flex">
        <Sidebar currentPage="orders" />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">Order Management</h1>
                <p className="mt-1 text-neutral-600">Track and manage all incoming orders</p>
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => fetchOrders(true)}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-sky-500 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Pending</p>
                    <h3 className="mt-1 text-2xl font-bold text-neutral-900">{pendingCount}</h3>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
                    <Clock className="h-5 w-5 text-sky-600" />
                  </div>
                </div>
              </Card>
              <Card className="border-l-4 border-l-blue-500 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Preparing</p>
                    <h3 className="mt-1 text-2xl font-bold text-neutral-900">{preparingCount}</h3>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <ChefHat className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </Card>
              <Card className="border-l-4 border-l-emerald-500 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Ready for Pickup</p>
                    <h3 className="mt-1 text-2xl font-bold text-neutral-900">{readyCount}</h3>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <PackageCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </Card>
              <Card className="border-l-4 border-l-green-500 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Today&apos;s Revenue</p>
                    <h3 className="mt-1 text-2xl font-bold text-neutral-900">
                      ${todayRevenue.toFixed(2)}
                    </h3>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Filters & Search */}
            <Card className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Search */}
                <div className="relative flex-1 md:max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                    type="text"
                    placeholder="Search orders or items..."
                      className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Status Filters */}
                <div className="flex flex-wrap gap-2">
                  <Filter className="h-4 w-4 self-center text-neutral-400" />
                  {statusFilters.map((filter) => (
                    <Button
                      key={filter.value}
                      variant={statusFilter === filter.value ? 'default' : 'outline'}
                      size="sm"
                      className={
                        statusFilter === filter.value
                          ? 'bg-sky-500 hover:bg-sky-600'
                          : 'hover:border-sky-300'
                      }
                      onClick={() => setStatusFilter(filter.value)}
                    >
                      {filter.label}
                      {filter.count !== undefined && (
                        <span
                          className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                            statusFilter === filter.value
                              ? 'bg-white/20 text-white'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {filter.count}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Urgent Alert */}
            {pendingCount > 0 && (
              <div className="flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-sky-600" />
                  <p className="text-sm font-medium text-sky-800">
                  You have <span className="font-bold">{pendingCount}</span> pending order
                  {pendingCount > 1 ? 's' : ''} waiting to be accepted.
                </p>
              </div>
            )}

            {/* Orders List */}
            <div className="space-y-4">
              {isLoading ? (
                <Card className="p-12 text-center">
                  <RefreshCw className="mx-auto h-8 w-8 animate-spin text-neutral-400" />
                  <p className="mt-3 text-neutral-500">Loading orders...</p>
                </Card>
              ) : filteredOrders.length === 0 ? (
                <Card className="p-12 text-center">
                  <ShoppingBag className="mx-auto h-12 w-12 text-neutral-300" />
                  <h3 className="mt-3 text-lg font-semibold text-neutral-700">No orders found</h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    {searchQuery
                      ? 'Try adjusting your search or filters'
                      : 'New orders will appear here when customers place them'}
                  </p>
                </Card>
              ) : (
                filteredOrders.map((order) => {
                  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  const nextStatus = NEXT_STATUS[order.status];
                  const isUpdating = updatingOrderId === order.id;

                  return (
                    <Card
                      key={order.id}
                      className={`overflow-hidden border-l-4 transition-all hover:shadow-md ${config.borderColor}`}
                    >
                      <div className="p-5">
                        {/* Order Header */}
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bgColor}`}
                            >
                              <span className={config.color}>{config.icon}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-neutral-900">
                                  Order #{order.id.slice(-6).toUpperCase()}
                                </h3>
                                <Badge className={`${config.bgColor} ${config.color} border-0`}>
                                  {config.label}
                                </Badge>
                              </div>
                              <p className="mt-0.5 text-xs text-neutral-500">
                                {formatFullTime(order.createdAt)} · {formatTime(order.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {order.status !== 'completed' && order.status !== 'cancelled' && (
                              <>
                                {nextStatus && (
                                  <Button
                                    size="sm"
                                    className="gap-1.5 bg-sky-500 hover:bg-sky-600"
                                    onClick={() => handleStatusUpdate(order.id, nextStatus)}
                                    disabled={isUpdating}
                                  >
                                    {isUpdating ? (
                                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      STATUS_CONFIG[nextStatus]?.icon
                                    )}
                                    Mark as {STATUS_CONFIG[nextStatus]?.label}
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                                  onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                                  disabled={isUpdating}
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="mt-4 rounded-lg bg-neutral-50 p-3">
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-neutral-900">{item.name}</span>
                                  <span className="text-neutral-400">×{item.quantity}</span>
                                  {item.category && (
                                    <Badge
                                      variant="outline"
                                      className="border-neutral-200 text-xs text-neutral-500"
                                    >
                                      {item.category}
                                    </Badge>
                                  )}
                                </div>
                                <span className="font-medium text-neutral-700">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3">
                            <span className="text-sm font-semibold text-neutral-900">Total</span>
                            <span className="text-lg font-bold text-sky-600">
                              ${order.total?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        </div>

                        {/* Status Progress Bar */}
                        {order.status !== 'cancelled' && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between">
                              {['pending', 'preparing', 'ready', 'completed'].map((step, idx) => {
                                const stepIndex = ['pending', 'preparing', 'ready', 'completed'].indexOf(order.status);
                                const isActive = idx <= stepIndex;
                                const isCurrent = idx === stepIndex;

                                return (
                                  <div key={step} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                      <div
                                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                          isActive
                                            ? isCurrent
                                              ? 'bg-sky-500 text-white ring-4 ring-sky-100'
                                              : 'bg-green-500 text-white'
                                            : 'bg-neutral-200 text-neutral-500'
                                        }`}
                                      >
                                        {isActive && !isCurrent ? (
                                          <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                          idx + 1
                                        )}
                                      </div>
                                      <span
                                        className={`mt-1 text-[10px] font-medium ${
                                          isActive ? 'text-neutral-900' : 'text-neutral-400'
                                        }`}
                                      >
                                        {STATUS_CONFIG[step]?.label}
                                      </span>
                                    </div>
                                    {idx < 3 && (
                                      <div
                                        className={`mx-1 h-0.5 w-8 sm:w-12 md:w-16 lg:w-20 ${
                                          idx < stepIndex ? 'bg-green-500' : 'bg-neutral-200'
                                        }`}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
