require("dotenv").config();
import GPTOverlord from "../src";

//todo: remove dotenv before publishing

const overlord = new GPTOverlord({
  apiKey: process.env.OPENAI_API_KEY || "",
  model: "gpt-3.5-turbo",
  schema: {
    status: "success | error",
    data: "..",
  },
});

overlord.prompt("Who are you?").then((response) => {
  console.log(response);
});
