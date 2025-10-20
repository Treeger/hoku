# 🎤 Real-time Voice Chat (Yandex SpeechKit v3 gRPC)

Streaming голосовой чат с минимальной латентностью (~1.5-2 сек) для создания голосовых ботов и телефонных помощников.

**Готово к интеграции с телефонией** (Voximplant/Zadarma) для создания booking ботов (запись к барберу, салонам, и т.д.)

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
cd client && npm install
```

### 2. Настройка Yandex Cloud

**Создай Service Account:**
1. Перейди в [Yandex Cloud Console](https://console.cloud.yandex.ru)
2. Создай Service Account с ролями:
   - `ai.speechkit-stt.user`
   - `ai.speechkit-tts.user`
   - `ai.languageModels.user`
3. Создай авторизованный ключ (JSON) и сохрани как `server/service-account-key.json`

**Создай `.env`:**
```env
FOLDER_ID=your_folder_id_here
SERVICE_ACCOUNT_KEY_PATH=./server/service-account-key.json
PORT=3000
```

### 3. Запуск

```bash
npm run dev
```

Открой http://localhost:5173

## 📱 Два режима работы

### Push-to-Talk
Зажми и удерживай кнопку микрофона для записи

### Continuous Mode (Auto)
Автоматическое распознавание с Voice Activity Detection (пауза 700ms)

## 🏗️ Архитектура

### Backend (Node.js + gRPC)
- **WebSocket Server** - real-time коммуникация
- **STT Streaming (gRPC)** - Yandex SpeechKit v3, continuous recognition
- **YandexGPT** - генерация ответов
- **TTS Streaming (gRPC)** - Yandex SpeechKit v3, немедленный playback
- **IAM Token Manager** - автообновление токенов

### Frontend (Vite + Web Audio API)
- **AudioCapture** - захват 16kHz PCM mono, ресемплинг из 48kHz
- **AudioPlayer** - streaming playback (начинается при первом chunk)
- **WebSocket Client** - bidirectional связь
- **Chat UI** - мобильный интерфейс

### Структура проекта

```
server/
  ├── index.js              # WebSocket сервер
  ├── iamTokenManager.js    # IAM токены
  ├── sttStreamGrpc.js      # STT gRPC streaming
  ├── ttsStreamGrpc.js      # TTS gRPC streaming
  ├── gptService.js         # YandexGPT
  └── sessionManager.js     # История диалога

client/src/
  ├── main.js              # Main app
  ├── audioCapture.js      # Микрофон + ресемплинг
  ├── audioPlayer.js       # Воспроизведение
  ├── wsClient.js          # WebSocket
  └── ui.js                # UI
```

## ✨ Ключевые особенности

✅ **Низкая латентность** (~1.5-2 сек для коротких фраз)
✅ **Continuous mode** с автоматическим VAD (пауза 700ms)
✅ **Streaming playback** - TTS начинается немедленно при первом chunk
✅ **Эхоподавление** - игнорирование STT во время TTS
✅ **Фильтрация шума** - минимум 5 audio chunks (~0.5 сек)
✅ **gRPC Streaming** - один STT stream на всю сессию (без перезапусков)
✅ **Готово к телефонии** - интеграция с Voximplant/Zadarma

## 🔧 Технические детали

**Аудио формат:**
- STT Input: 16kHz, Mono, LINEAR16 PCM (Int16)
- TTS Output: OGG Opus, streaming chunks

**Поток обработки (Continuous Mode):**
```
Микрофон (48kHz)
  → Ресемплинг → 16kHz PCM chunks (~100ms)
  → WebSocket (base64) → Server
  → gRPC STT Stream (непрерывный, VAD 700ms)
  → Partial результаты (real-time)
  → Final результат → YandexGPT
  → GPT ответ → gRPC TTS Stream
  → OGG chunks → WebSocket → Client
  → Воспроизведение (начинается сразу!)
```

**Латентность (~3.2-4.5 сек общая):**
- Пользователь говорит: 2-3 сек
- VAD пауза: 700ms
- STT→GPT→TTS начало: 500-800ms

## 📚 Для booking бота

Смотри **`ARCHITECTURE.md`** для полной документации:
- Архитектура потока данных
- Решение всех технических проблем
- Оптимизации латентности
- **Расширение для booking системы** (извлечение данных, календарь, summary)
- **Интеграция с телефонией** (Voximplant/Zadarma)
- Production checklist

## 🛠️ Технологии

- **gRPC Streaming** - Yandex SpeechKit v3
- **@grpc/grpc-js** - Node.js gRPC client
- **WebSocket** - real-time коммуникация
- **Web Audio API** - захват и playback
- **YandexGPT** - генерация ответов
- **IAM Tokens** - Service Account аутентификация

## 📄 Лицензия

MIT
