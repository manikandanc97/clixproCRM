async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: '123', userId: '123', messages: [] })
    });
    const text = await res.text();
    console.log('STATUS:', res.status);
    console.log('BODY:', text.substring(0, 100));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
run();
