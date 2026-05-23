
'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type NotificationItem = { id: number; text: string; time: string; read?: boolean }

export function NotificationsPopover({ onClose }: { onClose: () => void }) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = React.useState<boolean>(false)
  const [items, setItems] = React.useState<NotificationItem[]>([])
  const [loading, setLoading] = React.useState<boolean>(true)

  React.useEffect(() => {
    const saved = window.localStorage.getItem('restroai-notifications-enabled')
    setNotificationsEnabled(saved === 'true')
  }, [])

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return
      if (!(e.target instanceof Node)) return
      if (!ref.current.contains(e.target)) onClose()
    }

    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [onClose])

  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')

  const fetchNotifications = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(apiBase ? `${apiBase}/api/notifications` : '/api/notifications')
      if (!res.ok) throw new Error('No notifications endpoint')
      const data = await res.json()
      // accept either array or { data: [...] }
      const list: NotificationItem[] = Array.isArray(data) ? data : data?.data ?? []
      setItems(list)
    } catch (err) {
      // fallback sample items
      setItems([
        { id: 1, text: 'Daily AI insights ready', time: '2h' },
        { id: 2, text: 'New order received (#304)', time: '3h' },
      ])
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  React.useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleToggle = () => {
    const next = !notificationsEnabled
    setNotificationsEnabled(next)
    window.localStorage.setItem('restroai-notifications-enabled', String(next))
    toast.success(next ? 'Notifications enabled.' : 'Notifications disabled.')
  }

  const handleMarkAllRead = () => {
    setItems([])
    toast.success('All notifications marked read.')
  }

  return (
    <div ref={ref} className="absolute right-0 mt-2 w-80 rounded-md border bg-white shadow-lg z-50">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Notifications</h4>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchNotifications}>
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleToggle}>
              {notificationsEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </div>
        <p className="text-xs text-neutral-500 mt-1">Telegram alerts: {notificationsEnabled ? 'On' : 'Off'}</p>
      </div>
      <div className="max-h-56 overflow-auto p-2">
        {loading ? (
          <div className="p-4 text-sm text-neutral-600">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-neutral-600">No notifications</div>
        ) : (
          items.map((n) => (
            <div key={n.id} className="flex items-start gap-2 p-2 hover:bg-neutral-50 rounded">
              <div className="flex-1">
                <div className="text-sm text-neutral-800">{n.text}</div>
                <div className="text-xs text-neutral-500">{n.time} ago</div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-2 border-t flex items-center justify-between">
        <div>
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Mark all read
          </Button>
        </div>
        <div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotificationsPopover
