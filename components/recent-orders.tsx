'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Truck } from 'lucide-react';

interface Order {
  id: string;
  customer?: string;
  items: string[];
  amount: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  time: string;
}

interface RecentOrdersProps {
  orders?: Order[];
}

export function RecentOrders({ orders = [] }: RecentOrdersProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <Truck className="h-4 w-4 text-blue-600" />;
      case 'preparing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <Clock className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>;
      case 'preparing':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Preparing</Badge>;
      case 'ready':
        return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">Ready</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelled</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-neutral-900">Recent Orders</h3>
      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
            No recent orders yet.
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{order.customer ?? 'Guest'}</p>
                    <p className="text-xs text-neutral-500">{order.items.join(', ') || 'No items'}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-900">${order.amount.toFixed(2)}</p>
                  <p className="text-xs text-neutral-500">{order.time}</p>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
