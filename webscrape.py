from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

# Set up Chrome options
options = Options()
options.add_argument('--headless')  # Run in headless mode (optional)
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

# Specify the path to your ChromeDriver
service = Service("C:\\path\\to\\chromedriver.exe")  # Replace with your actual path to chromedriver.exe

# Initialize the Chrome driver
driver = webdriver.Chrome(service=service, options=options)

# Define the URL you want to scrape
url = "https://www.formula1.com/en/results.html"  # Example URL; replace with the actual URL
driver.get(url)
time.sleep(2)  # Allow some time for the page to load

# Example scraping logic to gather race data
race_data = []

# Find all race entries on the page
try:
    races = driver.find_elements(By.CSS_SELECTOR, ".race-entry")  # Update selector based on actual HTML structure
    for race in races:
        race_name = race.find_element(By.CSS_SELECTOR, ".race-name").text  # Replace with actual selector for race name
        year = 2024  # Set the year or get it dynamically if available on the page

        # Go to the race-specific page for lap details
        race_url = race.find_element(By.CSS_SELECTOR, "a").get_attribute("href")
        driver.get(race_url)
        time.sleep(2)  # Allow time for the race page to load

        # Scrape lap times from the race page
        lap_times = []
        lap_table = driver.find_element(By.CSS_SELECTOR, ".lap-time-table")  # Update selector as needed
        rows = lap_table.find_elements(By.TAG_NAME, "tr")

        for lap_no, row in enumerate(rows, start=1):
            columns = row.find_elements(By.TAG_NAME, "td")
            if columns:
                driver_name = columns[0].text
                lap_time = columns[1].text
                lap_times.append({
                    "driver_name": driver_name,
                    "lap_no": lap_no,
                    "lap_time": lap_time
                })

        # Add data to race_data list
        race_data.append({
            "race_name": race_name,
            "year": year,
            "lap_times": lap_times
        })

        # Navigate back to the main results page
        driver.get(url)
        time.sleep(2)
except Exception as e:
    print("An error occurred during scraping:", e)

# Close the driver
driver.quit()

# Print out the scraped race data
for race in race_data:
    print(f"Race: {race['race_name']} ({race['year']})")
    for lap in race['lap_times']:
        print(f"Driver: {lap['driver_name']}, Lap: {lap['lap_no']}, Time: {lap['lap_time']}")
