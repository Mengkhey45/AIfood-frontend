'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AIInsightCardProps {
  title: string;
  description: string;
  type?: 'recommendation' | 'warning' | 'success' | 'insight';
  icon?: React.ReactNode;
}

export function AIInsightCard({
  title,
  description,
  type = 'insight',
  icon,
}: AIInsightCardProps) {
  const typeStyles = {
    recommendation: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-700',
      icon: <Sparkles className="h-5 w-5" />,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      badge: 'bg-yellow-100 text-yellow-700',
      icon: <AlertCircle className="h-5 w-5" />,
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      badge: 'bg-green-100 text-green-700',
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
    insight: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      badge: 'bg-purple-100 text-purple-700',
      icon: <TrendingUp className="h-5 w-5" />,
    },
  };

  const style = typeStyles[type];

  return (
    <Card className={`border ${style.border} ${style.bg} overflow-hidden transition-all hover:shadow-md`}>
      <div className="flex gap-4 p-4">
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${style.badge}`}>
          {icon || style.icon}
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h4 className="font-semibold text-neutral-900">{title}</h4>
            <Badge variant="outline" className={style.badge}>
              AI
            </Badge>
          </div>
          <p className="text-sm text-neutral-600">{description}</p>
        </div>
      </div>
    </Card>
  );
}
