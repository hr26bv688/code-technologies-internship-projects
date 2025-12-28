const map = L.map('map').setView([20.5937, 78.9629], 5); // Focused on India
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let itineraryData = [];
const stopList = document.getElementById('stops');

document.getElementById('add-stop').addEventListener('click', async () => {
    const dest = document.getElementById('destination').value;
    const date = document.getElementById('travel-date').value;
    const cost = document.getElementById('travel-cost').value || 0;

    if (!dest) return alert("Please enter a destination");

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${dest}`);
        const data = await response.json();

        if (data.length > 0) {
            const { lat, lon } = data[0];
            itineraryData.push({
                id: Date.now(),
                dest,
                date: date || "9999-12-31",
                cost: parseFloat(cost),
                lat: parseFloat(lat),
                lon: parseFloat(lon)
            });
            updateAndRefresh();
            document.getElementById('destination').value = "";
            document.getElementById('travel-cost').value = "";
            map.flyTo([lat, lon], 6);
        } else {
            alert("Location not found!");
        }
    } catch (e) { console.error(e); }
});

function updateAndRefresh() {
    itineraryData.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Budget Update (Indian Format)
    const total = itineraryData.reduce((sum, item) => sum + item.cost, 0);
    document.getElementById('total-budget').innerText = `₹${total.toLocaleString('en-IN')}`;

    // Map Cleanup
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Tooltip) {
            map.removeLayer(layer);
        }
    });

    const pointList = [];
    itineraryData.forEach((stop, index) => {
        L.marker([stop.lat, stop.lon]).addTo(map)
            .bindPopup(`<b>${index + 1}. ${stop.dest}</b><br>Cost: ₹${stop.cost.toLocaleString('en-IN')}`);
        
        pointList.push([stop.lat, stop.lon]);

        if (index > 0) {
            const days = calculateDays(itineraryData[index-1].date, stop.date);
            if (days !== null) {
                const midpoint = [(stop.lat + itineraryData[index-1].lat) / 2, (stop.lon + itineraryData[index-1].lon) / 2];
                L.tooltip({ permanent: true, direction: 'center', className: 'line-label' })
                    .setContent(`✈️ ${days} days`)
                    .setLatLng(midpoint).addTo(map);
            }
        }
    });

    if (pointList.length > 1) {
        L.polyline(pointList, { color: '#3498db', weight: 4, opacity: 0.6, dashArray: '10, 10' }).addTo(map);
    }
    renderUI();
}

function renderUI() {
    stopList.innerHTML = "";
    itineraryData.forEach((stop, index) => {
        let durationHTML = "";
        if (index > 0) {
            const days = calculateDays(itineraryData[index-1].date, stop.date);
            if (days !== null) durationHTML = `<div class="duration-tag">↓ ${days} days gap</div>`;
        }

        const li = document.createElement('li');
        li.innerHTML = `
            ${durationHTML}
            <div class="stop-item">
                <div>
                    <span class="badge">${index + 1}</span>
                    <strong>${stop.dest}</strong>
                    <span class="cost-tag">₹${stop.cost.toLocaleString('en-IN')}</span><br>
                    <small>📅 ${stop.date === "9999-12-31" ? "Not set" : stop.date}</small>
                </div>
                <button class="delete-btn" onclick="deleteStop(${stop.id})">&times;</button>
            </div>
        `;
        stopList.appendChild(li);
    });
}

function calculateDays(d1, d2) {
    if (d1 === "9999-12-31" || d2 === "9999-12-31") return null;
    return Math.ceil(Math.abs(new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24));
}

function deleteStop(id) {
    itineraryData = itineraryData.filter(i => i.id !== id);
    updateAndRefresh();
}

document.getElementById('clear-all').addEventListener('click', () => {
    if(confirm("Delete all?")) { itineraryData = []; updateAndRefresh(); }
});

document.getElementById('export-pdf').addEventListener('click', () => {
    const element = document.getElementById('pdf-content');
    html2pdf().set({ margin: 10, filename: 'My_Trip.pdf', jsPDF: { format: 'a4' } }).from(element).save();
});