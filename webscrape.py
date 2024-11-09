import requests
import sqlite3
import json

# Function to fetch F1 race data
def fetch_f1_data(years):
    base_url = "https://ergast.com/api/f1"
    all_races = []
    
    for year in years:
        url = f"{base_url}/{year}.json"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            races = data['MRData']['RaceTable']['Races']
            
            if races:
                for race in races:
                    race_info = {
                        "year": year,
                        "race_name": race['raceName'],
                        "date": race['date'],
                        "circuit_name": race['Circuit']['circuitName'],
                        "location": race['Circuit']['Location']['locality'],
                        "country": race['Circuit']['Location']['country']
                    }
                    all_races.append(race_info)
        else:
            print(f"Failed to fetch data for {year} (Status Code: {response.status_code})")
    
    return all_races

# Function to insert data into the database
def insert_f1_data(races):
    conn = sqlite3.connect('f1_race_data.db')
    cursor = conn.cursor()
    
    # Create table if it doesn't exist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS races (
            id INTEGER PRIMARY KEY,
            year INTEGER,
            race_name TEXT,
            date TEXT,
            circuit_name TEXT,
            location TEXT,
            country TEXT
        )
    ''')
    
    # Insert race data into the table
    for race in races:
        cursor.execute('''
            INSERT INTO races (year, race_name, date, circuit_name, location, country)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (race['year'], race['race_name'], race['date'], race['circuit_name'], race['location'], race['country']))
    
    conn.commit()
    conn.close()
    print("Database filled successfully.")

# Main function to fetch and store data
def main():
    # Specify the years for which you want to fetch the data
    years = [2010, 2011, 2012, 2013, 2014, 2015]
    
    # Fetch F1 race data
    races = fetch_f1_data(years)
    
    # Insert the data into the database
    insert_f1_data(races)

# Run the script
if __name__ == "__main__":
    main()
