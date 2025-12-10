async function fetchVisibility() {
    const location = document.getElementById('location').value;
    const response = await fetch(`/get-visibility?location=${location}`); //poslje zahtevo s to lokacijo na app.py
    const data = await response.json(); // Dobija JSON odgovor od servera
    document.getElementById('visibilityResult').innerText = "Visibility: " + data.visibility; //prilaze na strani
} 

async function fetchNightEvent() {
    const response = await fetch('/get-night-event');
    const data = await response.json();
    document.getElementById('nightEventResult').innerHTML = `<strong> ${data.title} </strong></br></br> ${data.details}`;
}

async function saveCamera() {
    const model = document.getElementById('cameraModel').value;
    const details = document.getElementById('cameraDetails').value;

    const response = await fetch('/save-camera', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model, details })
    });

    const data = await response.json();

    if (data.model && data.details) {
        document.getElementById('savedCameraResult').innerHTML = `
            <strong>Camera model:</strong> ${data.model} </br>
            <strong>Details:</strong> ${data.details}
        `;
    } else {
        document.getElementById('savedCameraResult').innerText = data.error;
    }
}

async function fetchUpcomingNightSkyEvents() {
    const response = await fetch('/get-upcoming-night-sky-events');
    const data = await response.json();

    const eventsList = document.getElementById('upcomingNightSkyEvents');
    eventsList.innerHTML = '';

    data.upcoming_night_sky_events.forEach(event => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${event.date}</strong>: ${event.event}`;
        eventsList.appendChild(li);
    });    
}
