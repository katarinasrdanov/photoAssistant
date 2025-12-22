// Inicijalizacija mape in nastavljanje default viewa
var map = L.map('map').setView([39.00, -98.00], 4); // privzeto na US

// dodajanje openstreetmap layera
var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// dodajanje pollution layera
var light22 = L.tileLayer('https://darksitefinder.com/maps/tiles/2022/tile_{z}_{x}_{y}.png', { opacity: 0.5, maxNativeZoom: 6 }).addTo(map);

// geolokacija
map.locate({ setView: true, maxZoom: 12 });

// ko je lokacija najdena se izvrsi funkcija:
map.on('locationfound', function (e) {
    var radius = e.accuracy / 2; // tocnost v metrima se izpise

    // dodajanje markera na lokaciju uporabnika
    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    // dodajanje krogca za tocnost lokacije
    L.circle(e.latlng, radius).addTo(map);
});

map.on('locationerror', function (e) {
    alert("Location access denied or unavailable.");
});