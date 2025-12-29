const server = require('./server');

console.log('Testing exported helpers from server.js');

const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const platform = server.detectPlatform(url);
const title = server.getMockTitle(platform);
const thumb = server.getMockThumbnail(platform);
const size = server.formatFileSize(52428800);

console.log('URL:', url);
console.log('Detected platform:', platform);
console.log('Mock title:', title);
console.log('Mock thumbnail:', thumb);
console.log('Formatted size sample:', size);
