import { useEffect, useRef } from 'react'
import { API_BASE_URL } from '@/lib/api'
import { getAuth } from '@/lib/auth'
import type { Notification } from '@/types/notification'

type Options = {
  onNotification: (n: Notification) => void
}

/**
 * Kết nối WebSocket qua SockJS + STOMP thủ công (không cần @stomp/stompjs).
 * Subscribe kênh /topic/notifications/{userId}.
 * Tự reconnect sau 5 giây nếu mất kết nối.
 */
export function useNotificationSocket({ onNotification }: Options) {
  const onNotificationRef = useRef(onNotification)
  useEffect(() => {
    onNotificationRef.current = onNotification
  }, [onNotification])

  useEffect(() => {
    let destroyed = false
    let ws: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null

    function init() {
      const auth = getAuth()
      if (!auth?.id || !auth?.token) return

      const userId = auth.id
      const token = auth.token

      function connect() {
        if (destroyed) return

        // 🔥 FIX: đóng socket cũ trước khi tạo mới
        if (ws) {
          ws.close()
        }

        const baseUrl = API_BASE_URL.replace(/\/$/, '')
        const sockUrl = `${baseUrl}/ws-notifications?token=${token}`

        const SockJSConstructor = (window as any).SockJS
        if (!SockJSConstructor) {
          reconnectTimer = setTimeout(connect, 3000)
          return
        }

        ws = new SockJSConstructor(sockUrl)
        const socket = ws!

        socket.onopen = () => {
          socket.send(`CONNECT\naccept-version:1.1\nheart-beat:0,0\nAuthorization:Bearer ${token}\n\n\0`)
        }

        socket.onmessage = (event) => {
          const raw = event.data

          if (raw.startsWith('CONNECTED')) {
            socket.send(`SUBSCRIBE\nid:sub-0\ndestination:/topic/notifications/${userId}\n\n\0`)
            return
          }

          if (raw.startsWith('MESSAGE')) {
            const nullIdx = raw.indexOf('\0')
            const body = nullIdx !== -1 ? raw.slice(0, nullIdx) : raw
            const headerEnd = body.indexOf('\n\n')
            const payload = headerEnd !== -1 ? body.slice(headerEnd + 2) : ''

            try {
              const notification = JSON.parse(payload)
              onNotificationRef.current(notification)
            } catch {}
          }
        }

        socket.onclose = () => {
          if (!destroyed) {
            reconnectTimer = setTimeout(connect, 5000)
          }
        }

        socket.onerror = () => {
          socket.close()
        }
      }

      connect()
    }

    init()

    return () => {
      destroyed = true

      if (ws) {
        ws.close()
      }

      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }
    }
  }, [])
}
