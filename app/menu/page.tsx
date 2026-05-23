'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { fetchWithCache, clearFetchCache } from '@/lib/fetchCache';
import { Navbar } from '@/components/navbar';
import { FoodCard } from '@/components/food-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, X, Plus, Minus, Loader2, Megaphone, BarChart3, Settings2, BellRing, Upload, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

interface CategoryItem {
  id: string;
  name: string;
}

export default function MenuPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCart, setShowCart] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePanel, setActivePanel] = useState<'category' | 'menu' | 'promotion' | 'notifications' | 'manage' | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [promotionText, setPromotionText] = useState('Lunch combo: 10% off on burgers and drinks');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchMenu = async () => {
      try {
        const [{ ok: okMenu, json: menuJson }, { ok: okCats, json: catsJson }] = await Promise.all([
          fetchWithCache(`${apiBaseUrl}/api/menu`),
          fetchWithCache(`${apiBaseUrl}/api/menu/categories`),
        ]);

        if (okMenu) {
          const payload = await menuJson();
          const items = Array.isArray(payload) ? payload : payload.data ?? [];
          const normalized = items.map((item: any, index: number) => ({
          id: item.id ?? String(index),
          name: item.name ?? 'Unnamed Item',
          description: item.description ?? 'No description provided.',
          price: Number(item.price ?? 0),
          category: item.category ?? 'Uncategorized',
          image: item.image ?? '/images/placeholder-food.jpg',
          }));

          if (isMounted) setMenuItems(normalized);
        }

        if (okCats) {
          const payload = await catsJson();
          const items = Array.isArray(payload) ? payload : payload.data ?? [];
          const normalizedCategories = items.map((item: any) => ({
            id: item.id ?? item.name,
            name: item.name ?? item.id,
          }));
          if (isMounted) setCategories(normalizedCategories);
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMenu();
    return () => {
      isMounted = false;
    };
  }, [apiBaseUrl]);

  useEffect(() => {
    if (selectedCategory === 'All') return;
    const hasCategory = menuItems.some((item) => item.category === selectedCategory);
    if (!hasCategory) setSelectedCategory('All');
  }, [menuItems, selectedCategory]);

  const availableCategories = useMemo(() => {
    const categoryNames = new Set([
      ...categories.map((item) => item.name),
      ...menuItems.map((item) => item.category),
    ]);
    return ['All', ...Array.from(categoryNames).filter(Boolean)];
  }, [categories, menuItems]);

  const filteredItems =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const handleAddToCart = (item: { id: string; name: string; price: number; quantity: number }) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + item.quantity } : cartItem
        );
      }
      return [...prevCart, item];
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(id);
    } else {
      setCart(cart.map((item) => (item.id === id ? { ...item, quantity } : item)));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    
    try {
      // Find categories for items
      const itemsWithCategory = cart.map(item => {
        const menuItem = menuItems.find(mi => mi.id === item.id);
        return {
          ...item,
          category: menuItem?.category || 'Unknown'
        };
      });

      const response = await fetch(`${apiBaseUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: itemsWithCategory,
          total: Number((cartTotal * 1.1).toFixed(2)),
          status: 'pending',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      // Invalidate orders cache so order list / dashboard updates
      clearFetchCache(`${apiBaseUrl}/api/orders`);

      setCart([]);
      setShowCart(false);
      toast.success('Order placed successfully!', {
        description: 'Your food is being prepared.',
      });
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to place order', {
        description: 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetMenuForm = () => {
    setNewMenuItem({ name: '', description: '', price: '', category: '' });
    setImagePreview('');
  };

  const handleCategoryCreate = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      toast.error('Enter a category name first.');
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/menu/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to create category');

      // Invalidate categories cache
      clearFetchCache(`${apiBaseUrl}/api/menu/categories`);

      setCategories((prev) => {
        if (prev.some((item) => item.name === name)) return prev;
        return [...prev, { id: payload.data?.id ?? name, name }];
      });
      setNewCategoryName('');
      toast.success(payload.message || 'Category created.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create category');
    }
  };

  const handleMenuFileChange = (file?: File) => {
    if (!file) {
      setImagePreview('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleMenuCreate = async () => {
    const name = newMenuItem.name.trim();
    const description = newMenuItem.description.trim();
    const category = newMenuItem.category.trim();
    const price = Number(newMenuItem.price);

    if (!name || !description || !category || Number.isNaN(price) || price <= 0 || !imagePreview) {
      toast.error('Fill all menu fields and upload an image.');
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/menu/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, price, category, image: imagePreview }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to create menu item');

      // Invalidate menu cache so the new item appears in lists
      clearFetchCache(`${apiBaseUrl}/api/menu`);

      const createdItem = payload.data;
      setMenuItems((prev) => [
        {
          id: createdItem?.id ?? String(Date.now()),
          name,
          description,
          price,
          category,
          image: imagePreview,
        },
        ...prev,
      ]);
      setSelectedCategory(category);
      if (!categories.some((item) => item.name === category)) {
        setCategories((prev) => [...prev, { id: category, name: category }]);
      }
      resetMenuForm();
      setActivePanel('manage');
      toast.success(payload.message || 'Menu item created.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create menu item');
    }
  };

  const handleSetPromotion = () => {
    window.localStorage.setItem('restroai-promotion', promotionText);
    toast.success('Promotion saved for this browser.');
  };

  const handleEnableNotifications = () => {
    const nextValue = !notificationsEnabled;
    setNotificationsEnabled(nextValue);
    window.localStorage.setItem('restroai-notifications-enabled', String(nextValue));
    toast.success(nextValue ? 'Notifications enabled.' : 'Notifications disabled.');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar currentPage="menu" />

      {/* Hero Section */}
      <div className="border-b border-neutral-200 bg-linear-to-r from-sky-50 to-indigo-50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold text-neutral-900">Our Menu</h1>
          <p className="mt-2 text-lg text-neutral-600">
            Delicious food made fresh daily. Order now and enjoy!
          </p>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="border-b border-neutral-200 bg-white px-6 py-6" id="manage-menu">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setActivePanel('category')} className="gap-2 bg-sky-500 hover:bg-sky-600">
              <Tag className="h-4 w-4" />
              Create Category
            </Button>
            <Button onClick={() => setActivePanel('menu')} variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Create Menu Item
            </Button>
            <Button onClick={() => setActivePanel('promotion')} variant="outline" className="gap-2">
              <Megaphone className="h-4 w-4" />
              Set Promotion
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/insights">
                <BarChart3 className="h-4 w-4" />
                View Analytics
              </Link>
            </Button>
            <Button onClick={() => setActivePanel('manage')} variant="outline" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Manage Menu
            </Button>
            <Button
              onClick={handleEnableNotifications}
              variant={notificationsEnabled ? 'default' : 'outline'}
              className={`gap-2 ${notificationsEnabled ? 'bg-sky-500 hover:bg-sky-600' : ''}`}
            >
              <BellRing className="h-4 w-4" />
              {notificationsEnabled ? 'Notifications On' : 'Enable Notifications'}
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-4 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Management Center</h3>
                  <p className="text-sm text-neutral-600">Create categories, upload menu items, and manage promotions.</p>
                </div>
                <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                  {menuItems.length} menu items
                </Badge>
              </div>

              {activePanel === 'category' && (
                <div className="space-y-3 rounded-xl border border-sky-100 bg-sky-50/60 p-4">
                  <h4 className="font-semibold text-neutral-900">Create Category</h4>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      value={newCategoryName}
                      onChange={(event) => setNewCategoryName(event.target.value)}
                      placeholder="Example: Burgers"
                      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
                    />
                    <Button onClick={handleCategoryCreate} className="bg-sky-500 hover:bg-sky-600">
                      Save Category
                    </Button>
                  </div>
                </div>
              )}

              {activePanel === 'menu' && (
                <div className="space-y-4 rounded-xl border border-sky-100 bg-sky-50/60 p-4">
                  <h4 className="font-semibold text-neutral-900">Create Menu Item</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={newMenuItem.name}
                      onChange={(event) => setNewMenuItem((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Item name"
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
                    />
                    <input
                      value={newMenuItem.price}
                      onChange={(event) => setNewMenuItem((prev) => ({ ...prev, price: event.target.value }))}
                      placeholder="Price"
                      type="number"
                      step="0.01"
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
                    />
                    <input
                      value={newMenuItem.category}
                      onChange={(event) => setNewMenuItem((prev) => ({ ...prev, category: event.target.value }))}
                      placeholder="Category"
                      list="menu-category-list"
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleMenuFileChange(event.target.files?.[0])}
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <textarea
                    value={newMenuItem.description}
                    onChange={(event) => setNewMenuItem((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Description"
                    rows={3}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
                  />
                  {imagePreview && (
                    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                      <img src={imagePreview} alt="Menu preview" className="h-48 w-full object-cover" />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleMenuCreate} className="bg-sky-500 hover:bg-sky-600">
                      Create Menu Item
                    </Button>
                    <Button variant="outline" onClick={resetMenuForm}>
                      Clear Form
                    </Button>
                  </div>
                </div>
              )}

              {activePanel === 'promotion' && (
                <div className="space-y-3 rounded-xl border border-amber-100 bg-amber-50/60 p-4" id="promotion-panel">
                  <h4 className="font-semibold text-neutral-900">Set Promotion</h4>
                  <textarea
                    value={promotionText}
                    onChange={(event) => setPromotionText(event.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
                  />
                  <Button onClick={handleSetPromotion} className="bg-sky-500 hover:bg-sky-600">
                    Save Promotion
                  </Button>
                </div>
              )}

              {activePanel === 'manage' && (
                <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <h4 className="font-semibold text-neutral-900">Manage Menu</h4>
                  <p className="text-sm text-neutral-600">
                    You can create categories and items here, then scroll below to review the live menu catalog.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-neutral-600">
                    <span className="rounded-full bg-white px-3 py-1">Categories: {availableCategories.length - 1}</span>
                    <span className="rounded-full bg-white px-3 py-1">Items: {menuItems.length}</span>
                    <span className="rounded-full bg-white px-3 py-1">Notifications: {notificationsEnabled ? 'On' : 'Off'}</span>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-4">
              <h3 className="mb-3 font-semibold text-neutral-900">Quick Shortcuts</h3>
              <div className="space-y-2 text-sm text-neutral-600">
                <button className="block w-full rounded-lg border border-neutral-200 px-3 py-2 text-left hover:border-sky-200 hover:bg-sky-50" onClick={() => setActivePanel('category')}>
                  Create a new category
                </button>
                <button className="block w-full rounded-lg border border-neutral-200 px-3 py-2 text-left hover:border-sky-200 hover:bg-sky-50" onClick={() => setActivePanel('menu')}>
                  Upload a new menu item
                </button>
                <button className="block w-full rounded-lg border border-neutral-200 px-3 py-2 text-left hover:border-sky-200 hover:bg-sky-50" onClick={() => setActivePanel('promotion')}>
                  Edit the active promotion
                </button>
              </div>
            </Card>
          </div>

          <datalist id="menu-category-list">
            {availableCategories.filter((category) => category !== 'All').map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="flex gap-6 px-6 py-8">
        {/* Main Content */}
        <div className="flex-1">
          <div className="mx-auto max-w-6xl">
            {/* Category Filter */}
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-neutral-900">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    className={
                      selectedCategory === category
                        ? 'bg-sky-500 hover:bg-sky-600'
                          : 'hover:border-sky-500 hover:text-sky-500'
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Menu Grid */}
            <div id="menu-grid" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {isLoading ? (
                <div className="col-span-full rounded-lg border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
                  Loading menu items...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="col-span-full rounded-lg border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
                  No menu items available yet.
                </div>
              ) : (
                filteredItems.map((item) => (
                  <FoodCard
                    key={item.id}
                    {...item}
                    onAddToCart={handleAddToCart}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Cart Sidebar */}
            <div className="hidden w-80 lg:block">
          <Card className="sticky top-20 overflow-hidden">
            <div className="border-b border-neutral-200 bg-linear-to-r from-sky-500 to-indigo-600 p-4 text-white">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <ShoppingCart className="h-5 w-5" />
                Your Cart
              </h3>
              {cartItemsCount > 0 && (
                <Badge variant="secondary" className="mt-2 w-fit bg-white text-sky-600">
                  {cartItemsCount} items
                </Badge>
              )}
            </div>

            <div className="p-4">
              {cart.length === 0 ? (
                <div className="py-8 text-center">
                  <ShoppingCart className="mx-auto h-12 w-12 text-neutral-300 mb-2" />
                  <p className="text-sm text-neutral-500">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg bg-neutral-50 p-3"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                          <p className="text-xs text-neutral-500">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 rounded border border-neutral-200">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-4 text-center text-xs">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500"
                            onClick={() => handleRemoveFromCart(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                    <div className="mt-4 space-y-3 border-t border-neutral-200 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Subtotal:</span>
                      <span className="font-medium text-neutral-900">${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Tax:</span>
                      <span className="font-medium text-neutral-900">
                        ${(cartTotal * 0.1).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-bold">
                      <span>Total:</span>
                      <span className="text-sky-600">
                        ${(cartTotal * 1.1).toFixed(2)}
                      </span>
                    </div>
                    <Button 
                      className="w-full bg-sky-500 hover:bg-sky-600"
                      onClick={handleCheckout}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Checkout'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Mobile Cart Button */}
        <Button
          onClick={() => setShowCart(!showCart)}
          className="fixed bottom-6 right-6 gap-2 rounded-full bg-sky-500 hover:bg-sky-600 shadow-lg lg:hidden"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartItemsCount > 0 && <span>{cartItemsCount}</span>}
        </Button>

        {/* Mobile Cart Overlay */}
        {showCart && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/50 lg:hidden">
            <Card className="w-full rounded-t-2xl">
              <div className="flex items-center justify-between border-b border-neutral-200 p-4">
                <h3 className="text-lg font-bold">Your Cart</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCart(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="max-h-96 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <p className="text-center text-neutral-500">Your cart is empty</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg bg-neutral-50 p-3"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-neutral-500">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.quantity}x</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFromCart(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                <div className="border-t border-neutral-200 p-4">
                  <div className="mb-3 flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-sky-600">${(cartTotal * 1.1).toFixed(2)}</span>
                  </div>
                  <Button 
                    className="w-full bg-sky-500 hover:bg-sky-600"
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Checkout'
                    )}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
