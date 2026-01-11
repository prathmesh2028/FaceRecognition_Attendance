const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testBackend() {
    const baseUrl = 'http://localhost:5000/api/vision';

    console.log("Testing /api/vision (Expect 404)...");
    try {
        await axios.get(baseUrl);
        console.log("Unexpected Success on /api/vision GET");
    } catch (error) {
        console.log(`Expected Error on /api/vision: ${error.message}`);
    }

    console.log("\nTesting /api/vision/test (Expect 200)...");
    try {
        const res = await axios.get(`${baseUrl}/test`);
        console.log(`Success /test: ${res.data}`);
    } catch (error) {
        console.log(`Error on /test: ${error.message}`);
    }

    // We can't easily test /detect without a file, but the 404 on base URL is the key suspected issue.
}

testBackend();
