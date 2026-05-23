'use client';

import { useState } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FoodCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  onAddToCart: (item: { id: string; name: string; price: number; quantity: number }) => void;
}

export function FoodCard({
  id,
  name,
  description,
  price,
  category,
  image,
  onAddToCart,
}: FoodCardProps) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart({ id, name, price, quantity });
    setQuantity(1);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-48 w-full overflow-hidden bg-linear-to-br from-sky-50 to-indigo-50">
        {image && (image.startsWith?.('http') || image.startsWith?.('/') || image.startsWith?.('data:')) ? (
          // remote or local image URL
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">{image}</div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">{name}</h3>
            <p className="text-xs text-neutral-500">{category}</p>
          </div>
          <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
            ${price.toFixed(2)}
          </span>
        </div>

        <p className="mb-4 text-sm text-neutral-600">{description}</p>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-6 text-center text-sm font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={handleAddToCart}
            className="flex-1 gap-2 bg-sky-500 hover:bg-sky-600"
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}
