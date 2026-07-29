"""
Overview:
In this assignment, you will build a simple weather application that fetches the current forecast
for a specific location using the National Weather Service API.

Requirements:
1. Import the 'requests' module.
2. Define your Latitude and Longitude.
3. Make an API request to get the 'forecast' URL for your location.
4. Make a second API request to that 'forecast' URL to get the actual weather data.
5. Print the "detailedForecast" for the current period (the first item in the list).

Note: You do NOT need an API key for this specific API.
"""

# TODO: Import the requests module
# Hint: import requests


print("--- Weather App Started ---")

# ==========================================
# Step 1: Define Location
# ==========================================

# TODO: Define variables for latitude and longitude.
# You can use Google Maps to find coordinates for your city.
# Example (New York): lat = "40.7128", lon = "-74.0060"
lat = "" 
lon = "" 


# ==========================================
# Step 2: Get the Forecast URL
# ==========================================

# TODO: Create the initial API URL string.
# Format: https://api.weather.gov/points/{latitude},{longitude}
# Hint: Use an f-string: f"https://api.weather.gov/points/{lat},{lon}"
points_url = ""

# TODO: Make a GET request to the 'points_url'.
# Hint: response = requests.get(points_url)


# TODO: Convert the response to JSON format.
# Hint: data = response.json()


# TODO: Extract the 'forecast' URL from the data.
# The path in the JSON is usually: data['properties']['forecast']
forecast_url = "" 
print(f"Fetching forecast from: {forecast_url}")


# ==========================================
# Step 3: Get the Weather Data
# ==========================================

# TODO: Make a new GET request to the 'forecast_url' you just found.


# TODO: Convert this new response to JSON.


# ==========================================
# Step 4: Extract and Print
# ==========================================

# TODO: Navigate the JSON data to find the 'detailedForecast'.
# The path is usually: data['properties']['periods'][0]['detailedForecast']
# (We use [0] to get the FIRST period, which is the current weather).


# TODO: Print the detailed forecast.
print("Current Forecast:")
# print(your_forecast_variable)