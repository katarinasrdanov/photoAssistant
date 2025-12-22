from pathlib import Path
import json
import re

import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin


STATIC_DIR = Path(__file__).resolve().parent.parent / "frontend" / "static"


def fetch_and_save_data():
    # URL strani z informacijami o fazi lune
    url = "https://www.timeanddate.com/astronomy/slovenia/ljubljana"

    headers = {
    'Accept-Language': 'en'  # Postavi na 'en' za engleski jezik
    }

    #zahteva za pridobitev strani
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        #ustvarjanje BeautifulSoup objekta
        soup = BeautifulSoup(response.text, 'html.parser')

        #faza lune
        qlook_div = soup.find('div', id='qlook')
        moon_phase_tag = qlook_div.find('a', href=True)
        moon_phase = moon_phase_tag.get_text(strip=True) if moon_phase_tag else "No data."

        #odstotek iluminacije lune
        illumination_tag = soup.find('span', {'id': 'cur-moon-percent'})
        illumination = illumination_tag.text.strip() if illumination_tag else "No data."

        #slika faze lune
        moon_image_tag = soup.find('img', {'id': 'cur-moon'})
        if moon_image_tag and moon_image_tag.get('src'):
            moon_image_url = urljoin(url, moon_image_tag['src'])  #sestavim popoln URL
        else:
            moon_image_url = "No data."

        # Ekstrakcija vremena izlaska Meseca ("Moonrise")
        moonrise_cell = soup.select_one('th:-soup-contains("Moonrise Today:") + td')
        moonrise = moonrise_cell.text.strip() if moonrise_cell else "No data."
        moonrise = re.split(r'[\u2191\s]', moonrise)[0] if moonrise != "No data." else moonrise  # Izvlači samo vreme

        # Ekstrakcija vremena zalaska Meseca ("Moonset")
        moonset_cell = soup.select_one('th:-soup-contains("Moonset Today:") + td')
        moonset = moonset_cell.text.strip() if moonset_cell else "No data."
        moonset = re.split(r'[\u2191\s]', moonset)[0] if moonset != "No data." else moonset  # Izvlači samo vreme

        # Inicijalizacija prazne liste za podatke o izlasku i zalasku Meseca po danu
        forecast_data = []

        # Pronađi sve redove sa podacima za svaki dan
        rows = soup.select('table#tb-7dmn tbody tr')

        # Iteriraj kroz svaki red i izvuči podatke
        for row in rows:
            date = row.find('th').text.strip()  # Datum
            # Formatiraj datum
            date = date.replace('Jan', '01')
            date = date.replace('Dec', '12')
            date = f"2025-{date.split()[1]}-{date.split()[0]}"  # Formatiraj kao YYYY-MM-DD.
            
            moonrise_cell = row.select_one('td[title*="The Moon rises"]')
            moonset_cell = row.select_one('td[title*="The Moon sets"]')

            # Ako postoje podaci za Moonrise i Moonset
            if moonrise_cell and moonset_cell:
                moonrise_time = moonrise_cell.text.strip() if moonrise_cell else "No data."
                moonset_time = moonset_cell.text.strip() if moonset_cell else "No data."

                # Dodaj podatke u listu u formatu JSON
                forecast_data.append({
                    "date": date,
                    "moonrise": moonrise_time,
                    "moonset": moonset_time
                })

        data = {
            "moon_phase": moon_phase,
            "moon_illumination": illumination,
            "moon_image_url": moon_image_url,
            "moon_rise": moonrise,
            "moon_set": moonset,
            "forecast": forecast_data
        }

        #shranim podatke v json datoteko
        output_file = STATIC_DIR / "scraped_moon_data.json"
        with open(output_file, "w") as json_file:
            json.dump(data, json_file, indent=4)

        print("Data has been saved to 'scraped_moon_data.json'.")

    else:
        print("Error fetching the page. Status code:", response.status_code)