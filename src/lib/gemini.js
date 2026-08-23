import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateTripPlan(destination, duration, budget, travelType) {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
  });

  const prompt = `Act as an expert travel concierge powered by "Planora AI Trip Planner". Generate a structured travel itinerary for a ${duration}-day trip to ${destination} with a "${budget}" budget traveling as "${travelType}".
...
  Respond ONLY with a valid JSON object (no markdown tags, no code blocks):
  {
    "tripTitle": "${duration} Days in ${destination}",
    "overview": "Engaging 2-sentence summary of the vacation",
    "bestTimeToVisit": "Best months",
    "estimatedCost": "₹XX,XXX - ₹XX,XXX approx per person",
    "hotelRecommendations": [
      {
        "name": "Hotel Name",
        "rating": "4.8/5",
        "priceRange": "₹X,XXX/night",
        "description": "Short highlight"
      }
    ],
    "itinerary": [
      {
        "day": 1,
        "theme": "Arrival & City Lights",
        "activities": [
          { "time": "Morning", "plan": "Activity details" },
          { "time": "Afternoon", "plan": "Activity details" },
          { "time": "Evening", "plan": "Activity details" }
        ]
      }
    ]
  }`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();

  return JSON.parse(text);
}