import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import { getResponse } from './dialog.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import { tmpdir } from 'os';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const PORT = process.env.PORT || 3000;
const YANDEX_API_KEY = process.env.YANDEX_API_KEY;
const FOLDER_ID = process.env.FOLDER_ID;

// Проверка наличия необходимых переменных окружения
if (!YANDEX_API_KEY || !FOLDER_ID) {
  console.error('❌ Ошибка: не заданы YANDEX_API_KEY или FOLDER_ID');
  console.error('📝 Создайте файл .env на основе .env.example');
  console.error('📖 Инструкция: см. YANDEX_API_SETUP.md');
  process.exit(1);
}

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

/**
 * Конвертация WebM в OGG Opus через ffmpeg
 * @param {Buffer} webmBuffer - WebM данные
 * @returns {Promise<Buffer>} - OGG Opus данные
 */
async function convertWebMToOgg(webmBuffer) {
  const inputPath = join(tmpdir(), `input-${Date.now()}.webm`);
  const outputPath = join(tmpdir(), `output-${Date.now()}.ogg`);

  try {
    // Сохраняем WebM во временный файл
    await fs.writeFile(inputPath, webmBuffer);

    // Конвертируем через ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioCodec('libopus')
        .format('ogg')
        .on('end', () => {
          console.log('✅ Конвертация WebM → OGG завершена');
          resolve();
        })
        .on('error', (err) => {
          console.error('❌ Ошибка ffmpeg:', err);
          reject(err);
        })
        .save(outputPath);
    });

    // Читаем OGG файл
    const oggBuffer = await fs.readFile(outputPath);

    // Удаляем временные файлы
    await fs.unlink(inputPath);
    await fs.unlink(outputPath);

    return oggBuffer;

  } catch (error) {
    // Cleanup при ошибке
    try {
      await fs.unlink(inputPath).catch(() => {});
      await fs.unlink(outputPath).catch(() => {});
    } catch {}
    throw error;
  }
}

/**
 * POST /api/recognize
 * Распознавание речи (Speech-to-Text)
 */
app.post('/api/recognize', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Аудиофайл не предоставлен' });
    }

    console.log('🎤 Получен WebM:', req.file.size, 'байт');

    // Конвертируем WebM в OGG Opus
    console.log('🔄 Конвертация WebM → OGG...');
    const oggBuffer = await convertWebMToOgg(req.file.buffer);
    console.log('📦 Размер OGG:', oggBuffer.length, 'байт');

    // Отправляем OGG как binary data (как в документации)
    const response = await axios.post(
      `https://stt.api.cloud.yandex.net/speech/v1/stt:recognize` +
      `?folderId=${FOLDER_ID}&lang=ru-RU&format=oggopus`,
      oggBuffer,  // Отправляем напрямую как binary!
      {
        headers: {
          'Authorization': `Api-Key ${YANDEX_API_KEY}`,
          'Content-Type': 'audio/ogg',
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    const recognizedText = response.data.result || '';
    console.log('✅ Распознано:', recognizedText);

    res.json({ text: recognizedText });

  } catch (error) {
    console.error('❌ Ошибка распознавания:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Ошибка распознавания речи',
      details: error.response?.data || error.message
    });
  }
});

/**
 * POST /api/synthesize
 * Синтез речи (Text-to-Speech)
 */
app.post('/api/synthesize', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Текст не предоставлен' });
    }

    console.log('🔊 Синтезируем:', text);

    const response = await axios.post(
      'https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize',
      null,
      {
        headers: {
          'Authorization': `Api-Key ${YANDEX_API_KEY}`,
        },
        params: {
          text: text,
          lang: 'ru-RU',
          voice: 'alena',  // Женский голос
          speed: 1.0,
          format: 'oggopus',
          folderId: FOLDER_ID,
        },
        responseType: 'arraybuffer'
      }
    );

    console.log('✅ Синтез завершён');

    res.set('Content-Type', 'audio/ogg');
    res.send(Buffer.from(response.data));

  } catch (error) {
    console.error('❌ Ошибка синтеза:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Ошибка синтеза речи',
      details: error.message
    });
  }
});

/**
 * POST /api/dialog
 * Полный цикл: распознавание → логика → синтез
 */
app.post('/api/dialog', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Аудиофайл не предоставлен' });
    }

    console.log('💬 Начало диалога...');
    console.log('📦 Получен WebM:', req.file.size, 'байт, mimetype:', req.file.mimetype);

    // Конвертируем WebM в OGG Opus
    console.log('⏱️ [1/4] Конвертация WebM → OGG - начало');
    const convertStart = Date.now();
    const oggBuffer = await convertWebMToOgg(req.file.buffer);
    const convertTime = Date.now() - convertStart;
    console.log(`✅ [1/4] Конвертация завершена за ${convertTime}ms`);
    console.log('📦 Размер OGG:', oggBuffer.length, 'байт');

    // 1. Распознавание речи (STT) - отправляем OGG как binary data
    console.log('⏱️ [2/4] STT API - начало');
    const sttStart = Date.now();
    const sttResponse = await axios.post(
      `https://stt.api.cloud.yandex.net/speech/v1/stt:recognize` +
      `?folderId=${FOLDER_ID}&lang=ru-RU&format=oggopus`,
      oggBuffer,  // Отправляем напрямую как binary!
      {
        headers: {
          'Authorization': `Api-Key ${YANDEX_API_KEY}`,
          'Content-Type': 'audio/ogg',
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );
    const sttTime = Date.now() - sttStart;
    console.log(`✅ [2/4] STT API завершено за ${sttTime}ms`);

    const userText = sttResponse.data.result || '';
    console.log('🎤 Пользователь сказал:', userText);

    // 2. Получаем ответ от YandexGPT (теперь async!)
    console.log('⏱️ [3/4] YandexGPT API - начало');
    const gptStart = Date.now();
    const responseText = await getResponse(userText);
    const gptTime = Date.now() - gptStart;
    console.log(`✅ [3/4] YandexGPT API завершено за ${gptTime}ms`);
    console.log('🤖 Ответ:', responseText);

    // 3. Синтез речи (TTS)
    console.log('⏱️ [4/4] TTS API - начало');
    const ttsStart = Date.now();
    const ttsResponse = await axios.post(
      'https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize',
      null,
      {
        headers: {
          'Authorization': `Api-Key ${YANDEX_API_KEY}`,
        },
        params: {
          text: responseText,
          lang: 'ru-RU',
          voice: 'alena',
          speed: 1.0,
          format: 'oggopus',
          folderId: FOLDER_ID,
        },
        responseType: 'arraybuffer'
      }
    );
    const ttsTime = Date.now() - ttsStart;
    console.log(`✅ [4/4] TTS API завершено за ${ttsTime}ms`);

    const totalTime = convertTime + sttTime + gptTime + ttsTime;
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ИТОГО:');
    console.log(`   Конвертация: ${convertTime}ms (${(convertTime/totalTime*100).toFixed(1)}%)`);
    console.log(`   STT API:     ${sttTime}ms (${(sttTime/totalTime*100).toFixed(1)}%)`);
    console.log(`   GPT API:     ${gptTime}ms (${(gptTime/totalTime*100).toFixed(1)}%)`);
    console.log(`   TTS API:     ${ttsTime}ms (${(ttsTime/totalTime*100).toFixed(1)}%)`);
    console.log(`   ОБЩЕЕ ВРЕМЯ: ${totalTime}ms (${(totalTime/1000).toFixed(2)}s)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Кодируем аудио в base64 для отправки клиенту
    const audioBase64 = Buffer.from(ttsResponse.data).toString('base64');

    res.json({
      userText,
      responseText,
      audio: audioBase64
    });

  } catch (error) {
    console.error('❌ Ошибка диалога:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Ошибка обработки диалога',
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log('🚀 Сервер запущен на http://localhost:' + PORT);
  console.log('📁 Статика: public/');
  console.log('🔑 API Key:', YANDEX_API_KEY ? '✅ Установлен' : '❌ Не установлен');
  console.log('📂 Folder ID:', FOLDER_ID ? '✅ Установлен' : '❌ Не установлен');
});
