import type { AnalyzeResponse } from "../../src/lib/types";

// Simulates a Wino menu response: 5 main dishes + 2 shelf dishes (desserts excluded)
// 3 wines pair with Arancini, 5 total for all dishes
export const WINO_MENU_RESPONSE: AnalyzeResponse = {
  dishes: [
    { id: "d1", name: "Arancini", description: "Saffron risotto balls, tomato sugo", category: "appetizer" },
    { id: "d2", name: "Grilled Branzino", description: "Lemon, capers, herbs", category: "fish" },
    { id: "d3", name: "Osso Buco", description: "Braised veal shank, gremolata", category: "meat" },
    { id: "d4", name: "Truffle Pasta", description: "Fresh tagliatelle, black truffle", category: "pasta" },
    { id: "d5", name: "Caprese Salad", description: "Burrata, heirloom tomato, basil", category: "salad" },
  ],
  otherDishes: [
    { id: "d6", name: "Tiramisu", description: "Espresso, mascarpone, cocoa", category: "dessert" },
    { id: "d7", name: "Panna Cotta", description: "Vanilla, berry compote", category: "dessert" },
  ],
  wines: [
    { id: "w1", name: "Vermentino di Sardegna", type: "white", grape: "Vermentino", region: "Sardinia", vintage: "2022" },
    { id: "w2", name: "Barolo Riserva", type: "red", grape: "Nebbiolo", region: "Piedmont", vintage: "2017" },
    { id: "w3", name: "Etna Rosato", type: "rosé", grape: "Nerello Mascalese", region: "Sicily", vintage: "2023" },
    { id: "w4", name: "Brunello di Montalcino", type: "red", grape: "Sangiovese", region: "Tuscany", vintage: "2018" },
    { id: "w5", name: "Soave Classico", type: "white", grape: "Garganega", region: "Veneto", vintage: "2022" },
  ],
  pairings: [
    // Arancini (d1) → w1, w3, w5 (3 wines)
    { dish_id: "d1", wine_id: "w1", score: 0.94, reason: "Vermentino's citrus freshness cuts through fried risotto.", detailed_reason: "Detailed pairing text for d1-w1." },
    { dish_id: "d1", wine_id: "w3", score: 0.89, reason: "Etna Rosato bridges the tomato sugo with delicate fruit.", detailed_reason: "Detailed pairing text for d1-w3." },
    { dish_id: "d1", wine_id: "w5", score: 0.86, reason: "Soave's mineral freshness complements the saffron.", detailed_reason: "Detailed pairing text for d1-w5." },
    // Branzino (d2) → w1, w5
    { dish_id: "d2", wine_id: "w1", score: 0.96, reason: "Classic Mediterranean white with Mediterranean fish.", detailed_reason: "Detailed pairing text for d2-w1." },
    { dish_id: "d2", wine_id: "w5", score: 0.88, reason: "Soave's gentle acidity lets the branzino shine.", detailed_reason: "Detailed pairing text for d2-w5." },
    // Osso Buco (d3) → w2, w4
    { dish_id: "d3", wine_id: "w2", score: 0.97, reason: "Barolo's power matches braised veal perfectly.", detailed_reason: "Detailed pairing text for d3-w2." },
    { dish_id: "d3", wine_id: "w4", score: 0.93, reason: "Brunello's tannins cut through the rich braise.", detailed_reason: "Detailed pairing text for d3-w4." },
    // Truffle Pasta (d4) → w2, w4
    { dish_id: "d4", wine_id: "w2", score: 0.95, reason: "Nebbiolo's earthy character mirrors truffle.", detailed_reason: "Detailed pairing text for d4-w2." },
    { dish_id: "d4", wine_id: "w4", score: 0.91, reason: "Brunello complements the earthy truffle elegantly.", detailed_reason: "Detailed pairing text for d4-w4." },
    // Caprese (d5) → w3, w1
    { dish_id: "d5", wine_id: "w3", score: 0.92, reason: "Rosato's freshness pairs with tomato and burrata.", detailed_reason: "Detailed pairing text for d5-w3." },
    { dish_id: "d5", wine_id: "w1", score: 0.87, reason: "Vermentino's herbs echo the basil.", detailed_reason: "Detailed pairing text for d5-w1." },
  ],
  language: "en",
};

// Response for regeneration — adds pairings for newly added dishes
export const REGEN_RESPONSE: AnalyzeResponse = {
  dishes: [
    { id: "d6", name: "Tiramisu", description: "Espresso, mascarpone, cocoa", category: "dessert" },
  ],
  wines: [
    { id: "w6", name: "Moscato d'Asti", type: "white", grape: "Moscato", region: "Piedmont", vintage: "2023" },
  ],
  pairings: [
    { dish_id: "d6", wine_id: "w6", score: 0.90, reason: "Moscato's sweetness pairs with tiramisu.", detailed_reason: "Detailed pairing text for d6-w6." },
  ],
  language: "en",
};

// Single-dish response for focused tests
export const SINGLE_DISH_RESPONSE: AnalyzeResponse = {
  dishes: [
    { id: "d1", name: "Arancini", description: "Saffron risotto balls, tomato sugo", category: "appetizer" },
  ],
  wines: [
    { id: "w1", name: "Vermentino di Sardegna", type: "white", grape: "Vermentino", region: "Sardinia", vintage: "2022" },
    { id: "w3", name: "Etna Rosato", type: "rosé", grape: "Nerello Mascalese", region: "Sicily", vintage: "2023" },
    { id: "w5", name: "Soave Classico", type: "white", grape: "Garganega", region: "Veneto", vintage: "2022" },
  ],
  pairings: [
    { dish_id: "d1", wine_id: "w1", score: 0.94, reason: "Vermentino's citrus freshness cuts through fried risotto.", detailed_reason: "Detailed." },
    { dish_id: "d1", wine_id: "w3", score: 0.89, reason: "Etna Rosato bridges the tomato sugo.", detailed_reason: "Detailed." },
    { dish_id: "d1", wine_id: "w5", score: 0.86, reason: "Soave's mineral freshness.", detailed_reason: "Detailed." },
  ],
  language: "en",
};
