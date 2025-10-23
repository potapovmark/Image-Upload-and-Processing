const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testUpload() {
  console.log('Testing single image upload...');

  const form = new FormData();
  const testImagePath = 'test-image.jpg';

  if (!fs.existsSync(testImagePath)) {
    console.log('Creating test image...');
    const sharp = require('sharp');
    await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
    .jpeg()
    .toFile(testImagePath);
  }

  form.append('image', fs.createReadStream(testImagePath));

  try {
    const response = await axios.post(`${API_URL}/api/upload/single`, form, {
      headers: form.getHeaders()
    });

    console.log('Upload response:', response.data);
    return response.data.file.filename;
  } catch (error) {
    console.error('Upload error:', error.response?.data || error.message);
    throw error;
  }
}

async function testProcess(filename) {
  console.log('Testing image processing...');

  const response = await axios.post(`${API_URL}/api/process/${filename}`, {
    width: 400,
    height: 300,
    format: 'webp',
    quality: 85,
    sharpen: true
  });

  console.log('Process response:', response.data);
}

async function testResponsive() {
  console.log('Testing responsive images...');

  const form = new FormData();
  form.append('image', fs.createReadStream('test-image.jpg'));

  const response = await axios.post(`${API_URL}/api/upload/responsive`, form, {
    headers: form.getHeaders()
  });

  console.log('Responsive response:', response.data);
}

async function testMetadata(filename) {
  console.log('Testing metadata retrieval...');

  const response = await axios.get(`${API_URL}/api/process/metadata/${filename}`);
  console.log('Metadata response:', response.data);
}

async function testFormatConversion(filename) {
  console.log('Testing format conversion...');

  const response = await axios.post(`${API_URL}/api/process/convert/${filename}`, {
    format: 'png',
    quality: 90
  });

  console.log('Format conversion response:', response.data);
}

async function runTests() {
  try {
    console.log('Starting API tests...\n');

    const filename = await testUpload();
    console.log('\n');

    await testProcess(filename);
    console.log('\n');

    await testResponsive();
    console.log('\n');

    await testMetadata(filename);
    console.log('\n');

    await testFormatConversion(filename);
    console.log('\n');

    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

runTests();
