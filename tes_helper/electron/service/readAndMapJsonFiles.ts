import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

export const readAndMapJsonFiles = async (filePath1: string, filePath2: string) => {
  try {
    const jsonData1 = JSON.parse(fs.readFileSync(filePath1, "utf8"));
    const jsonData2 = JSON.parse(fs.readFileSync(filePath2, "utf8"));

    const prompt = `
    You are a helpful assistant that maps data from two JSON files.
    The first JSON file contains data about rooms, and the second JSON file contains data about room types.
    Your task is to map the data from the first JSON file to the data in the second JSON file based on the room type.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that maps data from two JSON files. The first JSON file contains data about rooms, and the second JSON file contains data about room types. Your task is to map the data from the first JSON file to the data in the second JSON file based on the room type.",
        },
        {
          role: "user",
          content: prompt,
        },
        {
          role: "user",
          content:
            prompt +
            "\n\n" +
            "The first JSON file is: " +
            JSON.stringify(jsonData1) +
            "\n\n" +
            "The second JSON file is: " +
            JSON.stringify(jsonData2),
        },
      ],
      response_format: {
        type: "json_object",
      },
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.log(error);
  }
};
