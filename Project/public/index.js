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
<<<<<<< Updated upstream
// iCal parser logic
=======

    // Handle file upload and send it to the server
    document.getElementById('uploadForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const files = document.getElementById('upload').files; // Get all selected files
        const userSpecs = document.getElementById('task').value; // NEW: Get user input from the textarea
        const formData = new FormData();

        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.name.endsWith('.ics')) {
                    formData.append('files', file); // Append each file to the formData object
                } else {
                    alert('Please upload a valid .ics file');
                    return;
                }
            }

            // NEW: Append the textarea input to the FormData
            formData.append('specifications', userSpecs);
            alert('Your specifications have been captured: ' + userSpecs);

            // Send the files to the server using fetch
            fetch('/ICSFolder', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Files uploaded successfully');
                    // You can now parse and add events to the calendar if you want
                    data.files.forEach(filePath => {
                        fetch(filePath)
                            .then(response => response.text())
                            .then(icsData => {
                                const events = parseICS(icsData);
                                calendar.addEventSource(events);
                            });
                    });
                } else {
                    alert('File upload failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } else {
            alert('Please upload at least one .ics file');
        }
    });

    // iCal parser logic
>>>>>>> Stashed changes
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
});document.addEventListener('DOMContentLoaded', function () {
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

    // Handle file upload and send it to the server
    document.getElementById('uploadForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const files = document.getElementById('upload').files; // Get all selected files
        const formData = new FormData();

        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.name.endsWith('.ics')) {
                    formData.append('files', file); // Append each file to the formData object
                } else {
                    alert('Please upload a valid .ics file');
                    return;
                }
            }

            // Send the files to the server using fetch
            fetch('/ICSFolder', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Files uploaded successfully');
                    fetch('/response.ics')
                    .then(response => response.text())
                    .then(icsData => {
                        const events = parseICS(icsData);
                        calendar.addEventSource(events); // Add events from response.ics to the calendar
                    })
                    .catch(error => {
                        console.error('Error fetching response.ics:', error);
                    });
                    // You can now parse and add events to the calendar if you want
                    data.files.forEach(filePath => {
                        fetch(filePath)
                            .then(response => response.text())
                            .then(icsData => {
                                const events = parseICS(icsData);
                                calendar.addEventSource(events);
                            });
                    });
                } else {
                    alert('File upload failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
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