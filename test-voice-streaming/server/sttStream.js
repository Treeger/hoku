/**
 * STT Streaming сервис
 * TODO: Заменить на gRPC Streaming API для минимальной латентности
 * Пока используется REST API v1 с буферизацией
 */

import axios from 'axios';
import { Buffer } from 'buffer';

export class STTStream {
  constructor(apiKey, folderId) {
    this.apiKey = apiKey;
    this.folderId = folderId;
    this.audioChunks = [];
  }

  // Добавляем аудио chunk (Int16 PCM data)
  addChunk(chunk) {
    this.audioChunks.push(chunk);
  }

  // Завершаем запись и получаем финальный результат
  async finalize() {
    try {
      console.log('⏱️ STT API - начало');
      const start = Date.now();

      // Объединяем все chunks в один буфер
      const totalLength = this.audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const audioBuffer = Buffer.concat(this.audioChunks, totalLength);

      console.log(`📦 Собрано аудио: ${audioBuffer.length} байт`);

      // Отправляем через REST API v1 (как OGG для совместимости)
      // TODO: заменить на gRPC streaming с LINEAR16 PCM
      const response = await axios.post(
        `https://stt.api.cloud.yandex.net/speech/v1/stt:recognize` +
        `?folderId=${this.folderId}&lang=ru-RU&format=lpcm&sampleRateHertz=16000`,
        audioBuffer,
        {
          headers: {
            'Authorization': `Api-Key ${this.apiKey}`,
            'Content-Type': 'audio/x-pcm;bit=16;rate=16000',
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );

      const duration = Date.now() - start;
      const recognizedText = response.data.result || '';

      console.log(`✅ STT завершено за ${duration}ms`);
      console.log(`🎤 Распознано: "${recognizedText}"`);

      return recognizedText;

    } catch (error) {
      console.error('❌ Ошибка STT:', error.response?.data || error.message);
      throw error;
    }
  }

  // Очистка буфера
  reset() {
    this.audioChunks = [];
  }
}
