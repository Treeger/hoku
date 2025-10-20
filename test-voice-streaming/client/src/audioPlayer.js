/**
 * Streaming audio player
 * Воспроизведение audio chunks по мере получения
 */

export class AudioPlayer {
  constructor() {
    this.audioContext = null;
    this.audioChunks = [];
    this.isPlaying = false;
    this.sourceNode = null;
  }

  async init() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    console.log('🔊 AudioPlayer инициализирован');
  }

  async addChunk(base64Data) {
    try {
      // Декодируем base64
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      this.audioChunks.push(bytes.buffer);

      // 🚀 ВАЖНО: Начинаем воспроизведение сразу при первом chunk
      // Не ждем tts_end - это сокращает latency!
      if (this.audioChunks.length === 1 && !this.isPlaying) {
        console.log('🚀 Первый TTS chunk получен, начинаем воспроизведение немедленно');
        this.play();
      }
    } catch (error) {
      console.error('❌ Ошибка добавления audio chunk:', error);
    }
  }

  async play() {
    if (this.audioChunks.length === 0) {
      console.warn('⚠️ Нет audio chunks для воспроизведения');
      return;
    }

    // Предотвращаем повторное воспроизведение
    if (this.isPlaying) {
      console.log('⚠️ Уже воспроизводится, пропускаем');
      return;
    }

    try {
      this.isPlaying = true;

      // Объединяем все chunks
      const totalLength = this.audioChunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of this.audioChunks) {
        combined.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
      }

      // Создаём blob и декодируем
      const blob = new Blob([combined], { type: 'audio/ogg' });
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // Воспроизводим
      this.sourceNode = this.audioContext.createBufferSource();
      this.sourceNode.buffer = audioBuffer;
      this.sourceNode.connect(this.audioContext.destination);

      this.sourceNode.onended = () => {
        this.isPlaying = false;
        this.audioChunks = [];
        console.log('✅ Воспроизведение завершено');
      };

      this.sourceNode.start(0);
      console.log('🔊 Воспроизведение начато');

    } catch (error) {
      console.error('❌ Ошибка воспроизведения:', error);
      this.isPlaying = false;
    }
  }

  stop() {
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode = null;
    }
    this.isPlaying = false;
    this.audioChunks = [];
  }

  reset() {
    this.stop();
    this.audioChunks = [];
  }
}
