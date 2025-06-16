import { Page } from "puppeteer";
import { BaseScraper, FieldMappings, ListingsExtractionStrategy } from "./base-scraper";
import { TIME, TIMEOUT_10 } from "./util";



const close_blocking_elements = async (page: Page): Promise<void> => {
    const button_accept_cookie = await page.$('div.cookie-banner-root button');
    if(button_accept_cookie) { 
        await button_accept_cookie.click(); 
    }

    const ad_dialog = await page.$('div.modal-dialog button');
    if(ad_dialog) {
        await ad_dialog.click();
    }
}

const extract_listings_from_html = async (page: Page, listingSelector: string, fieldMappings: FieldMappings) => {
    return await page.$$eval(listingSelector, (listingsList: Element[], fieldMappings) => {
        
        return listingsList.map(listing => {
            const listing_data: Record<string, string> = {};

            for(const [field_name, field_mapping] of Object.entries(fieldMappings)) {
                const target_field = listing.querySelector(field_mapping.selector);
                listing_data[field_name] = target_field?.textContent?.trim() ?? '';               
            }

            return listing_data;
        })
    }, fieldMappings);
}


const rent_listing_field_mappings: FieldMappings = {
    address: {
        selector: '.listing-address',
        transform: function(value: string): string {
            return value;
        }
    },
    price_per_month: {
        selector: 'div.listing-price',
        transform: function(value: string): number {
            if(!value) { return 0; }
            return parseFloat(value.replace(/[^\d.]/g, ''));
        }
    },
    nearest_mrt: {
        selector: 'span.listing-location-value',
        transform: function(value: string): string {
            if(!value) { return value; }
            return value.split(' from ')[1];
        }
    },
}

export class PropertyguruRentListing implements ListingsExtractionStrategy {
    private async navigateToListings(page: Page): Promise<void> {
        // Implementation for navigating to rent listings
        console.log('Navigating to rent listings...');

        const button_rentals = page.locator('xpath///a[@role="button" and .="Rent"]');
        await Promise.all([page.waitForNavigation(TIME.OUT_20), button_rentals.setTimeout(TIMEOUT_10).click()]);
    }

    async getListingsData(page: Page, minCount: number): Promise<Record<string, string>[]> {
        await this.navigateToListings(page);

        const listings_data: Record<string, string>[] = [];
        console.log('Extracting rent listings...');
        while(listings_data.length <= minCount) {
            const curr_page_listings = await extract_listings_from_html(page, 'div.listing-card-banner-root', rent_listing_field_mappings);
            listings_data.push(...curr_page_listings);

            const button_next_page = await page.$('.arrow-page:nth-last-child(2):not(.disabled)');
            if(!button_next_page) {
                console.log('No more pages to navigate.');
                break;
            }

            await Promise.all([page.waitForNavigation(TIME.OUT_20), button_next_page.click()]);
        }

        console.log(`Total listings extracted: ${listings_data.length}`);
        return listings_data;
    }

    transformDataEntry(rawDataEntry: Record<string, string>, fieldMappings: FieldMappings){
        const transformed_data_entry: Record<string, unknown> = {};

        for(const [field_name, data_value] of Object.entries(rawDataEntry)) {
            const mapping = fieldMappings[field_name];
            transformed_data_entry[field_name] = mapping.transform(data_value);
        }

        return transformed_data_entry;
    }

    applicableTo(url: string): boolean {
        return url.includes('propertyguru');
    }
}

export class PropertyguruScraper extends BaseScraper {
    private readonly _url ='https://www.propertyguru.com.sg';

    async gotoMainPage(): Promise<void> {
        this._page ??= await this._browser_manager.getNewPage();

        await this._page.goto(this._url, TIME.OUT_20);
        await close_blocking_elements(this._page);
        console.log('Navigated to PropertyGuru main page.');
    }

    async extractListings(listingType: ListingsExtractionStrategy, count: number): Promise<Record<string, unknown>[]> {
        if(!listingType.applicableTo(this._url)) {
            throw new Error('Listing type not applicable to the current site.');
        }

        if (!this._page) {
            await this.gotoMainPage();
        }

        const raw_listings_data = await listingType.getListingsData(this._page!, count);

        const transformed_listings_data = raw_listings_data.map(rawListingEntry =>
            listingType.transformDataEntry(rawListingEntry, rent_listing_field_mappings)
        );
        console.log(`Total listings entries transformed: ${transformed_listings_data.length}`);

        return transformed_listings_data;
    }

}

