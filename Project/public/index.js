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
    // Google Sign-In initialization
    google.accounts.id.initialize({
        client_id: "936434721234-pvv4ujsq02kfn4lv6qfhl25afaotd029.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { 
            theme: "outline", 
            size: "large", 
            text: "signin_with" // Customize the text of the button if needed
        }
    );

    // Handle Google Sign-In credential response
    function handleCredentialResponse(response) {
        const responsePayload = parseJwt(response.credential);
        console.log("ID Token: ", response.credential);
        console.log("User info: ", responsePayload);
        
        // You can send the ID token to your server for verification here if needed
    }

    // Function to parse JWT (JSON Web Token)
    function parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        return JSON.parse(jsonPayload);
    }


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