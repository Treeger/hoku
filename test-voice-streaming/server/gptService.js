/**
 * YandexGPT сервис (обычный API, не streaming)
 * Использует IAM токен для аутентификации
 */

import axios from 'axios';

export async function getGPTResponse(conversationHistory, iamTokenManager, folderId) {
  try {
    console.log('⏱️ YandexGPT API - начало');
    const start = Date.now();

    // Получаем актуальный IAM токен
    const iamToken = await iamTokenManager.getToken();

    const response = await axios.post(
      'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
      {
        modelUri: `gpt://${folderId}/yandexgpt-lite/latest`,
        completionOptions: {
          stream: false,
          temperature: 0.7,
          maxTokens: 40  // Очень короткие ответы для минимальной задержки
        },
        messages: [
          {
            role: 'system',
            text: 'Ты дружелюбный голосовой помощник. Отвечай очень кратко и естественно, как в живом разговоре. Используй простые короткие фразы.'
          },
          ...conversationHistory
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${iamToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.result.alternatives[0].message.text;
    const duration = Date.now() - start;

    console.log(`✅ YandexGPT завершено за ${duration}ms`);
    console.log(`🤖 GPT ответил: ${aiResponse}`);

    return aiResponse;

  } catch (error) {
    console.error('❌ Ошибка YandexGPT:', error.response?.data || error.message);
    throw error;
  }
}
