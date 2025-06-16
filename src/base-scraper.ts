import { Page } from "puppeteer";
import { BrowserManager } from "./browser-manager";

export abstract class BaseScraper {
    protected _browser_manager: BrowserManager;
    protected _page: Page | undefined;

    constructor(browserManager: BrowserManager) {
        this._browser_manager = browserManager;
    }

    async start(headless: boolean = false): Promise<void> {
        this._page = await this._browser_manager.launch(headless);
    }

    async close() {
        this._page = undefined;
        return await this._browser_manager.close();
    }    
}

export interface ListingsExtractionStrategy {
    getListingsData(page: Page, count: number): Promise<Record<string, string>[]>;
    applicableTo(url: string): boolean;
    transformDataEntry(rawDataEntry: Record<string, string>, fieldMappings: FieldMappings): Record<string, unknown>;
}

export type FieldMapping = {
  selector: string;
  transform: (value: string) => unknown;
};

export type FieldMappings = Record<string, FieldMapping>;