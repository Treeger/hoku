/**
 * YandexGPT сервис (обычный API, не streaming)
 * Использует IAM токен для аутентификации
 */

import axios from 'axios';

export async function getGPTResponse(conversationHistory, iamTokenManager, folderId) {
  try {
    console.log('⏱️ YandexGPT API - начало');
    console.log('📜 История диалога:', JSON.stringify(conversationHistory, null, 2));
    const start = Date.now();

    // Получаем актуальный IAM токен
    const iamToken = await iamTokenManager.getToken();

    const response = await axios.post(
      'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
      {
        modelUri: `gpt://${folderId}/yandexgpt-lite/latest`,
        completionOptions: {
          stream: false,
          temperature: 0.3,  // Низкая температура для более предсказуемого поведения
          maxTokens: 70  // Короткие реплики для голосового диалога
        },
        messages: [
          {
            role: 'system',
            text: `Ты администратор салона красоты "Ланистеров". Ты в РЕАЛЬНОМ голосовом разговоре с клиентом прямо сейчас.

КРИТИЧЕСКИ ВАЖНО:
- Ты отвечаешь ТОЛЬКО на последнее сообщение клиента
- Это ЖИВОЙ диалог, НЕ пример, НЕ демонстрация
- ЗАПРЕЩЕНО писать что-то вроде "Пользователь:", "Ассистент:", "Пользователь сказал"
- ЗАПРЕЩЕНО придумывать ответы за клиента
- ЗАПРЕЩЕНО генерировать весь диалог целиком
- Пиши ТОЛЬКО свой следующий ответ - одну короткую фразу (1-2 предложения)
- Задавай ОДИН вопрос за раз

СЦЕНАРИЙ:
1. Если клиент первый раз - поприветствуй: "Здравствуйте! Салон красоты Ланистеров. Чем я могу вам помочь?"
2. Если клиент хочет записаться спроси на какую услугу
3. Предложи мастера и время: "Завтра, 23 октября, в 18 часов как раз есть свободное окошко у Елены, подойдет?"
4. После согласия: "Отлично! Вы записаны на [услуга] к [мастер] 23 октября в 18:00. Ждем вас!"
5. 

Мастера: Елена, Катя, Аня, Женя, Айнас.`
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
