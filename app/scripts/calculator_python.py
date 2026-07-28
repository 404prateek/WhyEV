# ==========================================
# 1. EV POLICY ENGINE & STATE DATA
# ==========================================

# List of all 36 States and UTs
ALL_STATES = sorted([
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
    "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", 
    "Lakshadweep", "Puducherry"
])

# Known Road Tax Exemption Percentages (Can be updated as laws change)
DEFAULT_TAX_EXEMPTION = {
    "Kerala": 50,      # Kerala traditionally offers a 50% concession
    "Bihar": 75,       # Bihar varies between 75% and 100% depending on quota
    "Meghalaya": 50,
}

class EVPolicy:
    def __init__(self, state):
        self.state = state
        self.validity_period = "Subject to active state gazette"

    def calculate_benefits(self, reg_year, category, price, battery, scrapping, gvw):
        # Default fallback for states without complex direct subsidy logic coded yet
        tax_pct = DEFAULT_TAX_EXEMPTION.get(self.state, 100) # Defaults to 100% if not specified
        return {
            "state": self.state,
            "validity": self.validity_period,
            "purchase_incentive": 0.0,
            "scrapping_incentive": 0.0,
            "tax_exemption_pct": tax_pct,
            "notes": [f"Standard {tax_pct}% road tax concession applied.", 
                      "Check local RTO for active direct cash subsidies."]
        }

class DelhiEVPolicy(EVPolicy):
    def __init__(self):
        super().__init__("Delhi")
        self.validity_period = "01-07-2026 to 31-03-2030"

    def calculate_benefits(self, reg_year, category, price, battery, scrapping, gvw):
        purchase_incentive = 0.0
        scrapping_incentive = 0.0
        tax_exemption_pct = 100 
        notes = []

        if category == "2W":
            if price <= 225000:
                if reg_year == 1:
                    purchase_incentive = min(battery * 10000, 30000)
                elif reg_year == 2:
                    purchase_incentive = min(battery * 6600, 20000)
                elif reg_year == 3:
                    purchase_incentive = min(battery * 3300, 10000)
            else:
                notes.append("Ex-showroom price exceeds ₹2.25 Lakh. Not eligible for purchase incentive.")
            
            if scrapping:
                scrapping_incentive = 10000

        elif category == "3W (L5M)":
            if battery >= 4.0:
                if reg_year == 1: purchase_incentive = 50000
                elif reg_year == 2: purchase_incentive = 40000
                elif reg_year == 3: purchase_incentive = 30000
            else:
                notes.append("Battery under 4kWh. Not eligible for 3W purchase incentive.")
            
            if scrapping:
                scrapping_incentive = 25000

        elif category == "4W Car":
            if price > 3000000:
                tax_exemption_pct = 0
                notes.append("WARNING: Car exceeds ₹30 Lakh ex-showroom. NO road tax exemption applies.")
            else:
                notes.append("Car is under ₹30 Lakh. 100% road tax exemption applies.")
                
            if scrapping and price <= 3000000:
                scrapping_incentive = 100000

        elif category == "4W Goods (N1)":
            if gvw > 1.75:
                if reg_year == 1: purchase_incentive = 100000
                elif reg_year == 2: purchase_incentive = 75000
                elif reg_year == 3: purchase_incentive = 50000
            else:
                if reg_year == 1: purchase_incentive = 50000
                elif reg_year == 2: purchase_incentive = 37500
                elif reg_year == 3: purchase_incentive = 25000
            
            if scrapping:
                scrapping_incentive = 50000

        return {
            "state": self.state,
            "validity": self.validity_period,
            "purchase_incentive": purchase_incentive,
            "scrapping_incentive": scrapping_incentive,
            "tax_exemption_pct": tax_exemption_pct,
            "notes": notes
        }

# Initialize Policy Map for all 36 States/UTs
policies_map = {state: EVPolicy(state) for state in ALL_STATES}
# Override with specific complex state logic
policies_map["Delhi"] = DelhiEVPolicy()


# ==========================================
# 2. TERMINAL INTERACTIVE INTERFACE
# ==========================================

categories = {
    "1": "2W",
    "2": "3W (L5M)",
    "3": "4W Car",
    "4": "4W Goods (N1)"
}

def run_calculator():
    print("=" * 60)
    print(" ⚡ ADVANCED ALL-INDIA EV CALCULATOR")
    print("=" * 60)

    # 1. State Selection
    print("\nSelect State / UT:")
    for idx, state in enumerate(ALL_STATES, start=1):
        print(f"  [{idx:2d}] {state}")
    
    state_input = input("\nEnter State number (1-36) [Default: 32 (Delhi)]: ").strip()
    try:
        state_idx = int(state_input) - 1 if state_input else 31
        selected_state = ALL_STATES[state_idx]
    except (ValueError, IndexError):
        print("Invalid choice. Defaulting to Delhi.")
        selected_state = "Delhi"

    policy = policies_map[selected_state]

    # 2. Policy Year Selection
    print("\nSelect Policy Year:")
    print("  [1] Year 1")
    print("  [2] Year 2")
    print("  [3] Year 3")
    year_input = input("Enter Policy Year (1-3) [Default: 1]: ").strip()
    reg_year = int(year_input) if year_input in ["1", "2", "3"] else 1

    # 3. Vehicle Category Selection
    print("\nSelect Vehicle Category:")
    for key, name in categories.items():
        print(f"  [{key}] {name}")
    cat_input = input("Enter category number (1-4) [Default: 1]: ").strip()
    category = categories.get(cat_input, "2W")

    # 4. Ex-Showroom Price
    try:
        price_input = input("\nEnter Ex-Showroom Price in ₹ [Default: 150000]: ").strip()
        price = float(price_input) if price_input else 150000.0
    except ValueError:
        price = 150000.0

    # 5. Battery Capacity
    try:
        battery_input = input("Enter Battery Capacity in kWh [Default: 3.0]: ").strip()
        battery = float(battery_input) if battery_input else 3.0
    except ValueError:
        battery = 3.0

    # 6. Scrapping Bonus
    scrapping_input = input("Scrapping an old vehicle? (y/n) [Default: n]: ").strip().lower()
    scrapping = True if scrapping_input == 'y' else False

    # 7. GVW (For Goods Vehicles)
    gvw = 1.5
    if category == "4W Goods (N1)":
        try:
            gvw_input = input("Enter Gross Vehicle Weight (GVW) in Tons [Default: 1.5]: ").strip()
            gvw = float(gvw_input) if gvw_input else 1.5
        except ValueError:
            gvw = 1.5

    # Calculation
    res = policy.calculate_benefits(
        reg_year=reg_year,
        category=category,
        price=price,
        battery=battery,
        scrapping=scrapping,
        gvw=gvw
    )

    total_benefit = res['purchase_incentive'] + res['scrapping_incentive']

    # Display Output Report
    print("\n" + "=" * 60)
    print(" 🚘 FINANCIAL IMPACT & SUBSIDY REPORT")
    print("=" * 60)
    print(f"📍 Region                   : {res['state']}")
    print(f"📜 Active Policy Window     : {res['validity']}")
    print(f"📑 Road Tax & Registration  : {res['tax_exemption_pct']}% EXEMPTED")
    if res['tax_exemption_pct'] < 100:
        print(f"   ⚠️ WARNING: You must pay {100 - res['tax_exemption_pct']}% of standard RTO taxes.")
    print("-" * 60)
    print(f"💵 Direct State Subsidy     : ₹{res['purchase_incentive']:,.2f}")
    print(f"♻️ Scrapping Bonus          : ₹{res['scrapping_incentive']:,.2f}")
    print(f"💰 Total Cash Benefit       : ₹{total_benefit:,.2f}")

    if res['notes']:
        print("\n📌 Policy Clauses Triggered:")
        for note in res['notes']:
            print(f"  • {note}")
    print("=" * 60)
    print("*Disclaimer: RTO rules update frequently. Verify locally before purchase.*")


if __name__ == "__main__":
    run_calculator()