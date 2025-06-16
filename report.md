## Approaches and challenges
### Scraping methods to choose from
1. Identify the API request and response fetching the listings data in Network tab, then make the same request in own code.
- Got 403 Forbidden error code.
- Tried a few ways to bypass including adding user-agent and get-and-set cookie but didn't succeed
2. Use puppeteer to navigate, and intercept matching response to capture listings data fetched.
- json is only fetched when filter is clicked, and only with data for the first page.
- When going to next page, no json is fetched, but HTML instead.
3. Use puppeteer to navigate and extract data from DOM
- The method chosen for this project and succeed.

### Bypassing Cloudflare anti-bot checkbox feature
- Tried to use puppeteer to select the Cloudflare checkbox, could not work
- The checbox is parked under closed shadow root, so impossible to bypass with puppeteer alone
- Installed puppeteer-extra-plugin-stealth, and with its help, able to navigate the website withotu triggering Cloudflare anti-bot
- Another way that could be tried is to subscribe to a proxy service providing multiple proxies, and if a proxy starts triggering the website's anti-bot, then relaunch the browser with next proxy in list, and so on, recycling the proxy list.
- The said proxy service is usually paid, and since this project is not scraping very frequently, this is not used. 

## Brief data analysis
### Overall stats
Total entries: 103

Missing field data counts:
```
- Address: 7 / 103
- Price: 0 / 103
- Mrt: 16 / 103
```

Completeness rates:  
```
- Address: 93.2%
- Price: 100.0%
- Mrt: 84.5%
```
- On the web page, it was observed some listings are missing info on Address and MRT.
- Whether all of the missing fields is due to the page missing them, will have to be further investigated. 

### Nearest MRT distribution:
```
EW: 19 properties
Unknown: 17 properties
TE: 16 properties
NS: 11 properties
CC: 11 properties
NE: 10 properties
DT: 5 properties
CP: 4 properties
SW: 4 properties
PE: 2 properties
PW: 1 properties
BP: 1 properties
CR: 1 properties
JS: 1 properties
```
### Price per month distribution:
```
- Price range: S$449 - S$68000
- Average price: S$8074.71
- Median price: S$4600.00
```