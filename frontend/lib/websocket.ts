import { WebSocketMessage, SimulationProgressMessage } from '@/types'

class WebSocketService {
  private socket: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000
  private messageCallbacks: Map<string, ((data: any) => void)[]> = new Map()
  private connectionCallbacks: ((connected: boolean) => void)[] = []

  connect() {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.warn('No auth token available for WebSocket connection')
      return
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') || 'ws://localhost:8000'
    const wsUrl = `${baseUrl}/ws?token=${token}`

    try {
      this.socket = new WebSocket(wsUrl)
      this.setupEventHandlers()
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      this.handleReconnection()
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return

    this.socket.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
      this.notifyConnectionCallbacks(true)
    }

    this.socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.socket.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason)
      this.notifyConnectionCallbacks(false)
      this.handleReconnection()
    }

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const callbacks = this.messageCallbacks.get(message.type) || []
    callbacks.forEach(callback => {
      try {
        callback(message.payload)
      } catch (error) {
        console.error('Error in WebSocket message callback:', error)
      }
    })
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect()
      }, this.reconnectInterval * this.reconnectAttempts)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  subscribe<T = any>(messageType: string, callback: (data: T) => void) {
    if (!this.messageCallbacks.has(messageType)) {
      this.messageCallbacks.set(messageType, [])
    }
    this.messageCallbacks.get(messageType)!.push(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.messageCallbacks.get(messageType) || []
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionCallbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.connectionCallbacks.indexOf(callback)
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1)
      }
    }
  }

  private notifyConnectionCallbacks(connected: boolean) {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected)
      } catch (error) {
        console.error('Error in connection callback:', error)
      }
    })
  }

  send(message: WebSocketMessage) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected, cannot send message')
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.messageCallbacks.clear()
    this.connectionCallbacks = []
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }
}

export const websocketService = new WebSocketService()

// Hook for using WebSocket in components
export const useWebSocket = () => {
  return websocketService
}
