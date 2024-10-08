document.addEventListener('DOMContentLoaded', function () {
    let calendarEl = document.getElementById('calendar');
    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        editable: true,
        events: [] // Initialize with an empty events array
    });
    calendar.render();

    // Handle multiple .ics file uploads
    document.getElementById('upload').addEventListener('change', function (event) {
        const files = event.target.files; // Get all selected files
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.name.endsWith('.ics')) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const events = parseICS(e.target.result);
                        calendar.addEventSource(events); // Add events from each file
                    };
                    reader.readAsText(file);
                } else {
                    alert('Please upload a valid .ics file');
                }
            }
        } else {
            alert('Please upload at least one .ics file');
        }
    });

    // iCal parser logic
    function parseICS(icsData) {
        const jcalData = ICAL.parse(icsData);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');
        const events = [];

        vevents.forEach(vevent => {
            const start = vevent.getFirstPropertyValue('dtstart');
            const end = vevent.getFirstPropertyValue('dtend');
            const summary = vevent.getFirstPropertyValue('summary');
            const location = vevent.getFirstPropertyValue('location');

            // Ensure events are placed at the correct time in the day/week views
            events.push({
                title: summary || 'No Title',
                start: start.toJSDate(),
                end: end ? end.toJSDate() : start.toJSDate(),
                allDay: false, // Set allDay to false to display events in their correct timeslot
                location: location || ''
            });
        });

        return events;
    }
});