const puppeteer = require('puppeteer-core');

class BrowserManager {
    constructor(chromePath, browserURL) {
        this.chromePath = chromePath;
        this.browserURL = browserURL;
    }

    async conectar() {
        const browser = await puppeteer.connect({
            browserURL: this.browserURL,
            executablePath: this.chromePath,
            defaultViewport: null,
        });

        const pages = await browser.pages();
        const page = pages[0];
        await page.goto('https://cosmos.bluesoft.com.br/');

        return { browser, page };
    }
}

module.exports = BrowserManager;
