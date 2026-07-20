import { WS_URL } from '../../config/api';
import { tokenStorage } from '../../utils/tokenStorage';

export interface SocketMessage {
  type: 'message' | 'typing' | 'stop_typing' | 'read' | 'user_connected' | 'user_disconnected';
  user_id?: string;

  id?: string;
  conversation_id?: string;
  sender_id?: string;
  sender_role?: 'patient' | 'nutritionist' | 'assistant';
  content?: string;
  sent_at?: string;
  read_at?: string;
}

export class ChatSocket {
  private socket?: WebSocket;

  connect(
    conversationId: string,
    onMessage: (data: SocketMessage) => void,
    onOpen?: () => void,
    onClose?: () => void,
    onError?: (event: Event) => void,
  ) {
    const token = tokenStorage.get();

    if (!token) {
      throw new Error('No existe token de autenticación');
    }

    this.socket = new WebSocket(`${WS_URL}/ws/${conversationId}?token=${token}`);

    this.socket.onopen = () => {
      onOpen?.();
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const data: SocketMessage = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error('Error parseando mensaje', err);
      }
    };

    this.socket.onerror = (event: Event) => {
      console.error('WebSocket error');
      onError?.(event);
    };

    this.socket.onclose = () => {
      console.log('WebSocket desconectado');
      onClose?.();
    };
  }

  sendMessage(content: string) {
    this.send({
      type: 'message',
      content,
    });
  }

  sendTyping() {
    this.send({
      type: 'typing',
    });
  }

  sendStopTyping() {
    this.send({
      type: 'stop_typing',
    });
  }

  sendRead() {
    this.send({
      type: 'read',
    });
  }

  private send(data: object) {
    if (!this.socket) return;

    if (this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket aún no está conectado');
      return;
    }

    this.socket.send(JSON.stringify(data));
  }

  disconnect() {
    this.socket?.close();
    this.socket = undefined;
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}
