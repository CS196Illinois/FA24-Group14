let calendar;
        let events = [];

        document.addEventListener('DOMContentLoaded', function () {
            var calendarEl = document.getElementById('calendar');

            // Initialize FullCalendar with editable events
            calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                editable: true, // Allow events to be edited
                events: [],

                // Event change detection (fires when events are modified)
                eventChange: function (info) {
                    updateICS();
                }
            });

            calendar.render();

            // Handle file upload and parse ICS file
            document.getElementById('upload').addEventListener('change', function (event) {
                const file = event.target.files[0];
                if (file && file.name.endsWith('.ics')) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        events = parseICS(e.target.result);
                        calendar.removeAllEvents();  // Clear previous events
                        calendar.addEventSource(events);  // Add parsed events to the calendar
                    };
                    reader.readAsText(file);
                } else {
                    alert('Please upload a valid .ics file');
                }
            });

            // Handle ICS file download
            document.getElementById('download-btn').addEventListener('click', function () {
                const icsData = generateICS(events);
                downloadICSFile(icsData, 'updated_calendar.ics');
            });

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
                    id: vevent.getFirstPropertyValue('uid'), // Unique event ID for tracking
                    title: summary || 'No Title',
                    start: start.toJSDate(),
                    end: end ? end.toJSDate() : start.toJSDate(),
                    allDay: !start.isDate && !end.isDate
                });
            });

            return events;
        }

        // Update the ICS data when events are changed
        function updateICS() {
            events = calendar.getEvents().map(event => ({
                id: event.id,
                title: event.title,
                start: event.start,
                end: event.end,
                allDay: event.allDay
            }));
        }

        // Generate an ICS file from the event data
        function generateICS(events) {
            const comp = new ICAL.Component(['vcalendar', [], []]);

            // Add calendar properties
            comp.addPropertyWithValue('version', '2.0');
            comp.addPropertyWithValue('prodid', '-//FullCalendar ICS Export//EN');

            // Add events to the calendar
            events.forEach(event => {
                const vevent = new ICAL.Component('vevent');
                vevent.addPropertyWithValue('uid', event.id);
                vevent.addPropertyWithValue('summary', event.title);
                vevent.addPropertyWithValue('dtstart', ICAL.Time.fromJSDate(event.start));
                vevent.addPropertyWithValue('dtend', ICAL.Time.fromJSDate(event.end || event.start));

                comp.addSubcomponent(vevent);
            });

            return comp.toString();
        }

        // Download the ICS file
        function downloadICSFile(icsData, fileName) {
            const blob = new Blob([icsData], { type: 'text/calendar' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }