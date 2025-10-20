const { RecognizerClient } = require('@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/ai/stt/v3/stt_service');
const grpc = require('@grpc/grpc-js');

// Создаём credentials
const credentials = grpc.credentials.createSsl();

// Создаём клиента напрямую
const client = new RecognizerClient(
  'stt.api.cloud.yandex.net:443',
  credentials
);

console.log('Client:', typeof client);
console.log('Has recognizeStreaming:', typeof client.recognizeStreaming);

const stream = client.recognizeStreaming();
console.log('\nStream type:', typeof stream);
console.log('Has .on():', typeof stream.on);
console.log('Has .write():', typeof stream.write);
console.log('Has .end():', typeof stream.end);
console.log('Constructor:', stream.constructor.name);
