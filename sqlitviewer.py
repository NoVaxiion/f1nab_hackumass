from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import time

# Configure Chrome options
options = Options()
options.add_argument('--headless')  # Run Chrome in headless mode
service = Service(executable_path='/path/to/chromedriver')

# Initialize the Chrome driver
driver = webdriver.Chrome(service=service, options=options)

race_data = []

def scrape_race_data(year):
    url = f"https://www.formula1.com/{year}/results.html"  # Example URL
    driver.get(url)
    time.sleep(2)  # Allow page to load

    # Locate race elements (Update selectors as per actual structure)
    races = driver.find_elements(By.CSS_SELECTOR, ".race-entry")
    for race in races:
        race_name = race.find_element(By.CSS_SELECTOR, ".race-name").text
        race_url = race.find_element(By.CSS_SELECTOR, "a").get_attribute("href")

        # Visit each race page to get lap times
        driver.get(race_url)
        time.sleep(2)

        # Scrape lap times (Assume a table format)
        lap_times = []
        lap_table = driver.find_element(By.CSS_SELECTOR, ".lap-time-table")
        rows = lap_table.find_elements(By.TAG_NAME, "tr")

        for row in rows:
            columns = row.find_elements(By.TAG_NAME, "td")
            if columns:
                driver_name = columns[0].text
                lap_time = columns[1].text
                lap_times.append({"driver_name": driver_name, "lap_time": lap_time})

        race_data.append({
            "race_name": race_name,
            "year": year,
            "lap_times": lap_times
        })

# Scrape race data for years 2000-2024
for year in range(2000, 2025):
    scrape_race_data(year)

# Close the driver
driver.quit()
