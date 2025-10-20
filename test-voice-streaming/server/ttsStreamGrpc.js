/**
 * TTS Streaming через gRPC (Yandex SpeechKit v3)
 * Real-time синтез речи
 */

import grpc from '@grpc/grpc-js';
import { SynthesizerClient } from '@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/ai/tts/v3/tts_service.js';

export class TTSStreamGrpc {
  constructor(iamTokenManager, folderId) {
    this.iamTokenManager = iamTokenManager;
    this.folderId = folderId;
    this.tts = null;
  }

  async init() {
    // Создаём SSL credentials для gRPC
    const credentials = grpc.credentials.createSsl();

    // Создаём gRPC клиента напрямую (не через Session)
    this.tts = new SynthesizerClient(
      'tts.api.cloud.yandex.net:443',
      credentials
    );

    console.log('✅ TTS gRPC клиент инициализирован');
  }

  async synthesize(text, onChunk, onComplete) {
    try {
      console.log('⏱️ TTS Streaming - начало');
      console.log(`🔊 Синтезируем: "${text}"`);
      const start = Date.now();

      let chunkCount = 0;
      let totalBytes = 0;

      // Получаем актуальный IAM токен
      const iamToken = await this.iamTokenManager.getToken();

      // Создаём metadata с IAM токеном
      const metadata = new grpc.Metadata();
      metadata.set('authorization', `Bearer ${iamToken}`);

      // Создаём streaming запрос с metadata
      const synthesizeStream = this.tts.utteranceSynthesis({
        model: '',  // Обязательное поле (может быть пустым)
        text: text,
        outputAudioSpec: {
          containerAudio: {
            containerAudioType: 2  // ContainerAudio_ContainerAudioType.OGG_OPUS = 2
          }
        },
        loudnessNormalizationType: 2,  // UtteranceSynthesisRequest_LoudnessNormalizationType.LUFS = 2
        unsafeMode: false,  // Обязательное поле
        hints: [
          {
            voice: 'alena'
          }
        ]
      }, metadata);

      // Обрабатываем incoming audio chunks
      synthesizeStream.on('data', (response) => {
        if (response.audioChunk && response.audioChunk.data) {
          chunkCount++;
          totalBytes += response.audioChunk.data.length;

          // Отправляем chunk через callback
          onChunk(response.audioChunk.data);
        }
      });

      synthesizeStream.on('end', () => {
        const duration = Date.now() - start;
        console.log(`✅ TTS завершено за ${duration}ms`);
        console.log(`📦 Отправлено chunks: ${chunkCount}, байт: ${totalBytes}`);

        onComplete();
      });

      synthesizeStream.on('error', (err) => {
        console.error('❌ Ошибка TTS Stream:', err);
        onComplete();
      });

    } catch (error) {
      console.error('❌ Ошибка TTS:', error);
      throw error;
    }
  }
}
