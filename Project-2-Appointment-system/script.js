let state = { doc: "", name: "", phone: "", date: null, time: "" };
let viewDate = new Date();
const confirmBtn = document.getElementById('confirmBtn');

function renderCalendar() {
    const cal = document.getElementById('calendar');
    const display = document.getElementById('monthDisplay');
    const headers = cal.querySelectorAll('.header');
    cal.innerHTML = '';
    headers.forEach(h => cal.appendChild(h));

    const y = viewDate.getFullYear(), m = viewDate.getMonth();
    display.innerText = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(viewDate);
    const startDay = new Date(y, m, 1).getDay(), daysInMonth = new Date(y, m + 1, 0).getDate();

    for(let i=0; i<startDay; i++) {
        const e = document.createElement('div'); e.className = 'day empty'; cal.appendChild(e);
    }

    for(let d=1; d<=daysInMonth; d++) {
        const day = document.createElement('div');
        day.className = 'day'; day.innerText = d;
        if(state.date && state.date.d === d && state.date.m === m && state.date.y === y) day.classList.add('active');
        day.onclick = () => {
            document.querySelectorAll('.day').forEach(el => el.classList.remove('active'));
            day.classList.add('active');
            state.date = { d, m, y }; validate();
        };
        cal.appendChild(day);
    }
}

function changeMonth(dir) { 
    viewDate.setMonth(viewDate.getMonth() + dir); 
    renderCalendar(); 
}

document.getElementById('docSelect').onchange = (e) => { state.doc = e.target.value; validate(); };
document.getElementById('userName').oninput = (e) => { state.name = e.target.value; validate(); };
document.getElementById('userPhone').oninput = (e) => { state.phone = e.target.value; validate(); };

document.querySelectorAll('.time-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.time = btn.innerText; validate();
    };
});

function validate() {
    const ok = state.doc && state.name.trim().length > 2 && state.phone.trim().length >= 10 && state.date && state.time;
    confirmBtn.disabled = !ok;
}

confirmBtn.onclick = () => {
    alert(`Token Generated for SMS Hospital!\n\nPatient: ${state.name}\nDepartment: ${state.doc}\nDate: ${state.date.d}/${state.date.m+1}/${state.date.y}\nTime: ${state.time}`);
};

// Initial Render
renderCalendar();