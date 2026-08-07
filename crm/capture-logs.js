const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const logs = [];

  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    console.log('BROWSER LOG:', text);
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
    logs.push(`PAGE ERROR: ${err.message}`);
  });
  
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      const url = frame.url();
      console.log('URL CHANGED:', url);
      logs.push(`URL CHANGED: ${url}`);
    }
  });

  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/login');

  console.log('Waiting for email input...');
  await page.waitForSelector('input[type="email"]');

  console.log('Filling login form...');
  await page.fill('input[type="email"]', 'johndoe123@clixpro.com');
  await page.fill('input[type="password"]', 'Password123!');
  
  console.log('Clicking login...');
  await page.click('button[type="submit"]');

  console.log('Waiting 10 seconds on dashboard...');
  await page.waitForTimeout(10000);

  fs.writeFileSync('browser-logs.txt', logs.join('\n'));
  console.log('Logs saved to browser-logs.txt');

  await browser.close();
})();
