/**
 * Main entry point - связывает все модули
 */

import { AudioCapture } from './audioCapture.js';
import { AudioPlayer } from './audioPlayer.js';
import { WSClient } from './wsClient.js';
import { ChatUI } from './ui.js';

class VoiceChat {
  constructor() {
    this.audioCapture = new AudioCapture();
    this.audioPlayer = new AudioPlayer();
    this.wsClient = new WSClient();
    this.ui = new ChatUI();
    this.isRecording = false;
    this.volumeInterval = null;
    this.mode = 'push-to-talk'; // 'push-to-talk' или 'continuous'
  }

  async init() {
    try {
      this.ui.setStatus('Инициализация...', 'disconnected');

      // Инициализируем AudioCapture
      await this.audioCapture.init();

      // Инициализируем AudioPlayer
      await this.audioPlayer.init();

      // Подключаемся к WebSocket
      await this.wsClient.connect();

      // Настраиваем WebSocket обработчики
      this.setupWSHandlers();

      // Настраиваем UI обработчики
      this.setupUIHandlers();

      // Загружаем список микрофонов
      await this.loadMicrophones();

      // Отображаем информацию о микрофоне
      const micInfo = this.audioCapture.getMicrophoneInfo();
      this.ui.setMicrophoneInfo(micInfo.label, micInfo.sampleRate);

      // Настраиваем обработчик изменения микрофона
      this.ui.onMicrophoneChange(async (deviceId) => {
        await this.changeMicrophone(deviceId);
      });

      // Запускаем мониторинг уровня звука
      this.startVolumeMonitoring();

      // Настраиваем обработчик переключения режимов
      this.setupModeSwitch();

      this.ui.setStatus('Готов к общению', 'connected');
      console.log('✅ VoiceChat инициализирован');

    } catch (error) {
      console.error('❌ Ошибка инициализации:', error);
      this.ui.setStatus('Ошибка инициализации', 'disconnected');
      this.ui.showError('Не удалось инициализировать приложение. Проверьте доступ к микрофону.');
    }
  }

  setupWSHandlers() {
    this.wsClient.on('onConnect', () => {
      this.ui.setStatus('Готов к общению', 'connected');
    });

    this.wsClient.on('onDisconnect', () => {
      this.ui.setStatus('Переподключение...', 'disconnected');
    });

    this.wsClient.on('onSTTPartial', (text) => {
      // Показываем partial результат в реальном времени
      if (text) {
        this.ui.showPartialText(text);
        if (this.mode === 'continuous') {
          this.ui.setStatus('🎤 Распознаю... (Auto)', 'connected');
        }
      }
    });

    this.wsClient.on('onSTTResult', (text) => {
      this.ui.clearPartialText();
      this.ui.addUserMessage(text);
      this.ui.setStatus('🤖 Думаю...', '');
    });

    this.wsClient.on('onGPTResponse', (text) => {
      this.ui.addAssistantMessage(text);
      this.ui.setStatus('🔊 Генерирую речь...', '');
    });

    this.wsClient.on('onTTSChunk', (base64Data) => {
      // Обновляем статус при первом chunk (начало воспроизведения)
      if (this.audioPlayer.audioChunks.length === 0) {
        this.ui.setStatus('🔊 Воспроизведение...', '');
      }

      this.audioPlayer.addChunk(base64Data);
    });

    this.wsClient.on('onTTSEnd', async () => {
      // Воспроизведение уже началось при первом chunk (см. audioPlayer.addChunk)
      // Просто обновляем UI

      // В continuous mode автоматически продолжаем слушать
      if (this.mode === 'continuous') {
        this.ui.setStatus('🎤 Слушаю...', 'connected');
        this.ui.showPartialText('Говорите...');
      } else {
        this.ui.setStatus('Готов к общению', 'connected');
      }
    });

    this.wsClient.on('onError', (message) => {
      this.ui.showError(message);

      // В continuous mode возвращаемся к слушанию после ошибки
      if (this.mode === 'continuous') {
        setTimeout(() => {
          this.ui.setStatus('🎤 Слушаю... (Auto)', 'connected');
          this.ui.showPartialText('Говорите...');
        }, 2000);
      } else {
        this.ui.setStatus('Ошибка', 'disconnected');
      }
    });
  }

  setupUIHandlers() {
    const micButton = document.getElementById('micButton');

    // Desktop: mousedown/mouseup (только для push-to-talk)
    micButton.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (this.mode === 'push-to-talk') {
        this.startRecording();
      }
    });

    micButton.addEventListener('mouseup', (e) => {
      e.preventDefault();
      if (this.mode === 'push-to-talk') {
        this.stopRecording();
      }
    });

    micButton.addEventListener('mouseleave', () => {
      if (this.isRecording && this.mode === 'push-to-talk') {
        this.stopRecording();
      }
    });

    // Mobile: touchstart/touchend (только для push-to-talk)
    micButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.mode === 'push-to-talk') {
        this.startRecording();
      }
    });

    micButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (this.mode === 'push-to-talk') {
        this.stopRecording();
      }
    });
  }

  setupModeSwitch() {
    const modeInputs = document.querySelectorAll('input[name="mode"]');
    const micButton = document.getElementById('micButton');

    modeInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        this.mode = e.target.value;
        console.log('🔄 Режим изменён на:', this.mode);

        if (this.mode === 'continuous') {
          // Continuous mode - автоматически начинаем запись
          micButton.style.opacity = '0.5';
          micButton.style.pointerEvents = 'none';

          const micText = micButton.querySelector('.mic-text');
          micText.textContent = 'Режим Auto';

          this.startRecording();
        } else {
          // Push-to-talk mode - останавливаем запись
          micButton.style.opacity = '1';
          micButton.style.pointerEvents = 'auto';

          const micText = micButton.querySelector('.mic-text');
          micText.textContent = 'Нажми и говори';

          if (this.isRecording) {
            this.stopRecording();
          }
        }
      });
    });
  }

  startRecording() {
    if (this.isRecording) return;

    this.isRecording = true;
    this.ui.setRecordingState(true);

    if (this.mode === 'continuous') {
      this.ui.setStatus('🎤 Слушаю... (Auto)', 'connected');
      this.ui.showPartialText('Говорите...');
    } else {
      this.ui.setStatus('🔴 Слушаю...', '');
      this.ui.showPartialText('Говорите...');
    }

    // Начинаем захват аудио
    this.audioCapture.start((audioBuffer) => {
      // Отправляем chunk на сервер
      this.wsClient.sendAudioChunk(audioBuffer);
    });

    console.log('🎤 Запись началась');
  }

  stopRecording() {
    if (!this.isRecording) return;

    this.isRecording = false;
    this.ui.setRecordingState(false);
    this.ui.setStatus('Обработка...', '');
    this.ui.clearPartialText();

    // Останавливаем захват аудио
    this.audioCapture.stop();

    // В push-to-talk режиме сообщаем серверу о конце записи
    // В continuous режиме VAD определяет конец автоматически
    if (this.mode === 'push-to-talk') {
      this.wsClient.sendAudioEnd();
    }

    console.log('⏸️ Запись остановлена');
  }

  startVolumeMonitoring() {
    this.volumeInterval = setInterval(() => {
      const level = this.audioCapture.getVolumeLevel();
      this.ui.updateVolumeBar(level);
    }, 50); // Обновляем 20 раз в секунду
  }

  stopVolumeMonitoring() {
    if (this.volumeInterval) {
      clearInterval(this.volumeInterval);
      this.volumeInterval = null;
      this.ui.updateVolumeBar(0);
    }
  }

  async loadMicrophones() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');

      if (audioInputs.length === 0) {
        console.warn('⚠️ Микрофоны не найдены');
        return;
      }

      const micInfo = this.audioCapture.getMicrophoneInfo();
      this.ui.populateMicrophones(audioInputs, micInfo.deviceId);

      console.log('🎙️ Найдено микрофонов:', audioInputs.length);
    } catch (error) {
      console.error('❌ Ошибка загрузки списка микрофонов:', error);
    }
  }

  async changeMicrophone(deviceId) {
    try {
      console.log('🔄 Смена микрофона на deviceId:', deviceId);
      this.ui.setStatus('Переключение микрофона...', '');

      // Переинициализируем AudioCapture с новым микрофоном
      await this.audioCapture.reinit(deviceId);

      // Обновляем информацию о микрофоне
      const micInfo = this.audioCapture.getMicrophoneInfo();
      this.ui.setMicrophoneInfo(micInfo.label, micInfo.sampleRate);

      this.ui.setStatus('Готов к общению', 'connected');
      console.log('✅ Микрофон успешно изменён');
    } catch (error) {
      console.error('❌ Ошибка смены микрофона:', error);
      this.ui.setStatus('Ошибка смены микрофона', 'disconnected');
      this.ui.showError('Не удалось переключить микрофон');
    }
  }
}

// Инициализация при загрузке страницы
window.addEventListener('DOMContentLoaded', async () => {
  const voiceChat = new VoiceChat();
  await voiceChat.init();
});
