const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/ai/chat', {
      messages: [{ role: 'user', id: '1', content: 'What are my upcoming tasks for today?' }],
      tenantId: 'dev-tenant-1',
      userId: 'dev-user-1'
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.log("Error:", err.response?.data || err.message);
  }
}

test();
