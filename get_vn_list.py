import requests
import json
import random
import time

# The URL for the VNDB API's visual novel endpoint.
API_URL = 'https://api.vndb.org/kana/vn'

# Standard headers for JSON POST requests.
HEADERS = {
    'Content-Type': 'application/json'
}

def find_vns_bulk_method():
    """Finds 100 VNs using a bulk-fetch-and-randomize method and saves them to a file."""
    print("Attempting to fetch a large batch of VNs that meet the initial criteria...")

    # 1. Fetch a large batch of VNs that meet the API-filterable criteria.
    # We fetch more than 100 to account for the local filtering we'll do next.
    # The API is limited to a maximum of 100 results per request, so we will do multiple requests to get 300 VNs
    
    vns_from_api = []
    page = 1
    while len(vns_from_api) < 300:
        payload = {
            "filters": [
                "and",
                ["olang", "=", "ja"],
                ["votecount", ">", 1000]
            ],
            "fields": "tags.id",
            "sort": "votecount", # Sorting by a field like votecount to get a varied list.
            "reverse": True,
            "results": 100, # Request the maximum allowed number of results.
            "page": page
        }

        try:
            response = requests.post(API_URL, headers=HEADERS, json=payload)
            response.raise_for_status()
            data = response.json()
            
            if not data['results']:
                # No more results to fetch.
                break

            vns_from_api.extend(data['results'])
            print(f"Fetched page {page}. Total VNs so far: {len(vns_from_api)}")
            page += 1
            
            # Respect API rate limits
            time.sleep(2)

        except requests.exceptions.RequestException as e:
            print(f"An API error occurred: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Error details: {e.response.text}")
                if e.response.status_code == 429:
                    print("Rate limit exceeded. Waiting for 60 seconds...")
                    time.sleep(60)
            break # Exit loop on error

    if not vns_from_api:
        print("Could not fetch any VNs from the API. Exiting.")
        return

    # 2. Randomize the order of the fetched VNs.
    random.shuffle(vns_from_api)

    # 3. Iterate through the randomized list and check the final criterion.
    found_vns = set()
    print("\nFiltering the fetched VNs to find 100 that match all criteria...")
    for vn in vns_from_api:
        if len(found_vns) >= 100:
            break # We have found enough.

        tags = vn.get('tags', [])
        if len(tags) > 20:
            vn_id = vn['id']
            if vn_id not in found_vns:
                found_vns.add(vn_id)
                print(f"Found VN: {vn_id} ({len(found_vns)}/100)")

    # 4. Output the list to a JSON file.
    if len(found_vns) >= 100:
        vn_list = sorted(list(found_vns))
        with open('vn_list.json', 'w') as f:
            json.dump(vn_list, f, indent=2)
        print(f"\nSuccessfully created vn_list.json with {len(found_vns)} VN IDs.")
    else:
        print(f"\nCould only find {len(found_vns)} VNs that met all criteria. Consider fetching a larger initial batch.")


if __name__ == "__main__":
    find_vns_bulk_method()