import requests
import json

# The URL for the VNDB API's visual novel endpoint
api_url = "https://api.vndb.org/kana/vn"

# The headers specify that we are sending JSON data
headers = {
    "Content-Type": "application/json"
}

# The data payload for the POST request.
# It defines the filters to apply and requests the total count.
data = {
    # Filter for visual novels with a 'votecount' greater than 500
    "filters": ["votecount", ">", 1000],
    # We want the API to return the total count of matched entries
    "count": True,
    # We don't need the actual results, so we set this to 0 for efficiency
    "results": 0
}

try:
    # Send the POST request to the API
    response = requests.post(api_url, headers=headers, data=json.dumps(data))

    # Raise an exception for bad status codes (4xx or 5xx)
    response.raise_for_status()

    # Parse the JSON response from the API
    response_data = response.json()

    # Check if the 'count' key exists in the response
    if "count" in response_data:
        vn_count = response_data["count"]
        print(f"Number of visual novels with more than 500 votes: {vn_count}")
    else:
        print("Error: The 'count' field was not found in the API response.")
        print("Full response:", response_data)

except requests.exceptions.HTTPError as http_err:
    print(f"An HTTP error occurred: {http_err}")
    print(f"Response body: {response.text}")
except requests.exceptions.RequestException as req_err:
    print(f"A network error occurred: {req_err}")
except json.JSONDecodeError:
    print("Failed to decode the JSON response from the server.")