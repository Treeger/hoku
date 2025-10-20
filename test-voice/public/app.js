// Глобальные переменные
let mediaRecorder = null;
let audioChunks = [];
let stream = null;
let audioContext = null;
let analyser = null;
let volumeInterval = null;
let selectedDeviceId = null;

// DOM элементы
const recordButton = document.getElementById('recordButton');
const statusDiv = document.getElementById('status');
const userTextDiv = document.getElementById('userText');
const aiTextDiv = document.getElementById('aiText');
const audioPlayer = document.getElementById('audioPlayer');
const microphoneSelect = document.getElementById('microphoneSelect');
const volumeBar = document.getElementById('volumeBar');

/**
 * Обновление статуса
 */
function setStatus(message, type = '') {
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
}

/**
 * Загрузка списка доступных микрофонов
 */
async function loadAudioDevices() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');

        microphoneSelect.innerHTML = '';

        if (audioInputs.length === 0) {
            microphoneSelect.innerHTML = '<option value="">Микрофоны не найдены</option>';
            return;
        }

        audioInputs.forEach((device, index) => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.textContent = device.label || `Микрофон ${index + 1}`;
            microphoneSelect.appendChild(option);
        });

        // Выбираем первый по умолчанию
        selectedDeviceId = audioInputs[0].deviceId;
        console.log('📱 Найдено микрофонов:', audioInputs.length);
        console.log('🎤 Выбран:', audioInputs[0].label || 'Микрофон 1');

    } catch (error) {
        console.error('❌ Ошибка загрузки устройств:', error);
        microphoneSelect.innerHTML = '<option value="">Ошибка загрузки</option>';
    }
}

/**
 * Обработчик изменения выбранного микрофона
 */
microphoneSelect.addEventListener('change', async (e) => {
    selectedDeviceId = e.target.value;
    console.log('🔄 Переключение микрофона:', e.target.selectedOptions[0].text);

    // Переинициализируем MediaRecorder с новым устройством
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    await initMediaRecorder();
});

/**
 * Инициализация MediaRecorder
 */
async function initMediaRecorder() {
    try {
        const constraints = {
            audio: {
                deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                channelCount: 1  // Mono
            }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);

        // Инициализируем AudioContext для визуализации
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Создаём analyser для визуализации уровня звука
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        console.log('🎚️ AudioContext sample rate:', audioContext.sampleRate);

        // Определяем поддерживаемый MIME-тип
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : 'audio/webm';

        mediaRecorder = new MediaRecorder(stream, {
            mimeType: mimeType
        });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
                console.log('📦 Chunk получен:', event.data.size, 'байт');
            }
        };

        mediaRecorder.onstop = async () => {
            stopVolumeMonitoring();
            await handleRecordingStop();
        };

        setStatus('Готов к записи', 'success');
        console.log('✅ MediaRecorder инициализирован:', mimeType);

        // Начинаем мониторинг уровня звука
        startVolumeMonitoring();

    } catch (error) {
        console.error('❌ Ошибка доступа к микрофону:', error);
        setStatus('Ошибка: нет доступа к микрофону', 'error');
    }
}

/**
 * Мониторинг уровня звука
 */
function startVolumeMonitoring() {
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    volumeInterval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);

        // Вычисляем средний уровень
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const percentage = (average / 255) * 100;

        // Обновляем визуализацию
        volumeBar.style.width = percentage + '%';
    }, 50);
}

/**
 * Остановка мониторинга уровня звука
 */
function stopVolumeMonitoring() {
    if (volumeInterval) {
        clearInterval(volumeInterval);
        volumeInterval = null;
        volumeBar.style.width = '0%';
    }
}

/**
 * Начало записи
 */
function startRecording() {
    if (!mediaRecorder) {
        setStatus('Ошибка: микрофон не инициализирован', 'error');
        return;
    }

    audioChunks = [];
    mediaRecorder.start();
    setStatus('🔴 Запись... Говорите!', 'recording');
    recordButton.classList.add('recording');
    console.log('🎤 Запись началась');
}

/**
 * Остановка записи
 */
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        setStatus('⏳ Обработка...', 'processing');
        recordButton.classList.remove('recording');
        console.log('⏸️ Запись остановлена');
    }
}

/**
 * Обработка остановки записи и отправка на сервер
 */
async function handleRecordingStop() {
    try {
        // Создаём WebM blob
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        console.log('📦 Размер записи WebM:', audioBlob.size, 'байт');

        if (audioBlob.size < 1000) {
            setStatus('Ошибка: слишком короткая запись', 'error');
            console.warn('⚠️ Запись слишком короткая, размер:', audioBlob.size);
            return;
        }

        // Отправляем WebM на сервер (конвертация будет на сервере)
        await sendToServer(audioBlob);

    } catch (error) {
        console.error('❌ Ошибка обработки записи:', error);
        setStatus('Ошибка обработки аудио', 'error');
    }
}

/**
 * Отправка аудио на сервер
 */
async function sendToServer(audioBlob) {
    try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        setStatus('🔄 Отправка на сервер...', 'processing');
        console.log('📤 Отправка WebM на сервер, размер:', audioBlob.size, 'байт');

        const response = await fetch('/api/dialog', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Ошибка сервера');
        }

        const data = await response.json();
        console.log('✅ Ответ получен:', data);

        // Отображаем тексты
        userTextDiv.textContent = data.userText || 'Не распознано';
        aiTextDiv.textContent = data.responseText || 'Нет ответа';

        // Воспроизводим аудио ответ (если есть)
        if (data.audio) {
            playAudioResponse(data.audio);
        } else {
            console.log('ℹ️ Синтез речи отключён');
        }

        setStatus('✅ Готово! Можете говорить снова', 'success');

    } catch (error) {
        console.error('❌ Ошибка:', error);
        setStatus('Ошибка: ' + error.message, 'error');
        userTextDiv.textContent = 'Ошибка обработки';
        aiTextDiv.textContent = error.message;
    }
}

/**
 * Воспроизведение аудио ответа
 */
function playAudioResponse(base64Audio) {
    try {
        // Декодируем base64 в бинарные данные
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const audioBlob = new Blob([bytes], { type: 'audio/ogg' });
        const audioUrl = URL.createObjectURL(audioBlob);

        audioPlayer.src = audioUrl;
        audioPlayer.style.display = 'block';
        audioPlayer.play();

        console.log('🔊 Воспроизведение ответа');

        // Очистка URL после воспроизведения
        audioPlayer.onended = () => {
            URL.revokeObjectURL(audioUrl);
        };

    } catch (error) {
        console.error('❌ Ошибка воспроизведения:', error);
    }
}

/**
 * Обработчики событий кнопки
 */
recordButton.addEventListener('mousedown', startRecording);
recordButton.addEventListener('mouseup', stopRecording);
recordButton.addEventListener('mouseleave', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        stopRecording();
    }
});

// Поддержка touch событий для мобильных
recordButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startRecording();
});

recordButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopRecording();
});

/**
 * Инициализация при загрузке страницы
 */
window.addEventListener('load', async () => {
    setStatus('⏳ Инициализация...', 'processing');

    // Сначала запрашиваем доступ к микрофону, чтобы получить список устройств
    await loadAudioDevices();
    await initMediaRecorder();
});
