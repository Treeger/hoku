# Streaming Voice Chat Architecture

## Обзор

Это real-time голосовой чат с минимальной латентностью (~1-1.5 сек), построенный на **Yandex SpeechKit v3 gRPC API**.

Архитектура готова для интеграции с телефонией (Voximplant/Zadarma) для создания голосовых ботов (например, бот для записи к барберу).

## Технологический стек

### Backend
- **Node.js** с ES modules
- **@grpc/grpc-js** - gRPC клиент для Node.js
- **@yandex-cloud/nodejs-sdk** - официальный SDK (используем только generated proto файлы)
- **WebSocket (ws)** - real-time коммуникация с клиентом
- **IAM Token Manager** - автоматическое обновление токенов для Yandex Cloud

### Frontend
- **Vite** - dev сервер и сборка
- **Web Audio API** - захват и воспроизведение аудио
- **WebSocket API** - коммуникация с сервером

### Yandex Cloud Services
- **SpeechKit v3 STT (gRPC Streaming)** - распознавание речи в реальном времени
- **SpeechKit v3 TTS (gRPC Streaming)** - синтез речи в реальном времени
- **YandexGPT** - генерация ответов (REST API)

## Архитектура потока данных

```
┌─────────────┐                    ┌──────────────┐                  ┌─────────────────┐
│   Browser   │                    │   WebSocket  │                  │  Yandex Cloud   │
│             │◄──────────────────►│    Server    │◄────────────────►│                 │
│ AudioCapture│  WebSocket         │  (Node.js)   │  gRPC Streaming  │ STT v3 (gRPC)   │
│ AudioPlayer │                    │              │                  │ TTS v3 (gRPC)   │
│             │                    │              │  REST API        │ YandexGPT       │
└─────────────┘                    └──────────────┘                  └─────────────────┘
```

### Поток обработки диалога (Continuous Mode)

1. **Микрофон → Browser AudioCapture**
   - Захват аудио через `getUserMedia()`
   - Ресемплинг 48kHz → 16kHz
   - Конвертация Float32 → Int16 PCM
   - Chunks по ~100ms

2. **Browser → WebSocket → Server**
   - Base64 encoding chunks
   - Передача по WebSocket
   - Сообщения типа `audio_chunk`

3. **Server → Yandex STT (gRPC bidirectional stream)**
   - Непрерывный gRPC stream (один на всю сессию)
   - Automatic VAD (Voice Activity Detection) с паузой 700ms
   - Partial результаты в реальном времени
   - Final результат после паузы

4. **STT Result → YandexGPT**
   - Отправка контекста разговора
   - Получение ответа через REST API
   - Добавление в историю сессии

5. **GPT Response → Yandex TTS (gRPC server stream)**
   - Текст ответа → gRPC streaming синтез
   - Получаем OGG Opus chunks
   - Немедленная отправка клиенту

6. **Server → WebSocket → Browser AudioPlayer**
   - Streaming chunks клиенту
   - **Важно**: Воспроизведение начинается сразу при первом chunk (не ждем окончания синтеза)
   - Декодирование OGG → AudioBuffer → playback

## Ключевые технические решения

### 1. Direct gRPC Client Creation (обход Session wrapper)

**Проблема**: Официальный SDK Session wrapper добавляет латентность и сложность.

**Решение**: Прямое создание gRPC клиентов из generated proto файлов.

```javascript
import { RecognizerClient } from '@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/ai/stt/v3/stt_service.js';
import { SynthesizerClient } from '@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/ai/tts/v3/tts_service.js';

const credentials = grpc.credentials.createSsl();
const stt = new RecognizerClient('stt.api.cloud.yandex.net:443', credentials);
const tts = new SynthesizerClient('tts.api.cloud.yandex.net:443', credentials);
```

### 2. IAM Token Authentication

Service Account JWT → IAM Token с автообновлением каждые 10 часов:

```javascript
class IAMTokenManager {
  async refreshToken() {
    const jwtToken = jwt.sign(payload, privateKey, {
      algorithm: 'PS256',
      keyid: serviceAccountKeyId
    });
    const response = await axios.post(
      'https://iam.api.cloud.yandex.net/iam/v1/tokens',
      { jwt: jwtToken }
    );
    this.iamToken = response.data.iamToken;
  }
}
```

### 3. Continuous STT Stream (без перезапусков)

**Ключевое решение**: Один STT stream на всю сессию, работает непрерывно.

```javascript
// Инициализация один раз при подключении
await sttStream.startRecognition(onPartial, onFinal);

// Постоянно отправляем audio chunks в один stream
ws.on('message', (data) => {
  if (message.type === 'audio_chunk') {
    sttStream.addAudioChunk(audioData);
  }
});
```

**Важно**:
- НЕ вызываем `finalize()` между фразами
- НЕ пересоздаем stream
- VAD автоматически определяет конец фразы

### 4. Automatic Voice Activity Detection (VAD)

Конфигурация EOU (End of Utterance) classifier:

```javascript
{
  sessionOptions: {
    eouClassifier: {
      defaultClassifier: {
        type: 'DEFAULT',
        maxPauseBetweenWordsHintMs: 700  // Критически важно для низкой латентности!
      }
    }
  }
}
```

**Оптимизация**: Снижение паузы с 1200ms → 700ms дало **2x ускорение** отклика.

### 5. Предотвращение эха и ложных срабатываний

**Проблема**: STT распознает звук из динамиков (TTS playback) и фоновый шум.

**Решение 1**: Фильтрация шума по минимальному количеству chunks:

```javascript
if (receivedChunksCounter < 5) {  // ~0.5 секунды
  console.log('Шум/эхо, игнорируем');
  return;
}
```

**Решение 2**: Игнорирование STT результатов во время TTS:

```javascript
let isTTSPlaying = false;

// Final callback STT
if (isTTSPlaying) {
  console.log('Игнорируем STT (TTS воспроизводится)');
  return;
}

// Перед TTS
isTTSPlaying = true;

// После TTS (с задержкой для затихания эха)
setTimeout(() => {
  isTTSPlaying = false;
}, 500);
```

### 6. Предотвращение дублирующих STT callbacks

**Проблема**: Yandex STT отправляет несколько final событий для одного распознавания:
1. Final с текстом
2. Final пустой (EOU marker)

**Решение**: Debounce flag с автосбросом:

```javascript
// В sttStreamGrpc.js
if (this.onFinal && !this.finalCalled) {
  this.finalCalled = true;
  this.onFinal(text);

  // Сбрасываем через 200ms для следующего распознавания
  setTimeout(() => {
    this.finalCalled = false;
  }, 200);
}
```

### 7. Немедленное воспроизведение TTS (streaming playback)

**Проблема**: Ожидание всех TTS chunks перед воспроизведением добавляло 0.5-1 сек латентности.

**Решение**: Начинаем playback сразу при первом chunk:

```javascript
// audioPlayer.js
async addChunk(base64Data) {
  this.audioChunks.push(bytes.buffer);

  // Начинаем воспроизведение сразу при первом chunk
  if (this.audioChunks.length === 1 && !this.isPlaying) {
    this.play();
  }
}
```

### 8. camelCase поля в gRPC запросах

**Критически важно**: JavaScript SDK использует camelCase (НЕ snake_case как в документации!)

```javascript
// ❌ Неправильно (из документации):
{
  output_audio_spec: { ... },
  loudness_normalization_type: 2
}

// ✅ Правильно (JavaScript SDK):
{
  outputAudioSpec: { ... },
  loudnessNormalizationType: 2
}
```

## Итоговая латентность

| Этап | Время |
|------|-------|
| Пользователь говорит | ~2-3 сек |
| Пауза для VAD | 700ms |
| STT → GPT → TTS начало | ~500-800ms |
| **Общее время до начала ответа** | **~3.2-4.5 сек** |

Для коротких фраз (2-3 слова): **~1.5-2 сек**

## Интеграция с телефонией (Voximplant/Zadarma)

### Текущая архитектура готова к интеграции

Вместо WebSocket + браузер:

1. **Входящий звонок** → Voximplant SDK получает audio stream
2. **Voximplant → Server**:
   - PCM 16kHz mono chunks (уже правильный формат!)
   - Вместо WebSocket можно использовать прямое подключение или HTTP callbacks
3. **Server**:
   - `sttStream.addAudioChunk(audioData)` - **без изменений!**
   - Вся логика STT→GPT→TTS работает идентично
4. **TTS chunks → Voximplant stream** - отправляем обратно в телефонию

### Код для интеграции (концептуально)

```javascript
// Вместо WebSocket
voximplantCall.on('audio', (audioChunk) => {
  sttStream.addAudioChunk(audioChunk);
});

// TTS chunks отправляем в звонок
await ttsStream.synthesize(gptResponse,
  (chunk) => {
    voximplantCall.sendAudio(chunk);
  }
);
```

## Расширение для Booking системы (барбер, салон, и т.д.)

### Архитектурные дополнения

1. **Context-aware промпты для GPT**
```javascript
const systemPrompt = `
Ты - голосовой помощник барбершопа "Стиль".
Твоя задача:
1. Поприветствовать клиента
2. Узнать имя, телефон, желаемую услугу
3. Предложить свободные слоты
4. Записать на выбранное время
5. Подтвердить запись

Доступные мастера: Иван, Петр, Сергей
Время работы: 9:00-21:00, пн-вс
Услуги: стрижка (30 мин), стрижка+борода (45 мин), укладка (20 мин)
`;
```

2. **Извлечение данных из диалога**
```javascript
// После каждого ответа GPT
const extractedData = {
  clientName: extractName(conversationHistory),
  clientPhone: extractPhone(conversationHistory),
  service: extractService(conversationHistory),
  preferredDate: extractDate(conversationHistory),
  preferredTime: extractTime(conversationHistory)
};
```

3. **Интеграция с календарем/CRM**
```javascript
// Проверка доступности слотов
const availableSlots = await getAvailableSlots(date, service);

// Добавляем в контекст для GPT
conversationHistory.push({
  role: 'system',
  text: `Свободные слоты на ${date}: ${availableSlots.join(', ')}`
});

// Подтверждение записи
if (allDataCollected) {
  await createBooking({
    name: extractedData.clientName,
    phone: extractedData.clientPhone,
    service: extractedData.service,
    dateTime: `${extractedData.preferredDate} ${extractedData.preferredTime}`,
    masterId: selectedMaster
  });
}
```

4. **Session резюме (summary) диалога**
```javascript
// После завершения звонка
const summary = await generateSummary(conversationHistory);
// summary: "Клиент Иван Петров, тел +79991234567, записан на стрижку+борода
//           к мастеру Сергей на 15 марта в 14:00. Предпочитает короткие стрижки."

await saveCallSummary({
  sessionId,
  duration: callDuration,
  summary: summary,
  bookingCreated: true,
  extractedData
});
```

### Дополнительные модули для booking

```
server/
  ├── bookingManager.js      # Управление записями
  ├── calendarService.js     # Интеграция с Google Calendar / iCal
  ├── crmService.js          # Сохранение клиентов в CRM
  ├── dataExtractor.js       # Извлечение имени/телефона/даты из текста
  ├── summaryGenerator.js    # Генерация резюме разговора
  └── notificationService.js # SMS/Email подтверждения
```

## Важные переменные окружения

```env
# Yandex Cloud
FOLDER_ID=b1g...            # Folder ID в Yandex Cloud
SERVICE_ACCOUNT_KEY_PATH=./server/service-account-key.json

# Service Account должен иметь роли:
# - ai.speechkit-stt.user
# - ai.speechkit-tts.user
# - ai.languageModels.user
```

## Известные проблемы и решения

### 1. Request message serialization failure
**Причина**: snake_case вместо camelCase
**Решение**: Используй camelCase для всех полей

### 2. Unknown role 'good' for voice
**Причина**: Параметр `role` не поддерживается
**Решение**: Убрать `role`, оставить только `voice: 'alena'`

### 3. Двойные final callbacks
**Причина**: Yandex отправляет multiple final events
**Решение**: Debounce flag с автосбросом через 200ms

### 4. RST_STREAM errors
**Причина**: Попытка finalize stream пока клиент шлет chunks
**Решение**: НЕ вызывать finalize, использовать continuous mode

### 5. Эхо и ложные распознавания
**Причина**: STT распознает TTS playback
**Решение**: Флаг `isTTSPlaying` + минимум 5 chunks

## Production Checklist

- [ ] Error handling и retry логика для gRPC
- [ ] Reconnection логика для WebSocket
- [ ] Rate limiting для API запросов
- [ ] Мониторинг латентности (Prometheus/Grafana)
- [ ] Логирование всех диалогов для аудита
- [ ] GDPR compliance (согласие на запись, хранение данных)
- [ ] Backup strategy для IAM токенов
- [ ] Load testing для concurrent sessions
- [ ] SSL/TLS для production WebSocket
- [ ] Health checks и graceful shutdown

## Полезные ссылки

- [Yandex SpeechKit v3 STT Streaming](https://cloud.yandex.ru/docs/speechkit/stt-v3/api-ref/grpc/)
- [Yandex SpeechKit v3 TTS Streaming](https://cloud.yandex.ru/docs/speechkit/tts-v3/api-ref/grpc/)
- [IAM Token для Service Account](https://cloud.yandex.ru/docs/iam/operations/iam-token/create-for-sa)
- [Voximplant Audio Integration](https://voximplant.com/docs/references/websdk)

---

**Следующие шаги для booking бота:**
1. Добавить модуль извлечения данных (имя, телефон, дата/время)
2. Интегрировать с Google Calendar API или собственной БД слотов
3. Реализовать state machine для диалога (сбор данных → подтверждение → запись)
4. Добавить генерацию summary разговора
5. Настроить Voximplant/Zadarma интеграцию
6. Добавить отправку SMS/Email подтверждений
