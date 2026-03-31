import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinUserRoom(userId: string) {
    if (this.socket) {
      this.socket.emit('join_user_room', userId);
    }
  }

  joinAdminRoom() {
    if (this.socket) {
      this.socket.emit('join_admin_room');
    }
  }

  onNotification(callback: (notification: any) => void) {
    if (this.socket) {
      this.socket.on('new_notification', callback);
    }
  }

  onUnreadCount(callback: (count: number) => void) {
    if (this.socket) {
      this.socket.on('unread_count', callback);
    }
  }

  onDepositConfirmed(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('deposit_confirmed', callback);
    }
  }

  onCryptoRatesUpdate(callback: (rates: any) => void) {
    if (this.socket) {
      this.socket.on('crypto_rates_update', callback);
    }
  }

  onAdminNotification(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('admin_notification', callback);
    }
  }

  onBroadcast(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('broadcast', callback);
    }
  }

  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export const socketService = new SocketService();
