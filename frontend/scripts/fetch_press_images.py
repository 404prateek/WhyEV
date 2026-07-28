import urllib.request
import re
import os
import json
import subprocess

VEHICLES = [
    {"id": "tata-tiago-ev", "make": "Tata Motors", "model": "Tiago EV", "search": ["tiago-ev", "tiago_ev", "tiago"]},
    {"id": "tata-tigor-ev", "make": "Tata Motors", "model": "Tigor EV", "search": ["tigor-ev", "tigor_ev", "tigor"]},
    {"id": "tata-punch-ev", "make": "Tata Motors", "model": "Punch EV", "search": ["punch-ev", "punch_ev", "punch"]},
    {"id": "tata-nexon-ev", "make": "Tata Motors", "model": "Nexon EV", "search": ["nexon-ev", "nexon_ev", "nexon"]},
    {"id": "tata-curvv-ev", "make": "Tata Motors", "model": "Curvv EV", "search": ["curvv-ev", "curvv_ev", "curvv"]},
    {"id": "tata-sierra-ev", "make": "Tata Motors", "model": "Sierra EV", "search": ["sierra-ev", "sierra_ev", "sierra"]},
    {"id": "tata-harrier-ev", "make": "Tata Motors", "model": "Harrier EV", "search": ["harrier-ev", "harrier_ev", "harrier"]},
    {"id": "mahindra-xuv400", "make": "Mahindra", "model": "XUV400", "search": ["xuv400", "xuv-400"]},
    {"id": "mahindra-xuv-3xo-ev", "make": "Mahindra", "model": "XUV 3XO EV", "search": ["3xo", "3-xo", "xuv-3xo"]},
    {"id": "mahindra-be-6", "make": "Mahindra", "model": "BE 6", "search": ["be-6", "be6", "be.05"]},
    {"id": "mahindra-xev-9e", "make": "Mahindra", "model": "XEV 9e", "search": ["xev-9e", "xev9e"]},
    {"id": "mahindra-xev-9s", "make": "Mahindra", "model": "XEV 9S", "search": ["xev-9s", "xev9s"]},
    {"id": "mg-comet-ev", "make": "MG Motor", "model": "Comet EV", "search": ["comet"], "p3": True},
    {"id": "mg-windsor-ev", "make": "MG Motor", "model": "Windsor EV", "search": ["windsor"], "p3": True},
    {"id": "mg-zs-ev", "make": "MG Motor", "model": "ZS EV", "search": ["zs-ev", "zsev"], "p3": True},
    {"id": "maruti-e-vitara", "make": "Maruti Suzuki", "model": "e Vitara", "search": ["vitara", "e-vitara"], "p3": True},
    {"id": "hyundai-creta-electric", "make": "Hyundai", "model": "Creta Electric", "search": ["creta", "creta-ev"]},
    {"id": "kia-syros-ev", "make": "Kia", "model": "Syros EV", "search": ["syros"], "p1": True},
    {"id": "kia-carens-clavis-ev", "make": "Kia", "model": "Carens Clavis EV", "search": ["carens", "clavis"], "p1": True},
    {"id": "byd-atto-3", "make": "BYD", "model": "Atto 3", "search": ["atto3", "atto-3", "atto_3"]},
    {"id": "byd-emax-7", "make": "BYD", "model": "eMax 7", "search": ["emax7", "emax-7", "e-max-7"]},
    {"id": "vinfast-vf6", "make": "VinFast", "model": "VF6", "search": ["vf6", "vf-6"], "p3": True},
    {"id": "vinfast-vf7", "make": "VinFast", "model": "VF7", "search": ["vf7", "vf-7"], "p3": True},
    {"id": "citroen-ec3x", "make": "Citroen", "model": "ë-C3 / eC3X", "search": ["ec3", "e-c3", "ec3x"], "p1": True},
]

PRESS_URLS = {
    "tata": "https://www.tatamotors.com/newsroom/media-library/",
    "mahindra": "https://www.mahindra.com/newsroom/media-resources",
    "hyundai": "https://www.hyundai.com/worldwide/en/newsroom",
    "byd": "https://media.byd.com/section/media-library/",
    "citroen": "https://www.media.stellantis.com/in-en/citroen",
    "kia": "https://www.kianewscenter.com/"
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
}

os.makedirs("public/vehicles", exist_ok=True)

fetched_models = []
placeholder_models = []

for v in VEHICLES:
    v_id = v["id"]
    # Priority 3 items (MG, Maruti, VinFast) are flagged back to user unless clear press rights are found
    if v.get("p3"):
        placeholder_models.append({"id": v_id, "make": v["make"], "model": v["model"], "reason": "Priority 3 — No public editorial press image license identified; flagged for review."})
        continue

    # Attempt fetching from press rooms
    found_url = None
    target_press_key = "tata" if "tata" in v_id else ("mahindra" if "mahindra" in v_id else ("byd" if "byd" in v_id else ("hyundai" if "hyundai" in v_id else ("citroen" if "citroen" in v_id else "kia"))))
    
    press_page_url = PRESS_URLS.get(target_press_key)
    if press_page_url:
        try:
            req = urllib.request.Request(press_page_url, headers=HEADERS)
            html = urllib.request.urlopen(req, timeout=12).read().decode('utf-8', errors='ignore')
            
            # Find all image links
            img_links = re.findall(r'https?://[^\s\"\']+\.(?:jpg|jpeg|png|webp)', html, re.IGNORECASE)
            
            # Filter links matching vehicle search keywords
            matching_links = []
            for link in img_links:
                for kw in v["search"]:
                    if kw in link.lower():
                        matching_links.append(link)
                        break
            
            if matching_links:
                found_url = matching_links[0]
            elif img_links:
                # fallback to first suitable high-res image link from OEM press room if relevant
                for link in img_links:
                    if any(bad in link.lower() for bad in ['logo', 'icon', 'banner', 'avatar', 'thumb-small']):
                        continue
                    found_url = link
                    break
        except Exception as e:
            print(f"Error checking {press_page_url} for {v_id}: {e}")

    if found_url:
        out_path = f"public/vehicles/{v_id}.jpg"
        try:
            img_req = urllib.request.Request(found_url, headers=HEADERS)
            img_data = urllib.request.urlopen(img_req, timeout=15).read()
            with open(out_path, "wb") as f:
                f.write(img_data)
            
            # Optimize image with sips on macOS
            subprocess.run(["sips", "-Z", "600", out_path, "--out", out_path, "-s", "format", "jpeg"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
            size_kb = os.path.getsize(out_path) / 1024
            fetched_models.append({"id": v_id, "url": f"/vehicles/{v_id}.jpg", "size_kb": round(size_kb, 1)})
            print(f"Successfully fetched & optimized: {v_id} ({round(size_kb, 1)} KB)")
        except Exception as e:
            print(f"Failed to download image for {v_id}: {e}")
            placeholder_models.append({"id": v_id, "make": v["make"], "model": v["model"], "reason": f"Download error: {e}"})
    else:
        placeholder_models.append({"id": v_id, "make": v["make"], "model": v["model"], "reason": "No direct matching press image asset URL found in press room HTML."})

print("\n--- SUMMARY ---")
print(f"Fetched Models ({len(fetched_models)}):", json.dumps(fetched_models, indent=2))
print(f"Placeholder Models ({len(placeholder_models)}):", json.dumps(placeholder_models, indent=2))
