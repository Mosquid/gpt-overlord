require("dotenv").config();
import GPTOverlord from "../src";

//todo: remove dotenv before publishing

const overlord = new GPTOverlord({
  apiKey: process.env.OPENAI_API_KEY || "",
  model: "gpt-3.5-turbo",
  temperature: 0,
  schema: {
    status: "success | error",
    data: "..",
  },
});

const cities = ["London", "Casablanca", "Cape Town", "Lagos", "Istanbul"];

overlord
  .prompt(
    `Filter the list of cities by those located in Africa:${cities.toString()}`
  )
  .then((response) => {
    console.log(response);
  });
