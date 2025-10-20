/**
 * WebSocket сервер для streaming голосового диалога
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import IAMTokenManager from './iamTokenManager.js';
import { STTStreamGrpc } from './sttStreamGrpc.js';
import { TTSStreamGrpc } from './ttsStreamGrpc.js';
import { getGPTResponse } from './gptService.js';
import {
  createSession,
  getSession,
  addMessage,
  getConversationHistory
} from './sessionManager.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const FOLDER_ID = process.env.FOLDER_ID;
const SERVICE_ACCOUNT_KEY_PATH = process.env.SERVICE_ACCOUNT_KEY_PATH || join(__dirname, 'service-account-key.json');

// Проверка переменных окружения
if (!FOLDER_ID) {
  console.error('❌ Ошибка: не задан FOLDER_ID');
  process.exit(1);
}

// Инициализация IAM Token Manager
let iamTokenManager;
try {
  iamTokenManager = new IAMTokenManager(SERVICE_ACCOUNT_KEY_PATH);
  await iamTokenManager.init();
} catch (error) {
  console.error('❌ Ошибка инициализации IAM Token Manager:', error.message);
  console.error('   Убедитесь что файл service-account-key.json создан');
  process.exit(1);
}

// Статика из build папки Vite
app.use(express.static(join(__dirname, '../client/dist')));

const server = app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Streaming Voice Chat Server (gRPC)');
  console.log(`📡 WebSocket: ws://localhost:${PORT}`);
  console.log(`🌐 HTTP: http://localhost:${PORT}`);
  console.log('📂 Folder ID:', FOLDER_ID ? '✅' : '❌');
  console.log('🔐 IAM Token:', iamTokenManager ? '✅' : '❌');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// WebSocket сервер
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('👤 Новое подключение');

  // VOXIMPLANT INTEGRATION NOTE:
  // Для интеграции с Voximplant/Zadarma:
  // 1. Вместо браузерного WebSocket подключить Voximplant SDK
  // 2. Получать аудио stream от Voximplant (они отдают PCM 16kHz mono)
  // 3. Отправлять аудио chunks через sttStream.addAudioChunk()
  // 4. TTS chunks отправлять обратно в Voximplant stream
  // Вся логика STT→GPT→TTS уже готова и будет работать идентично

  let sessionId = null;
  let sttStream = null;
  let ttsStream = null;
  let receivedChunksCounter = 0;
  let receivedBytesTotal = 0;
  let isTTSPlaying = false;  // Флаг для игнорирования STT результатов во время TTS

  // Helper функция для запуска STT streaming
  const startSTTStream = async () => {
    if (!sttStream || !sessionId) {
      console.warn('⚠️ STT Stream или сессия не готовы');
      return;
    }

    console.log('⏱️ STT Streaming - запуск');
    receivedChunksCounter = 0;
    receivedBytesTotal = 0;

    // Запускаем распознавание с callbacks
    await sttStream.startRecognition(
      // Callback для partial результатов
      (partialText) => {
        // Игнорируем partial результаты во время TTS (предотвращает эхо)
        if (isTTSPlaying) {
          return;
        }

        ws.send(JSON.stringify({
          type: 'stt_partial',
          text: partialText
        }));
      },
      // Callback для final результата
      async (finalText) => {
        console.log(`📥 ИТОГО получено: ${receivedChunksCounter} chunks, ${receivedBytesTotal} байт`);

        // Игнорируем результаты во время TTS (предотвращает эхо)
        if (isTTSPlaying) {
          console.log('⏸️ Игнорируем STT результат (TTS воспроизводится)');
          return;
        }

        // Фильтруем шум: игнорируем если слишком мало данных (< 5 chunks = ~0.5 сек)
        if (receivedChunksCounter < 5) {
          console.log('⚠️ Слишком мало данных (шум/эхо), игнорируем...');
          // STT продолжает работать в continuous mode, просто игнорируем результат
          return;
        }

        if (!finalText) {
          console.log('⚠️ Пустой результат STT, игнорируем...');
          // STT продолжает работать в continuous mode, просто игнорируем результат
          return;
        }

        // Отправляем финальный распознанный текст
        ws.send(JSON.stringify({
          type: 'stt_result',
          text: finalText
        }));

        // Добавляем в историю
        addMessage(sessionId, 'user', finalText);

        // Получаем ответ от GPT
        const conversationHistory = getConversationHistory(sessionId);
        const gptResponse = await getGPTResponse(
          conversationHistory,
          iamTokenManager,
          FOLDER_ID
        );

        // Отправляем ответ GPT
        ws.send(JSON.stringify({
          type: 'gpt_response',
          text: gptResponse
        }));

        // Добавляем в историю
        addMessage(sessionId, 'assistant', gptResponse);

        // ВАЖНО: Устанавливаем флаг TTS чтобы игнорировать STT результаты (предотвращает эхо)
        console.log('⏸️ Начинается TTS - игнорируем STT');
        isTTSPlaying = true;

        // Синтезируем речь через gRPC streaming
        await ttsStream.synthesize(
          gptResponse,
          // Callback для каждого audio chunk
          (chunk) => {
            ws.send(JSON.stringify({
              type: 'tts_chunk',
              data: chunk.toString('base64')
            }));
          },
          // Callback по завершении
          () => {
            ws.send(JSON.stringify({
              type: 'tts_end'
            }));
            console.log('✅ Диалог завершён');

            // ▶️ Сбрасываем флаг TTS и даем небольшую паузу для затихания эха
            setTimeout(() => {
              console.log('▶️ TTS завершён - возобновляем обработку STT');
              isTTSPlaying = false;
            }, 500);
          }
        );
      }
    );
  };

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'init':
          // Инициализация сессии
          sessionId = message.sessionId;
          createSession(sessionId);

          // Создаём gRPC клиенты
          sttStream = new STTStreamGrpc(iamTokenManager, FOLDER_ID);
          ttsStream = new TTSStreamGrpc(iamTokenManager, FOLDER_ID);

          // Инициализируем gRPC сессии
          await sttStream.init();
          await ttsStream.init();

          ws.send(JSON.stringify({
            type: 'init_success',
            sessionId: sessionId
          }));

          console.log(`📱 Сессия инициализирована: ${sessionId}`);

          // Запускаем STT streaming сразу (continuous mode)
          await startSTTStream();

          break;

        case 'audio_chunk':
          // Получаем аудио chunk (Int16 PCM в base64)
          if (!sttStream) {
            console.error('❌ STT Stream не инициализирован');
            return;
          }

          const audioData = Buffer.from(message.data, 'base64');
          receivedChunksCounter++;
          receivedBytesTotal += audioData.length;

          // Отправляем chunk в gRPC stream (stream уже запущен)
          sttStream.addAudioChunk(audioData);

          if (receivedChunksCounter % 10 === 0) {
            console.log(`📥 Получено chunks: ${receivedChunksCounter}, байт: ${receivedBytesTotal}`);
          }
          break;

        case 'audio_end':
          // Пользователь закончил говорить (только для push-to-talk режима)
          console.log('🎤 Пользователь закончил говорить (manual finalize)');

          if (!sttStream) {
            console.warn('⚠️ STT Stream не инициализирован');
            return;
          }

          // Финализируем STT stream (final результат придет через callback)
          // В continuous mode с eou_config это необязательно, но оставляем для совместимости
          sttStream.finalize();
          break;

        default:
          console.warn('⚠️ Неизвестный тип сообщения:', message.type);
      }

    } catch (error) {
      console.error('❌ Ошибка обработки сообщения:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  });

  ws.on('close', () => {
    console.log('👋 Клиент отключился');
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket ошибка:', error);
  });
});
