from pathlib import Path

import pandas as pd
from pyaxis import pyaxis

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR.parent / "frontend" / "static"
FILE = STATIC_DIR / "0156103S.PX"  # PCAXIS datoteka

def get_cloudy_days_per_station(year):
    try:
        # Preberem datoteko
        px = pyaxis.parse(str(FILE), encoding='ISO-8859-2', lang='en') #podatki so dostopni v 2 jezika - slo in en 

        # Prikaz podatkov in metapodatkov
        #print(px['DATA'])
        #print(px['METADATA'])

        # Filtriram podatke po letu (npr 2014) i meri (oblacni dnevi -stevilo)
        filtered_data = px['DATA'][(px['DATA']['PERIOD, YEAR'] == str(year)) & (px['DATA']['MEASURE'] == 'Number of cloudy days')]

        # Konvertujem v numerički format i uklonila sem NaN vrednosti
        filtered_data.loc[:, 'DATA'] = pd.to_numeric(filtered_data['DATA'], errors='coerce')  # Convert to numbers, invalid will be NaN
        filtered_data = filtered_data.dropna(subset=['DATA']) #izlocim NaN
        
        #print(filtered_data.columns)
        #avg_cloudy = filtered_data['DATA'].mean()
        #print(f"Average number of cloudy days in 2014: {avg_cloudy}")

        # Izbrala sem stolpce stevilo oblacnih dni in stanice - samo kolone koje rabim in jih potem preimenujem
        cloudy_days_per_station = filtered_data[['METEOROLOGICAL STATION', 'DATA']]
        cloudy_days_per_station.columns = ['STATION', 'CLOUDY_DAYS']

        # Pretvorba u JSON
        return cloudy_days_per_station.to_dict(orient="records") #vrne seznam slovarjev postaj


    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}
