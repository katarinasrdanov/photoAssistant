const ctx = document.getElementById('cloudyChart').getContext('2d');
const cloudyChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Cloudy Days per Station',
            data: [],
            backgroundColor: 'rgba(33, 84, 212, 0.6)',
            borderColor: 'rgb(44, 103, 143)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

function updateChart(year) {
    fetch(`/get_data/${year}`) //poslje zahtev na app.py s year param
        .then(response => response.json()) //parsanje jsona
        .then(data => {
            const labels = data.map(item => item['STATION']); // izdvoji imena meteoroloških stanica i broj oblačnih dana za svaku stanicu
            const values = data.map(item => item['CLOUDY_DAYS']);

            cloudyChart.data.labels = labels;
            cloudyChart.data.datasets[0].data = values;
            cloudyChart.update();
        })
        .catch(error => console.error('Error fetching data:', error));
}
