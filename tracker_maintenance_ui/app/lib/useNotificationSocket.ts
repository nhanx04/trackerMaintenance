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
    const auth = getAuth()
    if (!auth?.id || !auth?.token) return

    const userId = auth.id
    const token = auth.token
    let ws: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let destroyed = false

    function connect() {
      if (destroyed) return

      // SockJS negotiation — dùng XHR streaming endpoint trực tiếp
      const baseUrl = API_BASE_URL.replace(/\/$/, '')
      const sockUrl = `${baseUrl}/ws-notifications`

      // SockJS tạo WebSocket tới /ws-notifications/info rồi chọn transport.
      // Cách đơn giản nhất: load SockJS từ CDN qua dynamic import hoặc dùng
      // WebSocket trực tiếp nếu server hỗ trợ (Spring Boot có cả hai).
      // Ở đây ta dùng SockJS qua script tag đã được load sẵn (xem ghi chú bên dưới).

      // Kiểm tra SockJS đã available chưa (load từ CDN trong index.html)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SockJSConstructor = (window as any).SockJS as (new (url: string) => WebSocket) | undefined

      if (!SockJSConstructor) {
        console.warn('[WS] SockJS chưa load, thử lại sau 3s')
        reconnectTimer = setTimeout(connect, 3000)
        return
      }

      ws = new SockJSConstructor(sockUrl)

      ws.onopen = () => {
        // Gửi STOMP CONNECT frame
        ws!.send(`CONNECT\nAccept-Version:1.1,1.0\nHeart-Beat:0,0\nAuthorization:Bearer ${token}\n\n\0`)
      }

      ws.onmessage = (event: MessageEvent<string>) => {
        const raw: string = event.data

        // CONNECTED frame → gửi SUBSCRIBE
        if (raw.startsWith('CONNECTED')) {
          ws!.send(`SUBSCRIBE\nid:sub-0\ndestination:/topic/notifications/${userId}\n\n\0`)
          return
        }

        // MESSAGE frame → parse body
        if (raw.startsWith('MESSAGE')) {
          const nullIdx = raw.indexOf('\0')
          const body = nullIdx !== -1 ? raw.slice(0, nullIdx) : raw
          const headerEnd = body.indexOf('\n\n')
          const payload = headerEnd !== -1 ? body.slice(headerEnd + 2) : ''
          try {
            const notification = JSON.parse(payload) as Notification
            onNotificationRef.current(notification)
          } catch {
            // malformed — bỏ qua
          }
        }
      }

      ws.onclose = () => {
        if (!destroyed) {
          reconnectTimer = setTimeout(connect, 5000)
        }
      }

      ws.onerror = () => {
        ws?.close()
      }
    }

    connect()

    return () => {
      destroyed = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      ws?.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
