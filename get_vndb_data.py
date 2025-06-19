import requests
import json
import sys
import time

API_URL = "https://api.vndb.org/kana/vn"
OUTPUT_FILENAME = "vn_sedai.json"
YEARS_TO_FETCH = range(2000, 2025)  # 2000 to 2024 inclusive
LIMIT_PER_YEAR = 12

def fetch_vns_for_year(year, sort_by):
    """
    Fetches a list of VN titles for a given year, sorted by a specific field.
    """
    print(f"Fetching {sort_by} VNs for {year}...")
    
    # Define the filters for the API query
    # 1. Original language is Japanese.
    # 2. Released within the specified year.
    # 3. Must have a non-trial release to be included. This filters out
    #    VNs that are only available as a trial/demo.
    filters = [
        "and",
        ["olang", "=", "ja"],
        ["released", ">=", f"{year}-01-01"],
        ["released", "<=", f"{year}-12-31"],
        # This nested filter checks the releases associated with the VN.
        # It ensures the VN has at least one release that is NOT a 'trial'.
        ["release", "=", ["rtype", "!=", "trial"]]
    ]

    # Define the main payload for the POST request
    payload = {
        "filters": filters,
        "fields": "title",  # We only need the main title
        "sort": sort_by,
        "reverse": True,    # Sort in descending order
        "results": LIMIT_PER_YEAR,
        "count": False
    }

    try:
        response = requests.post(API_URL, json=payload, timeout=20)
        response.raise_for_status()  # Raises an exception for 4xx or 5xx status codes
        
        data = response.json()
        
        # Extract just the title from each result
        titles = [item.get('title', 'Unknown Title') for item in data.get('results', [])]
        return titles

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data for {year} ({sort_by}): {e}", file=sys.stderr)
        return None
    except json.JSONDecodeError:
        print(f"Error decoding JSON response for {year} ({sort_by}). Response text: {response.text}", file=sys.stderr)
        return None

def main():
    """
    Main function to orchestrate fetching, formatting, and saving data.
    """
    top_rated_vns = {}
    most_popular_vns = {}

    for year in YEARS_TO_FETCH:
        # Fetch top-rated VNs (by 'rating')
        rated_titles = fetch_vns_for_year(year, "rating")
        if rated_titles is None:
            sys.exit(1) # Exit with an error code
        top_rated_vns[str(year)] = rated_titles

        # API rate limit is 200 requests per 5 minutes. A small delay is polite.
        #time.sleep(1) 

        # Fetch most popular VNs (by 'votecount')
        popular_titles = fetch_vns_for_year(year, "votecount")
        if popular_titles is None:
            sys.exit(1) # Exit with an error code
        most_popular_vns[str(year)] = popular_titles
        
        #time.sleep(1)

    # Structure the final data according to the specified format
    final_json_data = [
        {
            "title": "Top-Rated VNs by Year (Original JP)",
            "tableData": top_rated_vns
        },
        {
            "title": "Most Popular VNs by Year (Original JP)",
            "tableData": most_popular_vns
        }
    ]

    # Save the data to a JSON file
    try:
        with open(OUTPUT_FILENAME, 'w', encoding='utf-8') as f:
            json.dump(final_json_data, f, ensure_ascii=False, indent=2)
        print(f"\nSuccessfully saved data to {OUTPUT_FILENAME}")
    except IOError as e:
        print(f"Error writing to file {OUTPUT_FILENAME}: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()