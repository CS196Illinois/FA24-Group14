const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Create a storage engine to save the files in the 'ICSFolder'
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = './ICSFolder';
        // Ensure the directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir); // Save files in 'ICSFolder'
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Save files with their original name
    }
});

const upload = multer({ storage: storage });

// Serve static files (frontend)
app.use(express.static('public'));

// Endpoint to handle file upload
app.post('/ICSFolder', upload.array('files', 10), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const filePaths = req.files.map(file => path.join('/ICSFolder', file.filename));
    
    res.json({
        success: true,
        files: filePaths // Send back the file paths to the client
    });
});

// Serve static files from the ICSFolder
app.use('/ICSFolder', express.static(path.join(__dirname, 'ICSFolder')));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});