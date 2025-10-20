/**
 * WebSocket клиент для связи с сервером
 */

export class WSClient {
  constructor() {
    this.ws = null;
    this.sessionId = null;
    this.handlers = {
      onConnect: null,
      onDisconnect: null,
      onSTTPartial: null,
      onSTTResult: null,
      onGPTResponse: null,
      onTTSChunk: null,
      onTTSEnd: null,
      onError: null
    };
    this.reconnectTimeout = null;
    this.isIntentionalClose = false;
    this.sentChunksCounter = 0;
    this.sentBytesTotal = 0;
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        // Определяем WebSocket URL
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = import.meta.env.DEV
          ? 'ws://localhost:3000'
          : `${protocol}//${host}`;

        console.log('🔌 Подключение к WebSocket:', wsUrl);

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ WebSocket подключен');
          this.isIntentionalClose = false;

          // Генерируем session ID
          this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

          // Отправляем init
          this.send({
            type: 'init',
            sessionId: this.sessionId
          });

          if (this.handlers.onConnect) {
            this.handlers.onConnect();
          }

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('❌ Ошибка парсинга сообщения:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('🔌 WebSocket отключен');

          if (this.handlers.onDisconnect) {
            this.handlers.onDisconnect();
          }

          // Переподключение через 3 секунды
          if (!this.isIntentionalClose) {
            this.reconnectTimeout = setTimeout(() => {
              console.log('🔄 Переподключение...');
              this.connect();
            }, 3000);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket ошибка:', error);
          reject(error);
        };

      } catch (error) {
        console.error('❌ Ошибка подключения:', error);
        reject(error);
      }
    });
  }

  handleMessage(message) {
    switch (message.type) {
      case 'init_success':
        console.log('✅ Сессия инициализирована:', message.sessionId);
        break;

      case 'stt_partial':
        if (this.handlers.onSTTPartial) {
          this.handlers.onSTTPartial(message.text);
        }
        break;

      case 'stt_result':
        console.log('🎤 STT результат:', message.text);
        if (this.handlers.onSTTResult) {
          this.handlers.onSTTResult(message.text);
        }
        break;

      case 'gpt_response':
        console.log('🤖 GPT ответ:', message.text);
        if (this.handlers.onGPTResponse) {
          this.handlers.onGPTResponse(message.text);
        }
        break;

      case 'tts_chunk':
        if (this.handlers.onTTSChunk) {
          this.handlers.onTTSChunk(message.data);
        }
        break;

      case 'tts_end':
        console.log('✅ TTS завершён');
        if (this.handlers.onTTSEnd) {
          this.handlers.onTTSEnd();
        }
        break;

      case 'error':
        console.error('❌ Ошибка от сервера:', message.message);
        if (this.handlers.onError) {
          this.handlers.onError(message.message);
        }
        break;

      default:
        console.warn('⚠️ Неизвестный тип сообщения:', message.type);
    }
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket не подключен');
    }
  }

  sendAudioChunk(arrayBuffer) {
    // Конвертируем ArrayBuffer в base64
    const uint8Array = new Uint8Array(arrayBuffer);
    const binary = String.fromCharCode.apply(null, uint8Array);
    const base64 = btoa(binary);

    this.sentChunksCounter++;
    this.sentBytesTotal += arrayBuffer.byteLength;

    if (this.sentChunksCounter % 10 === 0) {
      console.log(`📤 Отправлено chunks: ${this.sentChunksCounter}, байт: ${this.sentBytesTotal}`);
    }

    this.send({
      type: 'audio_chunk',
      data: base64
    });
  }

  sendAudioEnd() {
    console.log(`📤 ИТОГО отправлено: ${this.sentChunksCounter} chunks, ${this.sentBytesTotal} байт (${(this.sentBytesTotal / 1024).toFixed(2)} KB)`);

    this.send({
      type: 'audio_end'
    });

    // Сброс счётчиков
    this.sentChunksCounter = 0;
    this.sentBytesTotal = 0;
  }

  on(event, handler) {
    this.handlers[event] = handler;
  }

  disconnect() {
    this.isIntentionalClose = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
    }
  }
}
