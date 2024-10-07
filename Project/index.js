document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    
    // Initialize FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: [FullCalendar.dayGridPlugin],
        initialView: 'dayGridMonth',
        events: [],
    });
    
    calendar.render();

    // Handle file upload and parse ICS file
    document.getElementById('upload').addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file && file.name.endsWith('.ics')) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const events = parseICS(e.target.result);
                calendar.addEventSource(events);
            };
            reader.readAsText(file);
        } else {
            alert('Please upload a valid .ics file');
        }
    });

    // Parse the uploaded ICS file using ical.js
    function parseICS(icsData) {
        const jcalData = ICAL.parse(icsData);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');
        const events = [];

        vevents.forEach(vevent => {
            const start = vevent.getFirstPropertyValue('dtstart');
            const end = vevent.getFirstPropertyValue('dtend');
            const summary = vevent.getFirstPropertyValue('summary');

            events.push({
                title: summary || 'No Title',
                start: start.toJSDate(),
                end: end ? end.toJSDate() : start.toJSDate(),
            });
        });

        return events;
    }
});