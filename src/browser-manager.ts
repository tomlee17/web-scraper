import { Browser, Page } from "puppeteer";
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export class BrowserManager {
    private _browser: Browser | undefined;

    get launched() { return !!this._browser; }

    async launch(headless: boolean = false): Promise<Page> {
        await this.close();

        this._browser = await puppeteer.launch({ 
            headless: headless, 
            defaultViewport: null,
            args: [
                '--enable-logging',
                '--v=1'
            ]
        });
        console.log('Browser launched.');

        return await this.getNewPage();
    }

    async getNewPage(): Promise<Page> {
        if (!this._browser) {
            throw new Error('Create new page failed. No active browser.');
        }

        const curr_page = (await this._browser.pages()).pop();
        const new_page = curr_page && curr_page.url() === 'about:blank' ? curr_page : await this._browser.newPage();
        
        new_page.setDefaultTimeout(10000);  
        return new_page
    }

    async close() {
        if (!this._browser) { return; }

        await this._browser.close();
        this._browser = undefined;

        console.log('Browser closed.');
    }
}