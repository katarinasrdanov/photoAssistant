import sys
sys.path.append(".")

import openWeather

# ---------- MOCK RESPONSE ----------
class MockResponse:
    def __init__(self, json_data):
        self._json = json_data

    def json(self):
        return self._json


# ---------- FIXED TEST DATA ----------
MOCK_WEATHER_RESPONSE = {
    "weather": [{"main": "Clear", "description": "clear sky", "icon": "01d"}],
    "main": {"temp": 15},
    "clouds": {"all": 5},
    "rain": {"1h": 0},
    "sys": {"sunrise": 1700000000, "sunset": 1700030000},
    "name": "Ljubljana"
}

MOCK_FORECAST_RESPONSE = {
    "list": [
        {
            "dt_txt": "2024-01-01 12:00:00",
            "main": {"temp": 10},
            "weather": [{"description": "clear", "icon": "01d"}]
        },
        {
            "dt_txt": "2024-01-01 15:00:00",
            "main": {"temp": 14},
            "weather": [{"description": "clear", "icon": "01d"}]
        }
    ]
}


# ---------- TESTS ----------
def test_get_weather_by_coords(monkeypatch):
    def mock_get(*args, **kwargs):
        return MockResponse(MOCK_WEATHER_RESPONSE)

    monkeypatch.setattr(openWeather.requests, "get", mock_get)

    result = openWeather.get_weather_by_coords(46.05, 14.51)

    assert result["weather"] == "Clear"
    assert result["temperature"] == 15
    assert "sunrise" in result
    assert "sunset" in result


def test_get_weather_city(monkeypatch):
    def mock_get(*args, **kwargs):
        return MockResponse(MOCK_WEATHER_RESPONSE)

    monkeypatch.setattr(openWeather.requests, "get", mock_get)

    result = openWeather.get_weather("Ljubljana")

    assert result["city"] == "Ljubljana"
    assert result["weather"] == "Clear"


def test_weather_rain_default(monkeypatch):
    data = MOCK_WEATHER_RESPONSE.copy()
    data.pop("rain")

    def mock_get(*args, **kwargs):
        return MockResponse(data)

    monkeypatch.setattr(openWeather.requests, "get", mock_get)

    result = openWeather.get_weather("Ljubljana")

    assert result["rain"] == 0


def test_forecast_by_coords(monkeypatch):
    def mock_get(*args, **kwargs):
        return MockResponse(MOCK_FORECAST_RESPONSE)

    monkeypatch.setattr(openWeather.requests, "get", mock_get)

    result = openWeather.get_forecast_by_coords(46, 14)

    assert len(result) == 1
    assert result[0]["min_temp"] == 10
    assert result[0]["max_temp"] == 14


def test_forecast_city(monkeypatch):
    def mock_get(*args, **kwargs):
        return MockResponse(MOCK_FORECAST_RESPONSE)

    monkeypatch.setattr(openWeather.requests, "get", mock_get)

    result = openWeather.get_forecast("Ljubljana")

    assert isinstance(result, list)
    assert "date" in result[0]


def test_weather_temperature_is_int(monkeypatch):
    def mock_get(*args, **kwargs):
        return MockResponse(MOCK_WEATHER_RESPONSE)

    monkeypatch.setattr(openWeather.requests, "get", mock_get)

    result = openWeather.get_weather("Ljubljana")

    assert isinstance(result["temperature"], int)


def test_weather_clouds(monkeypatch):
    def mock_get(*args, **kwargs):
        return MockResponse(MOCK_WEATHER_RESPONSE)

    monkeypatch.setattr(openWeather.requests, "get", mock_get)

    result = openWeather.get_weather("Ljubljana")

    assert result["clouds"] == 5


def test_weather_icon(monkeypatch):
    def mock_get(*args, **kwargs):
        return MockResponse(MOCK_WEATHER_RESPONSE)

    monkeypatch.setattr(openWeather.requests, "get", mock_get)

    result = openWeather.get_weather("Ljubljana")

    assert result["icon"] == "01d"


def test_forecast_icon(monkeypatch):
    def mock_get(*args, **kwargs):
        return MockResponse(MOCK_FORECAST_RESPONSE)

    monkeypatch.setattr(openWeather.requests, "get", mock_get)

    result = openWeather.get_forecast("Ljubljana")

    assert "icon" in result[0]


def test_weather_keys_exist(monkeypatch):
    def mock_get(*args, **kwargs):
        return MockResponse(MOCK_WEATHER_RESPONSE)

    monkeypatch.setattr(openWeather.requests, "get", mock_get)

    result = openWeather.get_weather("Ljubljana")

    for key in ["weather", "temperature", "sunrise", "sunset"]:
        assert key in result
