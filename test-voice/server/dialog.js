/**
 * Модуль логики диалога на основе YandexGPT
 */

import axios from 'axios';

// История диалога (хранится в памяти для простоты)
// В реальном приложении можно хранить в базе данных по sessionId
const conversationHistory = [];

/**
 * Получает ответ от YandexGPT на основе распознанного текста
 * @param {string} recognizedText - распознанный текст от пользователя
 * @returns {Promise<string>} текст ответа для синтеза
 */
export async function getResponse(recognizedText) {
  const YANDEX_API_KEY = process.env.YANDEX_API_KEY;
  const FOLDER_ID = process.env.FOLDER_ID;

  try {
    // Добавляем сообщение пользователя в историю
    conversationHistory.push({
      role: 'user',
      text: recognizedText
    });

    // Ограничиваем историю последними 10 сообщениями
    if (conversationHistory.length > 10) {
      conversationHistory.splice(0, conversationHistory.length - 10);
    }

    // Формируем запрос к YandexGPT
    const response = await axios.post(
      'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
      {
        modelUri: `gpt://${FOLDER_ID}/yandexgpt-lite/latest`,
        completionOptions: {
          stream: false,
          temperature: 0.7,
          maxTokens: 200  // Короткие ответы для голосового диалога
        },
        messages: [
          {
            role: 'system',
            text: 'Ты дружелюбный голосовой помощник. Отвечай кратко и естественно, как в живом разговоре. Используй простые фразы, избегай длинных предложений.'
          },
          ...conversationHistory
        ]
      },
      {
        headers: {
          'Authorization': `Api-Key ${YANDEX_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.result.alternatives[0].message.text;

    // Добавляем ответ AI в историю
    conversationHistory.push({
      role: 'assistant',
      text: aiResponse
    });

    console.log('🤖 YandexGPT ответил:', aiResponse);
    return aiResponse;

  } catch (error) {
    console.error('❌ Ошибка YandexGPT:', error.response?.data || error.message);

    // Fallback на простой ответ при ошибке
    return 'Извините, произошла ошибка. Попробуйте ещё раз.';
  }
}
