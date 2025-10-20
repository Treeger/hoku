# 🎤 Test Voice - Голосовой диалог с Yandex SpeechKit

Простой прототип голосового диалога с использованием Yandex SpeechKit для распознавания и синтеза речи на русском языке.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Получение API ключей Yandex Cloud

**📖 Полная инструкция:** см. файл `YANDEX_API_SETUP.md`

Кратко:
1. Зарегистрируйтесь на [cloud.yandex.ru](https://cloud.yandex.ru)
2. Создайте сервисный аккаунт
3. Добавьте роли: `ai.speechkit-stt.user` и `ai.speechkit-tts.user`
4. Создайте API ключ

### 3. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Заполните:

```env
YANDEX_API_KEY=AQVN...ваш_ключ
FOLDER_ID=b1g...ваш_folder_id
PORT=3000
```

### 4. Запуск

```bash
npm start
```

Или для разработки с автоперезагрузкой:

```bash
npm run dev
```

Откройте браузер: **http://localhost:3000**

## 📋 Как использовать

1. **Разрешите доступ к микрофону** при первом запуске
2. **Нажмите и удерживайте** кнопку "Нажми и говори"
3. **Говорите** на русском языке
4. **Отпустите** кнопку
5. **Подождите** - текст будет распознан, AI ответит голосом

### Примеры фраз для тестирования:

- "Привет" → получите приветствие
- "Помоги" / "Что ты умеешь" → информация о возможностях
- "Спасибо" → благодарность
- "Пока" / "До свидания" → прощание
- Любая другая фраза → общий ответ

## 🏗️ Архитектура

### Структура проекта

```
test-voice/
├── server/
│   ├── index.js      # Express сервер + API эндпоинты
│   └── dialog.js     # Логика ответов по ключевым словам
├── public/
│   ├── index.html    # UI интерфейс
│   ├── app.js        # Логика записи и отправки аудио
│   └── style.css     # Стили
├── .env              # API ключи (создать вручную)
├── .env.example      # Пример файла .env
├── package.json
└── README.md
```

### API Endpoints

#### `POST /api/dialog`
Полный цикл диалога: распознавание → логика → синтез

**Request:**
- `FormData` с полем `audio` (WebM/OGG файл)

**Response:**
```json
{
  "userText": "Привет",
  "responseText": "Привет! Как дела?",
  "audio": "base64_encoded_audio"
}
```

#### `POST /api/recognize`
Только распознавание речи (Speech-to-Text)

**Response:**
```json
{
  "text": "распознанный текст"
}
```

#### `POST /api/synthesize`
Только синтез речи (Text-to-Speech)

**Request:**
```json
{
  "text": "Текст для озвучки"
}
```

**Response:** аудио файл (audio/ogg)

## 🔧 Технологии

**Backend:**
- Node.js + Express
- Yandex SpeechKit API (REST)
- Multer (загрузка файлов)
- Axios (HTTP клиент)

**Frontend:**
- Vanilla JavaScript
- MediaRecorder API (запись аудио)
- Fetch API

## 📝 Версия 2: Интеграция с AI

Для второй версии с полноценным AI (YandexGPT, OpenAI, etc.):

1. Замените логику в `server/dialog.js`
2. Добавьте вызов AI API вместо простых правил
3. Передавайте контекст диалога для более умных ответов

Пример интеграции с OpenAI:

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getResponse(recognizedText) {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "Ты дружелюбный голосовой помощник" },
      { role: "user", content: recognizedText }
    ]
  });

  return completion.choices[0].message.content;
}
```

## 🐛 Troubleshooting

### Ошибка "не заданы YANDEX_API_KEY или FOLDER_ID"
- Убедитесь, что создан файл `.env`
- Проверьте правильность ключей в `.env`

### Ошибка доступа к микрофону
- Разрешите доступ к микрофону в браузере
- Используйте HTTPS или localhost

### Аудио не записывается
- Проверьте, что ваш браузер поддерживает MediaRecorder API
- Попробуйте Chrome/Edge (лучшая поддержка)

### Ошибка "Unauthorized" от Yandex API
- Проверьте правильность API ключа
- Убедитесь, что сервисный аккаунт имеет нужные роли
- Проверьте, что Folder ID правильный

## 📚 Полезные ссылки

- [Yandex SpeechKit Documentation](https://cloud.yandex.ru/docs/speechkit/)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [Yandex Cloud Pricing](https://cloud.yandex.ru/docs/speechkit/pricing)

## 📄 Лицензия

MIT

---

**Автор:** Konstantin
**Версия:** 1.0 (базовая логика по ключевым словам)
