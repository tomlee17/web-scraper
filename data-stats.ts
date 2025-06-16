import fs from 'node:fs';
import path from 'node:path';

type PropertyRentListingData = {
    address: string;
    price_per_month: number;
    nearest_mrt: string;
}

const analyze_property_rent_listing = (data: PropertyRentListingData[]) => {
    console.log(`Total entries: ${data.length}`);

    const missing_fields_count = {
        Address: data.reduce((missingCount, entry) => missingCount + (entry.address? 0:1), 0),
        Price: data.reduce((missingCount, entry) => missingCount + (entry.price_per_month? 0:1), 0),
        Mrt: data.reduce((missingCount, entry) => missingCount + (entry.nearest_mrt? 0:1), 0)
    }

    console.log('\nMissing field data counts:');
    for(const [field_name, missing_count] of Object.entries(missing_fields_count)) {
        console.log(`- ${field_name}: ${missing_count} / ${data.length}`);
    }

    const data_fields_completeness = {
        Address: ((data.length - missing_fields_count.Address) / data.length * 100).toFixed(1),
        Price: ((data.length - missing_fields_count.Price) / data.length * 100).toFixed(1),
        Mrt: ((data.length - missing_fields_count.Mrt) / data.length * 100).toFixed(1),
    }

    console.log('\nCompleteness rates:');
        for(const [field_name, completeness] of Object.entries(data_fields_completeness)) {
        console.log(`- ${field_name}: ${completeness}%`);
    }

    const mrt_lines = data.map(item => {
        const match = item.nearest_mrt.match(/^([A-Z]{1,3})\d+/);
        return match ? match[1] : 'Unknown';
    });

    const mrt_lines_counts = mrt_lines.reduce((counts, line) => {
        counts[line] = (counts[line] ?? 0) + 1;
        return counts;
    }, {} as Record<string, number>);

    console.log('\nNearest MRT distribution:')
    Object.entries(mrt_lines_counts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([line, count]) => {
            console.log(`${line}: ${count} properties`);
        });

    const valid_prices = data
                            .filter(item => item.price_per_month > 0)
                            .map(entry => entry.price_per_month);
    
    const average_price = valid_prices.reduce((sum, price) => sum + price, 0) / valid_prices.length;
    
    console.log(`\nPrice range: S$${Math.min(...valid_prices)} - S$${Math.max(...valid_prices)}`)
    console.log(`Average price: S$${average_price.toFixed(2)}`)

    valid_prices.sort((a, b) => a - b);
    const mid = Math.floor(valid_prices.length / 2);
    const median_price = valid_prices.length % 2? 
                            valid_prices[mid] : ((valid_prices[mid - 1] + valid_prices[mid]) / 2);
    
    console.log(`Median price: S$${median_price.toFixed(2)}`)
}

const json_string = fs.readFileSync(path.join(__dirname, 'extracted-listings.json'), 'utf8');
const data: PropertyRentListingData[] = JSON.parse(json_string);

analyze_property_rent_listing(data);