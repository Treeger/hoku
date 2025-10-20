/**
 * Управление IAM токеном для Yandex Cloud
 * Генерирует JWT из service account key и обменивает на IAM token
 */

import jwt from 'jsonwebtoken';
import axios from 'axios';
import fs from 'fs/promises';

class IAMTokenManager {
  constructor(keyFilePath) {
    this.keyFilePath = keyFilePath;
    this.iamToken = null;
    this.tokenExpiresAt = null;
    this.serviceAccountKey = null;
  }

  async init() {
    // Читаем service account key из файла
    const keyContent = await fs.readFile(this.keyFilePath, 'utf-8');
    this.serviceAccountKey = JSON.parse(keyContent);

    console.log('✅ Service Account Key загружен');
    console.log('   ID:', this.serviceAccountKey.id);
    console.log('   Service Account ID:', this.serviceAccountKey.service_account_id);

    // Получаем первый токен
    await this.refreshToken();
  }

  async getToken() {
    // Если токен истекает через минуту или меньше - обновляем
    if (!this.iamToken || Date.now() >= this.tokenExpiresAt - 60000) {
      await this.refreshToken();
    }

    return this.iamToken;
  }

  async refreshToken() {
    try {
      console.log('🔄 Получение IAM токена...');

      // 1. Генерируем JWT
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        aud: 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
        iss: this.serviceAccountKey.service_account_id,
        iat: now,
        exp: now + 3600 // JWT живёт 1 час
      };

      const jwtToken = jwt.sign(payload, this.serviceAccountKey.private_key, {
        algorithm: 'PS256',
        keyid: this.serviceAccountKey.id
      });

      // 2. Обмениваем JWT на IAM token
      const response = await axios.post(
        'https://iam.api.cloud.yandex.net/iam/v1/tokens',
        {
          jwt: jwtToken
        }
      );

      this.iamToken = response.data.iamToken;

      // IAM token живёт ~12 часов, обновляем через 11 часов
      this.tokenExpiresAt = Date.now() + (11 * 60 * 60 * 1000);

      console.log('✅ IAM токен получен');
      console.log('   Истекает через:', Math.floor((this.tokenExpiresAt - Date.now()) / 1000 / 60), 'минут');

      // Планируем автообновление
      setTimeout(() => {
        this.refreshToken().catch(err => {
          console.error('❌ Ошибка автообновления IAM токена:', err);
        });
      }, 11 * 60 * 60 * 1000);

    } catch (error) {
      console.error('❌ Ошибка получения IAM токена:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default IAMTokenManager;
