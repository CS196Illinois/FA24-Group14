import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";

dotenv.config();

async function run() {
  //async function run(userSpecs) {
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const folderPath = "ICSFolder"; // required folder in project directory

  try {
    // const files = await fs.readdir(folderPath);

    // const icsContents = await Promise.all(
    //   files
    //     .filter((file) => file.endsWith(".ics")) // excluding non ics files
    //     .map((file) => fs.readFile(`${folderPath}/${file}`, "utf-8")) // reading every file
    // );

    // const combinedIcsContent = icsContents.join("\n");

    /*
    const userSpecs =
      "Study, 2 hours, sometime between 8 AM and 8 PM, local time on October 14, 2024";
    */

    const prompt = "Please say hello to the world!";

    // const prompt = `Here is my schedule for the next week in the form of .ics files:\n\n${combinedIcsContent}\n\n.
    //                 Please create an ics file with the following specifications:\n\n${userSpecs}\n\n.
    //                 1. Do not schedule  events during any existing events. Events should be placed **only in available time slots**, avoiding any overlaps. Explicitly check for free periods between the specified times, before scheduling events.
    //                 4. Ensure all times follow the correct .ics format, including using UTC time (e.g., YYYYMMDDTHHMMSSZ), and avoid invalid times like T240000Z (use T000000Z for midnight).
    //                 5. Include all required fields for each study event (UID, DTSTART, DTEND, SUMMARY, etc.) to ensure compatibility with Google Calendar.
    //                 6. Only output the newly created study events in the .ics format, without duplicating any existing events from my schedule.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    //console.log("run completed");
    await fs.writeFile("response.ics", text);
    console.log(text);
  } catch (error) {
    console.error("Error reading the .ics files:", error);
  }
}

//export default function run(userSpecs) {}

run();
