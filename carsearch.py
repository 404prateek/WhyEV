import re
import cloudscraper
from bs4 import BeautifulSoup

# Initialize the cloudscraper browser session
scraper = cloudscraper.create_scraper(
    browser={
        'browser': 'chrome',
        'platform': 'windows',
        'desktop': True
    }
)

# Price range mapping
PRICE_URLS = {
    "under 5": ("Under 5 Lakh", "https://www.cardekho.com/filter/new-electric+cars+under-5-lakh"),
    "5-10": ("5 - 10 Lakh", "https://www.cardekho.com/filter/new-electric+cars+5-lakh-10-lakh"),
    "10-15": ("10 - 15 Lakh", "https://www.cardekho.com/new-electric+cars+10-lakh-15-lakh"),
    "15-20": ("15 - 20 Lakh", "https://www.cardekho.com/new-electric+cars+15-lakh-20-lakh"),
    "20-35": ("20 - 35 Lakh", "https://www.cardekho.com/filter/new-electric+cars+20-lakh-35-lakh"),
    "above 35": ("Above 35 Lakh", "https://www.cardekho.com/filter/new-electric+cars+above-35-lakh"),
    "all": ("All Electric Cars", "https://www.cardekho.com/new-electric+cars")
}

# Alias mapping for flexible input (Option Numbers or Range Strings)
KEY_ALIAS = {
    "1": "under 5", "under 5": "under 5", "under 5 lakh": "under 5",
    "2": "5-10", "5-10": "5-10", "5 - 10 lakh": "5-10",
    "3": "10-15", "10-15": "10-15", "10 - 15 lakh": "10-15",
    "4": "15-20", "15-20": "15-20", "15 - 20 lakh": "15-20",
    "5": "20-35", "20-35": "20-35", "20 - 35 lakh": "20-35",
    "6": "above 35", "above 35": "above 35", "above 35 lakh": "above 35",
    "7": "all", "all": "all", "all electric cars": "all"
}

def get_ev_cars(price_range: str, print_formatted: bool = True) -> list:
    """
    Fetches EV details from CarDekho for a specified price range.
    """
    lookup_key = str(price_range).strip().lower()
    
    if lookup_key not in KEY_ALIAS:
        valid_keys = ", ".join(f"'{k}'" for k in PRICE_URLS.keys())
        print(f"Error: Invalid range '{price_range}'. Use 1-7 or keys: {valid_keys}")
        return []

    range_code = KEY_ALIAS[lookup_key]
    selected_label, url = PRICE_URLS[range_code]

    response = scraper.get(url)
    if response.status_code != 200:
        print(f"Error: Failed to fetch webpage (Status Code: {response.status_code})")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    all_divs = soup.find_all('div')
    card_containers = []

    for div in all_divs:
        text = div.get_text(separator=" ", strip=True)
        if ('Get On-Road Price' in text or 'Ex-Showroom Price' in text) and ('₹' in text or 'Rs' in text):
            if len(text) < 1000 and not any(div in c.parents for c in card_containers):
                card_containers.append(div)

    extracted_cars = []
    seen_names = set()

    for card in card_containers:
        title_tag = card.find(['h2', 'h3', 'a'])
        if not title_tag: 
            continue
            
        car_name = title_tag.get_text(strip=True)
        
        # Filter out stray UI buttons
        if any(b in car_name.lower() for b in ['get on-road', 'offers', 'compare', 'view', 'price in']):
            heading = card.find(['h2', 'h3'])
            if heading:
                car_name = heading.get_text(strip=True)

        # Ignore invalid model names or stray button texts
        if not car_name or car_name in seen_names or len(car_name) < 3:
            continue
            
        if any(b in car_name.lower() for b in ['get on-road', 'view offers', 'price in']):
            continue

        card_text = card.get_text(separator=" ", strip=True)

        # Regex Extraction
        price_match = re.search(r'(?:Rs\.?|₹)\s*[\d.,]+\s*(?:-\s*[\d.,]+\s*)?\s*(?:Lakh|Crore|Cr)?', card_text, re.IGNORECASE)
        price = price_match.group(0).strip() if price_match else "N/A"

        specs_match = re.findall(r'\b\d+(?:\.\d+)?\s*(?:seater|kWh|km|bhp|hp|kW)\b', card_text, re.IGNORECASE)
        specs_str = " • ".join(dict.fromkeys(specs_match)) if specs_match else "N/A"

        link_tag = card.find('a', href=True)
        full_url = "N/A"
        if link_tag and link_tag['href']:
            href = link_tag['href']
            full_url = href if href.startswith('http') else f"https://www.cardekho.com{href}"

        car_data = {
            "Model Name": car_name,
            "Specs": specs_str,
            "Price Range": price,
            "Model URL": full_url
        }
        
        extracted_cars.append(car_data)
        seen_names.add(car_name)

    # Print requested block format
    if print_formatted and extracted_cars:
        print("\n" + "=" * 50)
        print(f"  RESULTS FOR RANGE: {selected_label.upper()}")
        print("=" * 50)
        for car in extracted_cars:
            print(f"Model Name: {car['Model Name']}")
            print(f"Specs: {car['Specs']}")
            print(f"Price Range: {car['Price Range']}")
            print("-" * 40)

    return extracted_cars


# Interactive menu when executing the script directly from terminal
if __name__ == "__main__":
    print("=== CarDekho EV Scraper ===")
    print("Select a Price Range:")
    print("  [1] under 5")
    print("  [2] 5-10")
    print("  [3] 10-15")
    print("  [4] 15-20")
    print("  [5] 20-35")
    print("  [6] above 35")
    print("  [7] all")
    
    user_choice = input("\nEnter choice: ").strip()
    get_ev_cars(user_choice)