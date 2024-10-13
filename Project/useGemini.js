import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";

dotenv.config();

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const folderPath = "ICSFolderSample";

  try {
    const files = await fs.readdir(folderPath);

    const icsContents = await Promise.all(
      files
        .filter((file) => file.endsWith(".ics")) // excluding non ics files
        .map((file) => fs.readFile(`${folderPath}/${file}`, "utf-8")) // reading every file
    );

    const combinedIcsContent = icsContents.join("\n");

    const prompt = `Here is my schedule for the next week in the form of .ics files:\n\n${combinedIcsContent}\n\n.
Please create study events titled "Study" to meet a 4-hour daily study goal for each day of the week starting on October 13. 
Ensure the following:
1. Do not schedule study events during any existing events. Study sessions should be placed **only in available time slots**, avoiding any overlaps. Explicitly check for free periods between 8 AM and 8 PM, local time, before scheduling study events.
2. Spread the study time into multiple events across each day, ensuring the total study time adds up to 4 hours daily.
3. Study sessions can be broken into smaller blocks throughout the day and should be placed in open time slots **between existing events**.
4. Ensure all times follow the correct .ics format, including using UTC time (e.g., YYYYMMDDTHHMMSSZ), and avoid invalid times like T240000Z (use T000000Z for midnight).
5. Include all required fields for each study event (UID, DTSTART, DTEND, SUMMARY, etc.) to ensure compatibility with Google Calendar.
6. Only output the newly created study events in the .ics format, without duplicating any existing events from my schedule.
7. The study events should be scheduled between 8 AM and 8 PM, local time, and must not overlap with any existing events in that time frame. **Prioritize shorter blocks if necessary to fit within free time slots.**`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("run completed");
    await fs.writeFile("response.ics", text);
  } catch (error) {
    console.error("Error reading the .ics files:", error);
  }
}

run();
