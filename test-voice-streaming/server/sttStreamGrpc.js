/**
 * STT Streaming через gRPC (Yandex SpeechKit v3)
 * Real-time распознавание речи
 */

import grpc from '@grpc/grpc-js';
import { RecognizerClient } from '@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/ai/stt/v3/stt_service.js';

export class STTStreamGrpc {
  constructor(iamTokenManager, folderId) {
    this.iamTokenManager = iamTokenManager;
    this.folderId = folderId;
    this.stt = null;
    this.recognizeStream = null;
    this.onPartial = null;
    this.onFinal = null;
    this.finalCalled = false; // Флаг чтобы onFinal вызывался только один раз
  }

  async init() {
    // Создаём SSL credentials для gRPC
    const credentials = grpc.credentials.createSsl();

    // Создаём gRPC клиента напрямую (не через Session)
    this.stt = new RecognizerClient(
      'stt.api.cloud.yandex.net:443',
      credentials
    );

    console.log('✅ STT gRPC клиент инициализирован');
  }

  async startRecognition(onPartialResult, onFinalResult) {
    try {
      console.log('⏱️ STT Streaming - начало');
      const start = Date.now();

      this.onPartial = onPartialResult;
      this.onFinal = onFinalResult;
      this.finalCalled = false; // Сброс флага при новом распознавании

      // Получаем актуальный IAM токен
      const iamToken = await this.iamTokenManager.getToken();

      // Создаём metadata с IAM токеном
      const metadata = new grpc.Metadata();
      metadata.set('authorization', `Bearer ${iamToken}`);

      // Создаём bidirectional stream с metadata
      this.recognizeStream = this.stt.recognizeStreaming(metadata);

      // Обработка результатов от сервера
      this.recognizeStream.on('data', (response) => {
        if (response.partial) {
          // Частичный результат (во время говорения)
          const text = response.partial.alternatives?.[0]?.text || '';
          if (text && this.onPartial) {
            console.log('📝 STT Partial:', text);
            this.onPartial(text);
          }
        } else if (response.final) {
          // Финальный результат
          const text = response.final.alternatives?.[0]?.text || '';
          const duration = Date.now() - start;

          console.log(`✅ STT завершено за ${duration}ms`);
          console.log(`🎤 Распознано: "${text}"`);

          // Вызываем onFinal только один раз для каждого распознавания
          // (игнорируем пустые дублирующие final события в течение 200ms)
          if (this.onFinal && !this.finalCalled) {
            this.finalCalled = true;
            this.onFinal(text);

            // Сбрасываем флаг через 200ms для следующего распознавания (continuous mode)
            setTimeout(() => {
              this.finalCalled = false;
              console.log('🔄 STT готов к следующему распознаванию');
            }, 200);
          }
        }
      });

      this.recognizeStream.on('error', (err) => {
        console.error('❌ Ошибка STT Stream:', err);
      });

      this.recognizeStream.on('end', () => {
        console.log('🔚 STT Stream завершён');
      });

      // Отправляем конфигурацию (первое сообщение)
      this.recognizeStream.write({
        sessionOptions: {
          recognitionModel: {
            model: 'general',
            audioFormat: {
              rawAudio: {
                audioEncoding: 'LINEAR16_PCM',
                sampleRateHertz: 16000,
                audioChannelCount: 1
              }
            },
            textNormalization: {
              textNormalization: 'TEXT_NORMALIZATION_ENABLED',
              profanityFilter: false,
              literatureText: false
            },
            languageRestriction: {
              restrictionType: 'WHITELIST',
              languageCode: ['ru-RU']
            },
            audioProcessingType: 'REAL_TIME'
          },
          // Автоматическое определение конца фразы (End of Utterance)
          eouClassifier: {
            defaultClassifier: {
              type: 'DEFAULT',
              maxPauseBetweenWordsHintMs: 700  // Пауза 0.7 сек = конец фразы (быстрая реакция)
            }
          }
        }
      });

    } catch (error) {
      console.error('❌ Ошибка запуска STT:', error);
      throw error;
    }
  }

  addAudioChunk(audioData) {
    if (!this.recognizeStream) {
      console.warn('⚠️ STT Stream не инициализирован');
      return;
    }

    // Отправляем аудио chunk в gRPC stream
    this.recognizeStream.write({
      chunk: {
        data: audioData
      }
    });
  }

  finalize() {
    if (this.recognizeStream) {
      // Сигнализируем конец аудио
      this.recognizeStream.end();
      this.recognizeStream = null;
    }
  }

  reset() {
    this.finalize();
    this.onPartial = null;
    this.onFinal = null;
  }
}
