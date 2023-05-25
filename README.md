# GPT Overlord

Transform OpenAI ChatGPT into a Versatile API Server

_Disclaimer: No offense intended. We come in peace, dear AI._

## Getting Started

```typescript
async function main() {
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
  const response = await overlord.prompt(
    `Filter the list of cities by those located in Africa:${cities.toString()}`
  );

  console.log(response); // { status: 'success', data: ['Cape Town, Lagos', 'Casablanca'] }
}
```
