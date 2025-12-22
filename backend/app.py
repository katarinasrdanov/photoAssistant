from pathlib import Path

from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv()

from clientGRPC import (
    get_night_event_stub,
    get_upcoming_night_sky_events_stub,
    get_visibility_stub,
    save_camera_stub,
)
import openData
import openWeather
from moon_scraper import fetch_and_save_data

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"

app = Flask(
    __name__,
    template_folder=str(FRONTEND_DIR / "templates"),
    static_folder=str(FRONTEND_DIR / "static"),
    static_url_path="/static",
)
CORS(app)

@app.route('/')
def home():
    return render_template('index.html')

###############################################################################################################

@app.route('/weather', methods=['GET'])
def get_weather_by_coords():
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    weather_info = openWeather.get_weather_by_coords(lat, lon)
    return jsonify(weather_info) #pretvarjam nazaj v json za http odgovor (komunikacija med odjemalcem in streznikom je v JSON formatu)

@app.route('/forecast', methods=['GET'])
def get_forecast_by_coords():
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    forecast_info = openWeather.get_forecast_by_coords(lat, lon)
    return jsonify(forecast_info)

@app.route('/weather/<city>', methods=['GET'])
def get_weather(city):
    weather_info = openWeather.get_weather(city)
    return jsonify(weather_info)

@app.route('/forecast/<city>', methods=['GET'])
def get_forecast(city):
    forecast_info = openWeather.get_forecast(city)
    return jsonify(forecast_info)

###############################################################################################################

@app.route('/scrape-moon', methods=['POST'])
def scrape_moon_data():
    fetch_and_save_data()
    return jsonify({"message": "Scraping completed and data updated!"})

###############################################################################################################

@app.route('/get-visibility', methods=['GET'])
def get_visibility():
    location = request.args.get('location') #parameter iz url ki ga poslje scriptgrpc

    if location:
        response = get_visibility_stub(location) # Pozivam gRPC stub funkciju koja koristi clienta grpc da posalje zahtevo serveru grpc
        return jsonify({"visibility": response.level}) #vrati scriptgrpc-ju level
    else:
        return jsonify({"error": "Location is required!"}), 400


@app.route('/get-night-event', methods=['GET'])
def get_night_event():
    response = get_night_event_stub()
    return jsonify({"title": response.title, "details": response.details})


@app.route('/save-camera', methods=['POST'])
def save_camera():
    data = request.json
    if 'model' in data and 'details' in data:
        response = save_camera_stub(data['model'], data['details'])
        return jsonify({"model": response.model, "details": response.details})
    else:
        return jsonify({"error": "Model and details are required!"}), 400
    

@app.route('/get-upcoming-night-sky-events', methods=['GET'])
def get_upcoming_night_sky_events():
    period = request.args.get('period', 'next 7 days') #privzeto 7 dni
    response_iterator = get_upcoming_night_sky_events_stub(period)

    events = []
    for response in response_iterator:
        events.append({"date": response.date, "event": response.event})

    return jsonify({"upcoming_night_sky_events": events})

###############################################################################################################

@app.route('/get_data/<year>')
def get_data_by_year(year):
    data = openData.get_cloudy_days_per_station(year)
    return jsonify(data)

###############################################################################################################

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)