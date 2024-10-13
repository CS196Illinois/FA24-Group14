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

    const prompt = `Here is my schedule for the next week provided by the .ics files:\n\n${combinedIcsContent}\n\nBased on this schedule, please add a 1 hour event anyehwere in the week and return another .ics file containing the new event.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
  } catch (error) {
    console.error("Error reading the .ics files:", error);
  }
}

run();
