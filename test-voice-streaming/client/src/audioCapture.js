/**
 * Захват RAW PCM аудио через AudioWorklet/ScriptProcessor
 * Конвертация Float32 -> Int16 PCM для Yandex API
 */

export class AudioCapture {
  constructor() {
    this.audioContext = null;
    this.stream = null;
    this.source = null;
    this.processor = null;
    this.analyser = null;
    this.isRecording = false;
    this.onChunk = null;
    this.chunkCounter = 0;
    this.totalBytes = 0;
    this.microphoneLabel = '';
    this.selectedDeviceId = null;
  }

  async init(deviceId = null) {
    try {
      // Запрашиваем доступ к микрофону
      const constraints = {
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,  // Yandex требует 16kHz
          channelCount: 1     // Mono
        }
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Получаем информацию о микрофоне
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioTrack = this.stream.getAudioTracks()[0];
      const settings = audioTrack.getSettings();
      this.selectedDeviceId = settings.deviceId;
      const device = devices.find(d => d.deviceId === settings.deviceId);
      this.microphoneLabel = device ? device.label : 'Микрофон по умолчанию';

      // Создаём AudioContext
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });

      this.source = this.audioContext.createMediaStreamSource(this.stream);

      // Создаём analyser для визуализации уровня звука
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.source.connect(this.analyser);

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎤 AudioCapture инициализирован');
      console.log('   Микрофон:', this.microphoneLabel);
      console.log('   Sample rate:', this.audioContext.sampleRate, 'Hz');
      console.log('   ⚠️  ВАЖНО: Yandex требует 16000 Hz!');
      if (this.audioContext.sampleRate !== 16000) {
        console.warn('   ⚠️  Sample rate НЕ 16000 Hz - нужен resampling!');
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      return true;
    } catch (error) {
      console.error('❌ Ошибка инициализации AudioCapture:', error);
      throw error;
    }
  }

  start(onChunkCallback) {
    if (this.isRecording) return;

    this.onChunk = onChunkCallback;
    this.isRecording = true;
    this.chunkCounter = 0;
    this.totalBytes = 0;

    // Используем ScriptProcessorNode (deprecated но работает везде)
    // TODO: заменить на AudioWorklet для лучшей производительности
    const bufferSize = 4096;
    this.processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

    this.processor.onaudioprocess = (event) => {
      if (!this.isRecording) return;

      // Получаем Float32 PCM данные
      const float32Data = event.inputBuffer.getChannelData(0);

      // Конвертируем Float32 (-1.0 to 1.0) -> Int16 (-32768 to 32767)
      const int16Data = new Int16Array(float32Data.length);
      for (let i = 0; i < float32Data.length; i++) {
        const sample = Math.max(-1, Math.min(1, float32Data[i]));
        int16Data[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      }

      // Отправляем chunk
      if (this.onChunk) {
        this.chunkCounter++;
        this.totalBytes += int16Data.buffer.byteLength;

        if (this.chunkCounter % 10 === 0) {
          console.log(`📊 Chunk #${this.chunkCounter}, размер: ${int16Data.buffer.byteLength} байт, всего: ${this.totalBytes} байт`);
        }

        this.onChunk(int16Data.buffer);
      }
    };

    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);

    console.log('🔴 Запись началась');
    console.log('   Buffer size:', bufferSize, 'samples');
    console.log('   Sample rate:', this.audioContext.sampleRate, 'Hz');
  }

  stop() {
    if (!this.isRecording) return;

    this.isRecording = false;

    if (this.processor) {
      this.processor.disconnect();
      this.source.disconnect(this.processor);
      this.processor = null;
    }

    console.log('⏸️ Запись остановлена');
    console.log(`📊 ИТОГО: ${this.chunkCounter} chunks, ${this.totalBytes} байт (${(this.totalBytes / 1024).toFixed(2)} KB)`);
  }

  getVolumeLevel() {
    if (!this.analyser) return 0;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    // Вычисляем средний уровень
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const average = sum / bufferLength;
    return (average / 255) * 100; // Возвращаем процент 0-100
  }

  getMicrophoneInfo() {
    return {
      label: this.microphoneLabel,
      sampleRate: this.audioContext ? this.audioContext.sampleRate : 0,
      deviceId: this.selectedDeviceId
    };
  }

  async reinit(deviceId) {
    console.log('🔄 Переинициализация микрофона:', deviceId);

    // Останавливаем текущий стрим
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    // Отключаем analyser если есть
    if (this.analyser && this.source) {
      this.source.disconnect(this.analyser);
    }

    // Закрываем AudioContext
    if (this.audioContext) {
      await this.audioContext.close();
    }

    // Инициализируем заново с новым deviceId
    await this.init(deviceId);

    console.log('✅ Микрофон переинициализирован');
  }

  destroy() {
    this.stop();

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    console.log('🗑️ AudioCapture уничтожен');
  }
}
