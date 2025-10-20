const { serviceClients } = require('@yandex-cloud/nodejs-sdk');
const sttMethods = Object.getOwnPropertyNames(serviceClients.SttServiceClient.prototype);
const ttsMethods = Object.getOwnPropertyNames(serviceClients.SynthesizerClient.prototype);

console.log('=== SttServiceClient methods ===');
console.log(sttMethods.filter(m => !m.startsWith('_') && m !== 'constructor'));

console.log('\n=== SynthesizerClient methods ===');
console.log(ttsMethods.filter(m => !m.startsWith('_') && m !== 'constructor'));
