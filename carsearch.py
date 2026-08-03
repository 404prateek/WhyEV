import json
import re
import cloudscraper
from bs4 import BeautifulSoup

# 1. Global mapping of budget ranges to CarDekho URLs
PRICE_URLS = {
    "Under 5 Lakh": "https://www.cardekho.com/filter/new-electric+cars+under-5-lakh",
    "5 - 10 Lakh": "https://www.cardekho.com/filter/new-electric+cars+5-lakh-10-lakh",
    "10 - 15 Lakh": "https://www.cardekho.com/new-electric+cars+10-lakh-15-lakh",
    "15 - 20 Lakh": "https://www.cardekho.com/new-electric+cars+15-lakh-20-lakh",
    "20 - 35 Lakh": "https://www.cardekho.com/filter/new-electric+cars+20-lakh-35-lakh",
    "Above 35 Lakh": "https://www.cardekho.com/filter/new-electric+cars+above-35-lakh",
    "All Electric Cars": "https://www.cardekho.com/new-electric+cars"
}

# 2. List of Indian cities to ignore when parsing variant tables
INDIAN_CITIES = {
    'noida', 'gurgaon', 'gurugram', 'thane', 'mumbai', 'delhi', 'new delhi', 
    'bangalore', 'bengaluru', 'pune', 'kolkata', 'chennai', 'hyderabad', 
    'ahmedabad', 'jaipur', 'lucknow', 'surat', 'patna', 'chandigarh', 
    'ludhiana', 'kochi', 'ghaziabad', 'faridabad', 'agra', 'indore', 
    'bhopal', 'nagpur', 'vadodara', 'coimbatore', 'visakhapatnam'
}

def create_scraper_session():
    """Initialize cloudscraper session with desktop browser headers."""
    return cloudscraper.create_scraper(
        browser={
            'browser': 'chrome',
            'platform': 'windows',
            'desktop': True
        }
    )

def extract_variant_prices(scraper, detail_url):
    """
    Scrapes individual detail page for all variant names and on-road prices.
    Ignores city price tables to prevent false variant entries.
    Returns: {"Variant Name": "On-Road Price"}
    """
    variants_dict = {}
    try:
        res = scraper.get(detail_url)
        if res.status_code != 200:
            return variants_dict

        soup = BeautifulSoup(res.text, "html.parser")

        # Method A: Extract from standard price table rows (<tr>)
        rows = soup.find_all('tr')
        for row in rows:
            # Skip rows inside "nearby cities" or "other cities" sections
            parent_text = row.parent.get_text(separator=" ", strip=True).lower() if row.parent else ""
            if 'nearby' in parent_text or 'other cities' in parent_text or 'city price' in parent_text:
                continue

            row_text = row.get_text(separator=" ", strip=True)
            if ('Rs' in row_text or '₹' in row_text) and ('Lakh' in row_text or 'Crore' in row_text):
                price_match = re.search(r'(?:Rs\.?|₹)\s*[\d.,]+\s*(?:Lakh|Crore|Cr)?', row_text, re.IGNORECASE)
                if price_match:
                    price_str = price_match.group(0).strip()
                    variant_name = row_text.replace(price_str, '').replace('*', '').strip()
                    
                    # Clean up unwanted UI elements & labels
                    variant_name_clean = re.sub(
                        r'View.*Offers|Get.*Offers|\(Base Model\)|\(Top Model\)', 
                        '', 
                        variant_name, 
                        flags=re.IGNORECASE
                    ).strip()

                    # Filter out city names and duplicate entries
                    if (variant_name_clean.lower() not in INDIAN_CITIES and 
                        variant_name_clean and 
                        variant_name_clean not in variants_dict and 
                        len(variant_name_clean) > 2):
                        
                        variants_dict[variant_name_clean] = price_str

        # Method B: Fallback using variant headers if table parsing yields nothing
        if not variants_dict:
            variant_divs = soup.find_all('div', class_=re.compile(r'variantDtlhead'))
            for v_div in variant_divs:
                v_text = v_div.get_text(separator=" ", strip=True)
                v_text_clean = re.sub(
                    r'View.*Offers|Get.*Offers|\(Base Model\)|\(Top Model\)', 
                    '', 
                    v_text, 
                    flags=re.IGNORECASE
                ).strip()
                
                price_match = re.search(r'(?:Rs\.?|₹)\s*[\d.,]+\s*(?:Lakh|Crore|Cr)?', v_text_clean, re.IGNORECASE)
                if price_match:
                    price_str = price_match.group(0).strip()
                    variant_name = v_text_clean.replace(price_str, '').replace('*', '').strip()
                    
                    if (variant_name.lower() not in INDIAN_CITIES and 
                        variant_name and 
                        variant_name not in variants_dict):
                        
                        variants_dict[variant_name] = price_str

    except Exception as e:
        print(f"   [!] Error parsing detail page ({detail_url}): {e}")

    return variants_dict


def scrape_evs_by_price_range(selected_range: str) -> dict:
    """
    Main function to scrape EV data for a given price range.
    
    Parameters:
        selected_range (str): Budget key (e.g., 'Under 5 Lakh', '10 - 15 Lakh')
        
    Returns:
        dict: Nested dictionary structured as:
            {
                "Model Name": {
                    "overall_price_range": "₹X - Y Lakh",
                    "specifications": "Specs",
                    "detail_url": "URL",
                    "variants": {
                        "Sub Variant Name": "Price"
                    }
                }
            }
    """
    url = PRICE_URLS.get(selected_range)
    if not url:
        print(f"Error: Invalid range '{selected_range}'. Valid options: {list(PRICE_URLS.keys())}")
        return {}

    scraper = create_scraper_session()
    print(f"[*] Connecting to listing page: {url}")
    response = scraper.get(url)

    if response.status_code != 200:
        print(f"Error: HTTP Status Code {response.status_code}")
        return {}

    soup = BeautifulSoup(response.text, "html.parser")

    # Locate car containers
    card_containers = []
    for div in soup.find_all('div'):
        text = div.get_text(separator=" ", strip=True)
        if ('Get On-Road Price' in text or 'Ex-Showroom Price' in text) and ('₹' in text or 'Rs' in text):
            if len(text) < 1000 and not any(div in c.parents for c in card_containers):
                card_containers.append(div)

    print(f"[*] Found {len(card_containers)} vehicle cards. Scraping specifications & variants...\n")

    results = {}

    for card in card_containers:
        heading = card.find(['h2', 'h3'])
        if not heading:
            continue
        car_name = heading.get_text(strip=True)

        if not car_name or car_name in results or len(car_name) < 3:
            continue

        card_text = card.get_text(separator=" ", strip=True)

        # 1. Base Price Range
        price_match = re.search(r'(?:Rs\.?|₹)\s*[\d.,]+\s*(?:-\s*[\d.,]+\s*)?\s*(?:Lakh|Crore|Cr)?', card_text, re.IGNORECASE)
        base_price_range = price_match.group(0).strip() if price_match else "N/A"

        # 2. Specs extraction
        specs_match = re.findall(r'\b\d+(?:\.\d+)?\s*(?:seater|kWh|km|bhp|hp|kW)\b', card_text, re.IGNORECASE)
        specs_str = " • ".join(dict.fromkeys(specs_match)) if specs_match else "N/A"

        # 3. Locate detail URL
        detail_url = "N/A"
        for a in card.find_all('a', href=True):
            href = a['href']
            link_text = a.get_text(strip=True)
            if 'price-in' in href or 'get on-road price' in link_text.lower():
                detail_url = href if href.startswith('http') else f"https://www.cardekho.com{href}"
                break

        if detail_url == "N/A":
            first_a = card.find('a', href=True)
            if first_a:
                base_href = first_a['href']
                base_link = base_href if base_href.startswith('http') else f"https://www.cardekho.com{base_href}"
                detail_url = f"{base_link.rstrip('/')}/price-in-new-delhi"

        # 4. Extract variants dictionary
        print(f" -> Extracting variants for: {car_name}")
        variants_data = extract_variant_prices(scraper, detail_url) if detail_url != "N/A" else {}

        # 5. Populate model result entry
        results[car_name] = {
            "overall_price_range": base_price_range,
            "specifications": specs_str,
            "detail_url": detail_url,
            "variants": variants_data if variants_data else {"Standard / Base": base_price_range}
        }

    return results


if __name__ == "__main__":
    target_budget = "Under 5 Lakh"
    
    print(f"--- RUNNING SCRAPER FOR BUDGET: {target_budget} ---")
    scraped_data = scrape_evs_by_price_range(target_budget)

    print("\n" + "=" * 60)
    print("FINAL RESULT DICTIONARY:")
    print("=" * 60)
    print(json.dumps(scraped_data, indent=4, ensure_ascii=False))