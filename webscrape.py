from selenium import webdriver
import pinecone 
import time 
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys

pinecone.init(api_key='your-pinecone-api-key', environment='your-environment')
index_name = 'f1-lap-times'  # or whatever we wanna call it on pinecone I think ( Kenneth pls recheck this im a tad unsure)

# Fix this :  chrome_driver_path = "" 


chrome_options = Options()
chrome_options.add_argument('--headless') # I think this makes this a bg task I be messing around tm

driver = webdriver.Chrome(service=Service(chrome_driver_path), options=chrome_options)

website_url = 'https://pitwall.app/

def get_race_urls_for_season(season):
    season_url = f"https://pitwall.app/schedule/{season}" 
    driver.get(season_url)
    
    time.sleep(5)  # time fakery

    # Scraping the race data (assuming races are listed on the page)
    race_links = driver.find_elements(By.CSS_SELECTOR, '.race-link')  
    
    race_urls = []
    for link in race_links:
        race_url = link.get_attribute('href')
        race_urls.append(race_url)
    
    return race_urls
'
def scrape_lap_time_data(): 
