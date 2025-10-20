/**
 * Управление UI чата
 */

export class ChatUI {
  constructor() {
    this.chatMessages = document.getElementById('chatMessages');
    this.partialText = document.getElementById('partialText');
    this.statusEl = document.getElementById('status');
    this.micButton = document.getElementById('micButton');
    this.volumeBar = document.getElementById('volumeBar');
    this.micInfo = document.getElementById('micInfo');
    this.microphoneSelect = document.getElementById('microphoneSelect');
  }

  setStatus(text, className = '') {
    this.statusEl.textContent = text;
    this.statusEl.className = 'status ' + className;
  }

  addMessage(role, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;

    messageDiv.appendChild(contentDiv);
    this.chatMessages.appendChild(messageDiv);

    // Автоскролл
    this.scrollToBottom();
  }

  addUserMessage(text) {
    this.addMessage('user', text);
  }

  addAssistantMessage(text) {
    this.addMessage('assistant', text);
  }

  showPartialText(text) {
    this.partialText.textContent = text || '';
  }

  clearPartialText() {
    this.partialText.textContent = '';
  }

  setRecordingState(isRecording) {
    if (isRecording) {
      this.micButton.classList.add('recording');
      this.micButton.querySelector('.mic-text').textContent = 'Говорите...';
    } else {
      this.micButton.classList.remove('recording');
      this.micButton.querySelector('.mic-text').textContent = 'Нажми и говори';
    }
  }

  scrollToBottom() {
    requestAnimationFrame(() => {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    });
  }

  clear() {
    this.chatMessages.innerHTML = '';
    this.clearPartialText();
  }

  updateVolumeBar(level) {
    if (this.volumeBar) {
      this.volumeBar.style.width = `${level}%`;
    }
  }

  setMicrophoneInfo(label, sampleRate) {
    if (this.micInfo) {
      this.micInfo.textContent = `Sample Rate: ${sampleRate} Hz`;
    }
  }

  populateMicrophones(devices, selectedDeviceId) {
    if (!this.microphoneSelect) return;

    this.microphoneSelect.innerHTML = '';

    devices.forEach((device, index) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.textContent = device.label || `Микрофон ${index + 1}`;
      if (device.deviceId === selectedDeviceId) {
        option.selected = true;
      }
      this.microphoneSelect.appendChild(option);
    });
  }

  onMicrophoneChange(callback) {
    if (this.microphoneSelect) {
      this.microphoneSelect.addEventListener('change', (e) => {
        callback(e.target.value);
      });
    }
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message assistant';
    errorDiv.innerHTML = `
      <div class="message-content" style="background: #ffebee; color: #c62828;">
        ❌ ${message}
      </div>
    `;
    this.chatMessages.appendChild(errorDiv);
    this.scrollToBottom();
  }
}
