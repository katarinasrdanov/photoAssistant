function getWeatherByLocation(showAlert = false) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                fetch(`http://127.0.0.1:5000/weather?lat=${lat}&lon=${lon}`)
                    .then(response => response.json()) // Parse JSON format to JS object
                    .then(data => {
                        renderWeather(data);
                        if (showAlert) {
                            alert("Current weather has been refreshed!");
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching weather data:', error);
                        document.getElementById('forecast').innerHTML = `<p class="error">Could not fetch weather data for your location.</p>`;
                    });

                getMoonData();
            },
            (error) => {
                console.error('Geolocation error:', error);
                document.getElementById('forecast').innerHTML = `<p class="error">Location permission denied. Please allow location access for this feature.</p>`;
            }
        );
    } else {
        document.getElementById('forecast').innerHTML = `<p class="error">Geolocation is not supported by your browser.</p>`;
    }
}

function getForecastByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                fetch(`http://127.0.0.1:5000/forecast?lat=${lat}&lon=${lon}`)
                    .then(response => response.json())
                    .then(data => renderForecast(data))
                    .catch(error => {
                        console.error('Error fetching forecast data:', error);
                        document.getElementById('forecast-multi').innerHTML = `<p class="error">Could not fetch forecast data for your location.</p>`;
                    });
            },
            (error) => {
                console.error('Geolocation error:', error);
                document.getElementById('forecast-multi').innerHTML = `<p class="error">Location permission denied. Please allow location access for this feature.</p>`;
            }
        );
    } else {
        document.getElementById('forecast-multi').innerHTML = `<p class="error">Geolocation is not supported by your browser.</p>`;
    }
}

function getWeather() {
    const city = document.getElementById('city').value; //iz inputa

    fetch(`http://127.0.0.1:5000/weather/${city}`)
        .then(response => response.json())
        .then(data => renderWeather(data))
        .catch(error => {
            console.error('Error fetching weather data:', error);
            document.getElementById('forecast').innerHTML = `<p class="error">No weather data for the selected input.</p>`;
        });
    getMoonData();
    getForecast();
}

function getForecast() {
    const city = document.getElementById('city').value;

    fetch(`http://127.0.0.1:5000/forecast/${city}`)
        .then(response => response.json())
        .then(data => renderForecast(data))
        .catch(error => {
            console.error('Error fetching forecast data:', error);
            document.getElementById('forecast-multi').innerHTML = `<p class="error">No forecast data for the selected input.</p>`;
        });
}

function renderWeather(data) {
    if (data.error) {
        document.getElementById('forecast').innerHTML = `<p class="error">${data.error}</p>`;
    } else {
        document.getElementById('forecast').innerHTML = `
            <div class="forecast-container">
                <h1><i class="fas fa-map-marker-alt"></i> ${data.city}</h1>
                <div class="weather-info">
                    <img src="http://openweathermap.org/img/wn/${data.icon}.png" alt="Weather Icon">
                    <div class="temperature">
                        <h3>${data.weather}</h3>
                        <p>${data.temperature}°C</p>
                    </div>
                </div>
                <div class="additional-info">
                    <p><strong><i class="fas fa-cloud"></i></strong> ${data.clouds}%</p>
                    <p><strong><i class="fas fa-sun"></i> ↑</strong>${data.sunrise} ↓${data.sunset}</p>
                    <p><strong><i class="fas fa-cloud-rain"></i></strong> ${data.rain}mm in last hour</p>
                </div>
                <button class="refresh-button" onclick="getWeatherByLocation(true)">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button
            </div>
        `;
    }
}

function renderForecast(data) {
    let forecastHTML = `<div class="forecast-container1">`;

    data.forEach(day => {
        forecastHTML += `
            <div class="forecast-day">
                <h3>${day.date}</h3>
                <div class="day-info">
                    <img src="http://openweathermap.org/img/wn/${day.icon}.png" alt="Weather Icon">
                    <p>🌡️ ${day.min_temp}°C / ${day.max_temp}°C</p>
                    <p>${day.weather}</p>
                </div>
                <div class="moon-info" id="moon-info-${day.date}">
                    <!-- Podaci o mesecu će biti dodani ovde -->
                </div>
            </div>
        `;

        renderMoonForecast(day.date);  
    });

    forecastHTML += `</div>`;
    document.getElementById('forecast-multi').innerHTML = forecastHTML;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getMoonData() {
    fetch('/static/scraped_moon_data.json')
        .then(response => response.json())
        .then(data => renderMoonData(data))
        .catch(error => {
            console.error('Error fetching moon data:', error);
            document.getElementById('moon-data').innerHTML = `<p class="error">Could not fetch moon data.</p>`;
        });
}

function renderMoonData(data) {
    document.getElementById('moon-data').innerHTML = `
        <div class="forecast-container">
            <h1><i class="fas fa-moon"></i> Moon Data</h1>
            <div class="moon-info">
                <p><strong>Phase:</strong> ${data.moon_phase}</p><div>
                    <img src="${data.moon_image_url}" alt="Moon Phase Image" style="width:100px;">
                </div>
                <p><strong>Illumination:</strong> ${data.moon_illumination}</p>
                <p><i class="fas fa-moon"></i> ↑</strong>${data.moon_rise} ↓${data.moon_set}</p>

            </div>
        </div>
    `;
}

function renderMoonForecast(date) {
    fetch('/static/scraped_moon_data.json')
        .then(response => response.json())
        .then(data => {
            // Traženje podataka o mesecu na osnovu datuma
            const moonDay = data.forecast.find(item => formatDate(item.date) === formatDate(date));

            if (moonDay) {
                const moonInfoDiv = document.getElementById(`moon-info-${date}`);
                moonInfoDiv.innerHTML = `
                    <p>🌕 Moonrise: ${moonDay.moonrise}</p>
                    <p>🌖 Moonset: ${moonDay.moonset}</p>
                `;
            } else {
                console.log(`No moon data found for date ${date}`);
            }
        })
        .catch(error => console.error('Error loading moon data:', error));
}

// Funkcija koja pokreće asinhroni zahtev za podatke o mesecu
async function fetchMoonData() {
    const response = await fetch('/scrape-moon', { method: 'POST' });
    const result = await response.json();
    document.getElementById('scrape-message').textContent = result.message;

    // Osveži prikaz podataka
    getMoonData();
}

// Postavljanje intervala za pozivanje funkcije svakih sat (u milisekundama - 30s je 30000)
setInterval(fetchMoonData, 3600000);

function formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//ko se stran zazene se poklice api za vreme preko lat in lon
window.onload = () => {
    getWeatherByLocation();
    getForecastByLocation();
    getMoonData();
    const defaultButton = document.querySelector('.condition-button');
    filterTips(defaultButton.textContent, defaultButton);
    updateChart(2014);
};