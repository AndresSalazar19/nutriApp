import { tokenStorage } from '@/utils/tokenStorage';

const WS_URL = `${process.env.EXPO_PUBLIC_WS_URL}/api/v1`;

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
  private conversationId?: string;
  private onMessage?: (data: SocketMessage) => void;
  private onOpen?: () => void;
  private onClose?: () => void;
  private onError?: (event: Event) => void;

  private closedByUser = false;
  private retries = 0;
  private retryTimer?: ReturnType<typeof setTimeout>;
  private queue: object[] = [];

  async connect(
    conversationId: string,
    onMessage: (data: SocketMessage) => void,
    onOpen?: () => void,
    onClose?: () => void,
    onError?: (event: Event) => void,
  ) {
    this.conversationId = conversationId;
    this.onMessage = onMessage;
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.onError = onError;
    this.closedByUser = false;
    await this.open();
  }

  private async open() {
    const token = await tokenStorage.get();
    if (!token || !this.conversationId) return;

    this.socket = new WebSocket(`${WS_URL}/ws/${this.conversationId}?token=${token}`);

    this.socket.onopen = () => {
      this.retries = 0;
      // Reenvía lo que se escribió mientras la conexión estaba caída
      const pending = [...this.queue];
      this.queue = [];
      pending.forEach((m) => this.socket?.send(JSON.stringify(m)));
      this.onOpen?.();
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        this.onMessage?.(JSON.parse(event.data));
      } catch (err) {
        console.error('Error parseando mensaje', err);
      }
    };

    this.socket.onerror = (event: Event) => this.onError?.(event);

    this.socket.onclose = (event: CloseEvent) => {
      this.onClose?.();
      if (this.closedByUser) return;
      // 1008 = token inválido o expirado: reintentar sería un bucle infinito
      if (event.code === 1008) return;
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (this.retries >= 6) return;
    const delay = Math.min(1000 * 2 ** this.retries, 15000);
    this.retries += 1;
    this.retryTimer = setTimeout(() => void this.open(), delay);
  }

  sendMessage(content: string) {
    this.send({ type: 'message', content });
  }

  sendTyping() {
    this.send({ type: 'typing' });
  }

  sendStopTyping() {
    this.send({ type: 'stop_typing' });
  }

  sendRead() {
    this.send({ type: 'read' });
  }

  private send(data: object) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
      return;
    }
    // Solo los mensajes se encolan; typing/read caducados no tienen sentido
    if ((data as any).type === 'message') this.queue.push(data);
  }

  disconnect() {
    this.closedByUser = true;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.queue = [];
    this.socket?.close();
    this.socket = undefined;
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}
