async function loadTips(category) {
    const response = await fetch('../static/tips_for_conditions.json');
    const data = await response.json(); //pretvarja v json objekt iz json formata

    // filtriranje po kategoriji
    const filteredConditions = data.conditions.filter(condition => condition.category === category);

    // tukaj bom prikazala conditione
    const conditionsList = document.getElementById('conditionsList');
    conditionsList.innerHTML = '';  //izbrisem prejsnjo listo

    // in prikazem listu s conditionima
    filteredConditions.forEach(condition => {
        const conditionDiv = document.createElement('div');
        conditionDiv.classList.add('condition');

        conditionDiv.innerHTML = `
            <h3>${condition.name}</h3>
            <p><strong>Suggestion:</strong> ${condition.suggestion}</p>
            <p><strong>Ideal Camera Settings:</strong></p>
            <ul>
                <li><strong>Shutter Speed:</strong> ${condition.idealCameraSettings.shutterSpeed}</li>
                <li><strong>Aperture:</strong> ${condition.idealCameraSettings.aperture}</li>
                <li><strong>ISO:</strong> ${condition.idealCameraSettings.iso}</li>
            </ul>
            <p><strong>Best Time:</strong> ${condition.bestTime}</p>
            <p><strong>Precautions:</strong> ${condition.precautions}</p>
        `;

        // Append the condition information to the conditions list
        conditionsList.appendChild(conditionDiv);
    });
}

// preverja selected button in prikaze tipse za tistu kategoriju koja je kliknuta
function filterTips(category, button) {
    // izbirse da je neki button selektovan
    const buttons = document.querySelectorAll('.condition-button');
    buttons.forEach(btn => btn.classList.remove('selected'));

    // doda selected na kliknut button
    button.classList.add('selected');

    // prikaz tips za selected kategoriju
    loadTips(category);
}

// ko se klikne button se prosledi v filter tips na dodelitev selected kategorije
document.querySelectorAll('.condition-button').forEach(button => {
    button.addEventListener('click', () => filterTips(button.textContent, button));
});
