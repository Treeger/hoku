/**
 * TTS Streaming сервис
 * TODO: Заменить на gRPC Streaming API для chunked audio
 * Пока используется REST API v1 с последующей нарезкой на chunks
 */

import axios from 'axios';

export class TTSStream {
  constructor(apiKey, folderId) {
    this.apiKey = apiKey;
    this.folderId = folderId;
  }

  // Генерируем речь и отправляем chunks через callback
  async synthesize(text, onChunk, onComplete) {
    try {
      console.log('⏱️ TTS API - начало');
      console.log(`🔊 Синтезируем: "${text}"`);
      const start = Date.now();

      const response = await axios.post(
        'https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize',
        null,
        {
          headers: {
            'Authorization': `Api-Key ${this.apiKey}`,
          },
          params: {
            text: text,
            lang: 'ru-RU',
            voice: 'alena',
            speed: 1.0,
            format: 'oggopus',
            folderId: this.folderId,
          },
          responseType: 'arraybuffer'
        }
      );

      const duration = Date.now() - start;
      console.log(`✅ TTS завершено за ${duration}ms`);

      const audioBuffer = Buffer.from(response.data);
      console.log(`📦 Размер аудио: ${audioBuffer.length} байт`);

      // Нарезаем на chunks для имитации streaming
      // TODO: заменить на настоящий gRPC streaming
      const chunkSize = 4096;
      for (let i = 0; i < audioBuffer.length; i += chunkSize) {
        const chunk = audioBuffer.slice(i, Math.min(i + chunkSize, audioBuffer.length));
        await onChunk(chunk);
      }

      onComplete();

    } catch (error) {
      console.error('❌ Ошибка TTS:', error.response?.data || error.message);
      throw error;
    }
  }
}
