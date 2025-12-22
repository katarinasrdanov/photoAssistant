/**
 * @jest-environment jsdom
 */

const {
  renderWeather,
  renderForecast,
  formatDate,
  getWeather,
  getForecast,
  getWeatherByLocation,
  getForecastByLocation,
  getMoonData,
  renderMoonData
} = require('../static/scriptOpenWeather');

// -------------------- MOCKS --------------------

global.fetch = jest.fn();

const mockGeolocation = {
  getCurrentPosition: jest.fn()
};

beforeAll(() => {
  global.navigator.geolocation = mockGeolocation;
});

beforeEach(() => {
  document.body.innerHTML = `
    <input id="city" value="Ljubljana" />
    <div id="forecast"></div>
    <div id="forecast-multi"></div>
    <div id="moon-data"></div>
  `;
  jest.clearAllMocks();
});

// -------------------- TESTI --------------------

test('formatDate formats date correctly', () => {
  const result = formatDate('2025-01-05');
  expect(result).toBe('2025-01-05');
});

test('renderWeather shows error message when data.error exists', () => {
  renderWeather({ error: 'City not found' });
  expect(document.getElementById('forecast').textContent)
    .toContain('City not found');
});

test('renderWeather renders weather data correctly', () => {
  renderWeather({
    city: 'Maribor',
    weather: 'Clear',
    temperature: 10,
    icon: '01d',
    clouds: 20,
    sunrise: '07:30',
    sunset: '17:00',
    rain: 0
  });

  expect(document.getElementById('forecast').innerHTML)
    .toContain('Maribor');
  expect(document.getElementById('forecast').innerHTML)
    .toContain('10°C');
});

test('renderForecast renders multiple days', () => {
  fetch.mockResolvedValueOnce({
    json: () => Promise.resolve({ forecast: [] })
  });

  renderForecast([
    {
      date: '2025-01-01',
      min_temp: 1,
      max_temp: 5,
      weather: 'Cloudy',
      icon: '02d'
    }
  ]);

  expect(document.getElementById('forecast-multi').innerHTML)
    .toContain('2025-01-01');
});

test('getWeather fetches data by city name', async () => {
  fetch
    .mockResolvedValueOnce({ json: () => Promise.resolve({ city: 'Ljubljana' }) }) // weather
    .mockResolvedValueOnce({ json: () => Promise.resolve({}) })                    // moon
    .mockResolvedValueOnce({ json: () => Promise.resolve([]) });                   // forecast

  await getWeather();

  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/weather/Ljubljana')
  );
});


test('getForecast fetches forecast by city name', async () => {
  fetch.mockResolvedValueOnce({
    json: () => Promise.resolve([])
  });

  await getForecast();

  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/forecast/Ljubljana')
  );
});

test('getWeatherByLocation calls geolocation API', () => {
  getWeatherByLocation();
  expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
});

test('getForecastByLocation calls geolocation API', () => {
  getForecastByLocation();
  expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
});

test('getMoonData fetches moon JSON', async () => {
  fetch.mockResolvedValueOnce({
    json: () => Promise.resolve({ moon_phase: 'Full Moon' })
  });

  await getMoonData();

  expect(fetch).toHaveBeenCalledWith('/static/scraped_moon_data.json');
});

test('renderMoonData renders moon phase', () => {
  renderMoonData({
    moon_phase: 'New Moon',
    moon_illumination: '0%',
    moon_rise: '06:00',
    moon_set: '18:00',
    moon_image_url: 'moon.png'
  });

  expect(document.getElementById('moon-data').innerHTML)
    .toContain('New Moon');
});