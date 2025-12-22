from datetime import datetime
import requests

import os
API_KEY = os.getenv("OPENWEATHER_API_KEY")
if not API_KEY:
    raise RuntimeError("OPENWEATHER_API_KEY not set")

#na osnovi koordinat (geolocation)
def get_weather_by_coords(lat, lon):
    weather_data = requests.get(
        f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&APPID={API_KEY}"
    )
    data = weather_data.json() #pretvarjam json iz apija v python berljivo kodo
    weather = data['weather'][0]['main']
    temp = round(data['main']['temp'])
    icon = data['weather'][0]['icon']
    clouds = data['clouds']['all']
    rain = data.get('rain', {}).get('1h', 0)
    sunrise = datetime.utcfromtimestamp(data['sys']['sunrise']).strftime('%H:%M')
    sunset = datetime.utcfromtimestamp(data['sys']['sunset']).strftime('%H:%M')

    return {
        "city": data.get("name", "Your Location"),
        "weather": weather,
        "temperature": temp,
        "icon": icon,
        "clouds": clouds,
        "sunrise": sunrise,
        "sunset": sunset,
        "rain": rain
    }

def get_forecast_by_coords(lat, lon):
    forecast_data = requests.get(
        f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&units=metric&APPID={API_KEY}"
    )
    data = forecast_data.json()
    daily_data = {}

    #Grupiram podatke po datumu
    for entry in data['list']:
        date = entry['dt_txt'].split(" ")[0] #izvlecem datum
        temp = entry['main']['temp']
        weather = entry['weather'][0]['description']
        icon = entry['weather'][0]['icon']

        if date not in daily_data:
            daily_data[date] = {"temperatures": [], "weathers": [], "icons": []}

        daily_data[date]["temperatures"].append(temp)
        daily_data[date]["weathers"].append(weather)
        daily_data[date]["icons"].append(icon)

    #povzetek napovedi
    forecast_summary = []
    for date, info in daily_data.items():
        forecast_summary.append({
            "date": date,
            "min_temp": round(min(info["temperatures"])),
            "max_temp": round(max(info["temperatures"])),
            "weather": max(set(info["weathers"]), key=info["weathers"].count),
            "icon": info["icons"][0], #prva ikona dana
        })

    return forecast_summary

#na osnovi vnosa
def get_weather(city):
    weather_data = requests.get(f"https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&APPID={API_KEY}")

    #print(weather_data.json())
    
    data = weather_data.json()
    weather = data['weather'][0]['main'] #brez 0 dobim error
    temp = round(data['main']['temp']) #round da ne bo temp 3,14 stepena nego 3
    icon = data['weather'][0]['icon']
    clouds = data['clouds']['all']
    rain = data.get('rain', {}).get('1h', 0)  #kisa v poslednji uri (mm)
        
    #pretvarjanje vremena v format ura:minuti
    sunrise = datetime.utcfromtimestamp(data['sys']['sunrise']).strftime('%H:%M')
    sunset = datetime.utcfromtimestamp(data['sys']['sunset']).strftime('%H:%M')

    return {
        "city": city,
        "weather": weather,
        "temperature": temp,
        "icon": icon,
        "clouds": clouds,
        "sunrise": sunrise,
        "sunset": sunset,
        "rain": rain
    }

def get_forecast(city):
    forecast_data = requests.get(
        f"https://api.openweathermap.org/data/2.5/forecast?q={city}&units=metric&appid={API_KEY}"
    )

    data = forecast_data.json()
    daily_data = {}

    for entry in data['list']:
        date = entry['dt_txt'].split(" ")[0]
        temp = entry['main']['temp']
        weather = entry['weather'][0]['description']
        icon = entry['weather'][0]['icon']

        if date not in daily_data:
            daily_data[date] = {
                "temperatures": [],
                "weathers": [],
                "icons": [],
            }

        daily_data[date]["temperatures"].append(temp)
        daily_data[date]["weathers"].append(weather)
        daily_data[date]["icons"].append(icon)

    forecast_summary = []
    for date, info in daily_data.items():
        forecast_summary.append({
            "date": date,
            "min_temp": round(min(info["temperatures"])),
            "max_temp": round(max(info["temperatures"])),
            "weather": max(set(info["weathers"]), key=info["weathers"].count),
            "icon": info["icons"][0], 
        })

    return forecast_summary