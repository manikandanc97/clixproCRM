const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('request', request => {
    if (request.url().includes('/api/ai/chat')) {
      console.log(`[NETWORK] Request started: ${request.method()} ${request.url()}`);
    }
  });

  page.on('requestfailed', request => {
    if (request.url().includes('/api/ai/chat')) {
      console.log(`[NETWORK] Request failed: ${request.url()} - ${request.failure().errorText}`);
    }
  });

  console.log("Navigating to localhost:3000/login...");
  await page.goto('http://localhost:3000/login');
  
  // Login first to get past authentication
  try {
    await page.fill('input[type="email"]', 'admin@clixpro.com');
    await page.fill('input[type="password"]', 'admin123'); // assuming standard mock credentials
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    console.log("Logged in successfully.");
  } catch (e) {
    console.log("Login failed or not needed, continuing...");
  }

  try {
    console.log("Waiting for floating assistant...");
    // Wait for the Bot icon/button
    await page.waitForSelector('button:has(.lucide-bot)', { timeout: 5000 });
    await page.click('button:has(.lucide-bot)');
    console.log("Floating assistant opened.");

    // Wait for textarea
    await page.waitForSelector('textarea', { timeout: 5000 });
    await page.fill('textarea', 'hi');
    
    // Press enter or click send
    await page.keyboard.press('Enter');
    console.log("Sent 'hi' message.");

    // Wait for 3 seconds to capture logs
    await page.waitForTimeout(3000);
  } catch (e) {
    console.error("Error interacting with chat:", e.message);
  }

  await browser.close();
})();
