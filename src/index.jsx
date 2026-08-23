const generateItinerary = (destination, totalDays, budget, traveler) => {
  try {
    // Validation
    if (!destination || typeof destination !== "string") {
      throw new Error("Destination is required and must be a string");
    }

    if (!totalDays || isNaN(totalDays) || totalDays < 1) {
      throw new Error("Total days must be a number greater than 0");
    }

    if (!budget || typeof budget !== "string") {
      throw new Error("Budget is required");
    }

    const days = [];

    const activities = {
      1: {
        title: "Arrival & City Exploration",
        morning: `Arrive in ${destination} and check into your hotel. Visit the main city center and famous landmarks.`,
        afternoon: `Enjoy a nice ${budget.toLowerCase()} lunch at a popular local restaurant and explore nearby markets.`,
        evening: `Take an evening walk, enjoy the city lights, and try local street food or a rooftop cafe.`
      },
      2: {
        title: "Culture & History",
        morning: `Visit the most famous historical sites and museums in ${destination}.`,
        afternoon: `Have lunch at a traditional restaurant and explore cultural neighborhoods.`,
        evening: `Attend a cultural show or enjoy a relaxed dinner with local cuisine.`
      },
      3: {
        title: "Nature & Scenic Views",
        morning: `Go for a nature activity (park, beach, mountain, or viewpoint depending on ${destination}).`,
        afternoon: `Enjoy outdoor lunch and continue exploring scenic spots.`,
        evening: `Watch the sunset from a beautiful viewpoint and have a peaceful dinner.`
      },
      4: {
        title: "Local Life & Food Experience",
        morning: `Explore local markets and try authentic breakfast spots.`,
        afternoon: `Food tour or visit unique cafes and hidden gems of ${destination}.`,
        evening: `Dinner at a highly rated restaurant and experience local nightlife.`
      },
      5: {
        title: "Adventure & Shopping",
        morning: `Do an adventure activity or visit a popular attraction you missed earlier.`,
        afternoon: `Shopping for souvenirs and exploring modern areas of the city.`,
        evening: `Farewell dinner at a special restaurant and enjoy the night view.`
      },
      6: {
        title: "Relax & Departure",
        morning: `Have a relaxed morning, visit a cafe or spa if time permits.`,
        afternoon: `Last-minute shopping or revisit your favorite place.`,
        evening: `Head to the airport / station for departure.`
      }
    };

    for (let i = 1; i <= totalDays; i++) {
      const dayData = activities[i] || {
        title: `Explore ${destination}`,
        morning: `Visit popular attractions in ${destination}`,
        afternoon: `Enjoy local food suitable for ${budget} budget`,
        evening: `Relax and experience ${destination} nightlife / culture`
      };

      days.push({
        day: i,
        title: `Day ${i} - ${dayData.title}`,
        activities: [
          `Morning: ${dayData.morning}`,
          `Afternoon: ${dayData.afternoon}`,
          `Evening: ${dayData.evening}`
        ]
      });
    }

    return days;

  } catch (error) {
    console.error("Error generating itinerary:", error.message);
    return []; // return empty array so the app doesn't crash
  }
};