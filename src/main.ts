import path from "node:path";
import { BrowserManager } from "./browser-manager";
import { PropertyguruScraper, PropertyguruRentListing } from "./propertyguru-scrapper";
import { exportToJson } from "./util";


(async () => {

    const browser_manager = new BrowserManager();
    const scraper = new PropertyguruScraper(browser_manager);

    await scraper.start();
    await scraper.gotoMainPage();
    const scraped_rent_listings = await scraper.extractListings(new PropertyguruRentListing(), 100);

    const file_path = path.join(__dirname, '..', 'extracted-listings.json');
    await exportToJson(scraped_rent_listings, file_path);
    
    await scraper.close();

}) ();
