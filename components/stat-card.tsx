'use client';

import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  unit?: string;
  change?: number;
  icon: React.ReactNode;
  gradient?: 'orange' | 'green' | 'blue' | 'purple';
}

export function StatCard({
  title,
  value,
  unit,
  change,
  icon,
  gradient = 'orange',
}: StatCardProps) {
  const gradients = {
    orange: 'from-sky-500 to-indigo-600',
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-cyan-600',
    purple: 'from-purple-500 to-pink-600',
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-600">{title}</p>
            <div className="mt-2 flex items-baseline gap-1">
              <h3 className="text-3xl font-bold text-neutral-900">{value}</h3>
              {unit && <span className="text-sm text-neutral-500">{unit}</span>}
            </div>
            {change !== undefined && (
              <div className="mt-2 flex items-center gap-1">
                {change >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
                <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(change)}% from last month
                </span>
              </div>
            )}
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${gradients[gradient]} text-white`}>
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
}
