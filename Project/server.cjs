const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Configure Multer to save uploaded files in the 'ICSFolder'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "ICSFolder");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir); // Save files in 'ICSFolder'
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Save files with their original name
  },
});

const upload = multer({ storage: storage });

// Serve static files (frontend)
app.use(express.static("public"));

// Endpoint to handle file uploads
app.post("/ICSFolder", upload.array("files", 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No files uploaded" });
  }

  const filePaths = req.files.map((file) => `/ICSFolder/${file.filename}`);
  res.json({
    success: true,
    files: filePaths,
  });
});

// Endpoint to handle submission of specifications
app.post("/specifications", (req, res) => {
  const { userSpecs } = req.body;

  if (!userSpecs) {
    return res
      .status(400)
      .json({ success: false, message: "No specifications provided" });
  }

  const icsFilePath = path.join(__dirname, "ICSFolder", "custom.ics");

  // Append the specifications to 'custom.ics', or create the file if it doesn't exist
  fs.appendFile(icsFilePath, `\n${userSpecs}`, (err) => {
    if (err) {
      console.error("Error writing to ICS file:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to update ICS file" });
    }
    res.json({ success: true, message: "ICS file updated successfully" });
  });
});

// Serve static files from the ICSFolder
app.use("/ICSFolder", express.static(path.join(__dirname, "ICSFolder")));

app.post("/specifications", (req, res) => {
  // Extract the text input from the request
  const text = req.body.text;

  // Check if the text is provided
  if (!text) {
    return res
      .status(400)
      .json({ success: false, message: "No text provided" });
  }

  run(text); // Calling gemini integration, should create files for use in calendar

  // Response
  res.json({
    success: true,
    message: `Received text input: ${text}`,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
