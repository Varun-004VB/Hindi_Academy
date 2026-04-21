import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('CONSOLE ERROR:', msg.text());
        }
    });

    page.on('pageerror', err => {
        console.log('PAGE ERROR:', err.toString());
    });

    try {
        await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });
        console.log('Page loaded successfully.');
    } catch (e) {
        console.log('Navigation error:', e.message);
    }
    
    await browser.close();
})();
