import { Bottle } from "./types";

const BASE = "/bottles/normalized";

export const BOTTLES: Bottle[] = [
  // ── Existing ──
  { name: "Costières de Nîmes", src: `${BASE}/costieres-red-full.png`, type: "red" },
  { name: "Shiraz Cabernet", src: `${BASE}/shiraz-cabernet-full.png`, type: "red" },
  { name: "Red Label", src: `${BASE}/red-label-full.png`, type: "red" },
  { name: "Chardonnay", src: `${BASE}/chardonnay-full.png`, type: "white" },
  { name: "Gold Label", src: `${BASE}/gold-label-full.png`, type: "white" },
  { name: "Silver Reserve", src: `${BASE}/silver-reserve-full.png`, type: "both" },

  // ── Single-bottle reds ──
  { name: "Colheita", src: `${BASE}/colheita-full.png`, type: "red" },
  { name: "Côtes du Rhône Villages", src: `${BASE}/cotes-du-rhone-villages-full.png`, type: "red" },
  { name: "Dolcetto d'Asti", src: `${BASE}/dolcetto-dasti-full.png`, type: "red" },
  { name: "Minarete", src: `${BASE}/minarete-full.png`, type: "red" },
  { name: "Yarra Valley Pinot Noir", src: `${BASE}/yarra-valley-pinot-noir-full.png`, type: "red" },
  { name: "H.J. Fabre Malbec", src: `${BASE}/hj-fabre-malbec-full.png`, type: "red" },
  { name: "Rodolfo Sadler Malbec", src: `${BASE}/rodolfo-sadler-malbec-full.png`, type: "red" },

  // ── Whites (3-bottle JPG) ──
  { name: "Telegraph Road", src: `${BASE}/telegraph-road-full.png`, type: "white" },
  { name: "Auction House Chardonnay", src: `${BASE}/auction-house-chardonnay-full.png`, type: "white" },
  { name: "Joey Brown", src: `${BASE}/joey-brown-full.png`, type: "white" },

  // ── Whites (6-bottle JPG) ──
  { name: "El Coto Blanco", src: `${BASE}/el-coto-blanco-full.png`, type: "white" },
  // Gavi di Gavi, Kim Crawford, Dandelion Riesling removed — broken source images
  { name: "Famille Perrin CdR Réserve", src: `${BASE}/perrin-cdr-reserve-full.png`, type: "white" },
  { name: "Cannonball Chardonnay", src: `${BASE}/cannonball-chardonnay-full.png`, type: "white" },

  // ── Sparkling (champagne screenshot) ──
  { name: "Blason d'Argent", src: `${BASE}/blason-dargent-full.png`, type: "sparkling" },
  { name: "Delamotte", src: `${BASE}/delamotte-full.png`, type: "sparkling" },
  { name: "Gobillard", src: `${BASE}/gobillard-full.png`, type: "sparkling" },
  // Alfred Gratien, Cazals removed — overlapping 2-bottle source couldn't be cleanly split

  // ── Hattingley ──
  { name: "Hattingley Classic Reserve", src: `${BASE}/hattingley-reserve-full.png`, type: "sparkling" },
  { name: "Hattingley Rosé", src: `${BASE}/hattingley-rose-full.png`, type: "rosé" },
  { name: "Hattingley Blanc de Blancs", src: `${BASE}/hattingley-blanc-de-blancs-full.png`, type: "sparkling" },

  // ── Moët ──
  { name: "Moët Brut Impérial", src: `${BASE}/moet-brut-imperial-full.png`, type: "sparkling" },
  { name: "Moët Rosé Impérial", src: `${BASE}/moet-rose-imperial-full.png`, type: "rosé" },
];

export type BottleInfo = {
  grape: string;
  region: string;
  description: string;
  buyUrl: string;
};

export const BOTTLE_INFO: Record<string, BottleInfo> = {
  "Costières de Nîmes": {
    grape: "Grenache · Syrah",
    region: "Southern Rhône, France",
    description: "Warm, spice-driven red with ripe dark fruit and a hint of garrigue herbs.",
    buyUrl: "https://www.vivino.com/search/wines?q=costieres+de+nimes",
  },
  "Shiraz Cabernet": {
    grape: "Shiraz · Cabernet Sauvignon",
    region: "South Australia",
    description: "Bold and full-bodied with blackberry, eucalyptus and velvety tannins.",
    buyUrl: "https://www.vivino.com/search/wines?q=shiraz+cabernet",
  },
  "Red Label": {
    grape: "Tempranillo",
    region: "Rioja, Spain",
    description: "Classic Rioja with cherry, vanilla oak and a smooth, lingering finish.",
    buyUrl: "https://www.vivino.com/search/wines?q=rioja+red+label",
  },
  "Chardonnay": {
    grape: "Chardonnay",
    region: "Burgundy, France",
    description: "Elegant and mineral-driven with citrus, white peach and a crisp finish.",
    buyUrl: "https://www.vivino.com/search/wines?q=burgundy+chardonnay",
  },
  "Gold Label": {
    grape: "Riesling",
    region: "Mosel, Germany",
    description: "Aromatic and off-dry with honeyed stone fruit, lime zest and racy acidity.",
    buyUrl: "https://www.vivino.com/search/wines?q=mosel+riesling",
  },
  "Silver Reserve": {
    grape: "Cabernet Sauvignon · Chardonnay",
    region: "Napa Valley, USA",
    description: "A refined blend showcasing cassis, toasty oak and bright citrus notes.",
    buyUrl: "https://www.vivino.com/search/wines?q=napa+valley+reserve",
  },
  "Colheita": {
    grape: "Touriga Nacional · Tinta Roriz",
    region: "Dão, Portugal",
    description: "Structured and elegant with dark cherry, cedar and a mineral-laced finish.",
    buyUrl: "https://www.vivino.com/search/wines?q=quinta+carvalhais+colheita",
  },
  "Côtes du Rhône Villages": {
    grape: "Grenache · Syrah · Mourvèdre",
    region: "Rhône, France",
    description: "Fragrant and generous with blackberry, thyme and spicy warmth.",
    buyUrl: "https://www.vivino.com/search/wines?q=chapoutier+cotes+du+rhone+villages",
  },
  "Dolcetto d'Asti": {
    grape: "Dolcetto",
    region: "Piedmont, Italy",
    description: "Soft and approachable with juicy plum, almond and gentle tannins.",
    buyUrl: "https://www.vivino.com/search/wines?q=dolcetto+asti",
  },
  "Minarete": {
    grape: "Tempranillo",
    region: "Ribera del Duero, Spain",
    description: "Deep and concentrated with blackcurrant, tobacco and toasty oak complexity.",
    buyUrl: "https://www.vivino.com/search/wines?q=minarete+ribera+del+duero",
  },
  "Yarra Valley Pinot Noir": {
    grape: "Pinot Noir",
    region: "Victoria, Australia",
    description: "Silky and expressive with red cherry, forest floor and gentle spice.",
    buyUrl: "https://www.vivino.com/search/wines?q=yarra+valley+pinot+noir",
  },
  "H.J. Fabre Malbec": {
    grape: "Malbec",
    region: "Patagonia, Argentina",
    description: "Cool-climate Malbec with violet, dark plum and crisp acidity.",
    buyUrl: "https://www.vivino.com/search/wines?q=hj+fabre+malbec+patagonia",
  },
  "Rodolfo Sadler Malbec": {
    grape: "Malbec",
    region: "Mendoza, Argentina",
    description: "Rich and velvety with ripe blackberry, chocolate and smoky oak.",
    buyUrl: "https://www.vivino.com/search/wines?q=rodolfo+sadler+malbec+reserve",
  },
  "Telegraph Road": {
    grape: "Sémillon · Sauvignon Blanc",
    region: "South East Australia",
    description: "Crisp and aromatic with citrus, tropical fruit and a clean finish.",
    buyUrl: "https://www.vivino.com/search/wines?q=telegraph+road+semillon+sauvignon+blanc",
  },
  "Auction House Chardonnay": {
    grape: "Chardonnay",
    region: "South East Australia",
    description: "Ripe and generous with peach, melon and a touch of creamy oak.",
    buyUrl: "https://www.vivino.com/search/wines?q=auction+house+chardonnay",
  },
  "Joey Brown": {
    grape: "White Blend",
    region: "South East Australia",
    description: "Light and refreshing fruity white with apple and citrus notes.",
    buyUrl: "https://www.vivino.com/search/wines?q=joey+brown+fruity+white",
  },
  "El Coto Blanco": {
    grape: "Viura",
    region: "Rioja, Spain",
    description: "Fresh and floral with green apple, citrus zest and a crisp mineral backbone.",
    buyUrl: "https://www.vivino.com/search/wines?q=el+coto+rioja+blanco",
  },
  "Famille Perrin CdR Réserve": {
    grape: "Grenache Blanc · Viognier",
    region: "Rhône, France",
    description: "Round and textured with stone fruit, honeysuckle and subtle spice.",
    buyUrl: "https://www.vivino.com/search/wines?q=famille+perrin+cotes+du+rhone+reserve+blanc",
  },
  "Cannonball Chardonnay": {
    grape: "Chardonnay",
    region: "Sonoma County, USA",
    description: "Lush and balanced with ripe pear, vanilla and a buttery finish.",
    buyUrl: "https://www.vivino.com/search/wines?q=cannonball+chardonnay",
  },
  "Blason d'Argent": {
    grape: "Chardonnay · Pinot Noir",
    region: "Champagne, France",
    description: "Elegant Champagne with fine bubbles, brioche and crisp citrus.",
    buyUrl: "https://www.vivino.com/search/wines?q=blason+argent+champagne",
  },
  "Delamotte": {
    grape: "Chardonnay · Pinot Noir · Pinot Meunier",
    region: "Champagne, France",
    description: "Refined and mineral with white flowers, toast and a long, silky mousse.",
    buyUrl: "https://www.vivino.com/search/wines?q=delamotte+champagne",
  },
  "Gobillard": {
    grape: "Pinot Meunier · Chardonnay · Pinot Noir",
    region: "Champagne, France",
    description: "Fruity and approachable with apple, pear and a lively, persistent fizz.",
    buyUrl: "https://www.vivino.com/search/wines?q=gobillard+champagne",
  },
  "Hattingley Classic Reserve": {
    grape: "Chardonnay · Pinot Noir · Pinot Meunier",
    region: "Hampshire, England",
    description: "Crisp English sparkling with green apple, toast and fine persistent bubbles.",
    buyUrl: "https://www.vivino.com/search/wines?q=hattingley+classic+reserve",
  },
  "Hattingley Rosé": {
    grape: "Pinot Noir · Pinot Meunier",
    region: "Hampshire, England",
    description: "Delicate rosé sparkling with red berries, rose petal and a dry finish.",
    buyUrl: "https://www.vivino.com/search/wines?q=hattingley+rose+sparkling",
  },
  "Hattingley Blanc de Blancs": {
    grape: "Chardonnay",
    region: "Hampshire, England",
    description: "Elegant and precise with citrus, almond and a creamy, lingering mousse.",
    buyUrl: "https://www.vivino.com/search/wines?q=hattingley+blanc+de+blancs",
  },
  "Moët Brut Impérial": {
    grape: "Chardonnay · Pinot Noir · Pinot Meunier",
    region: "Champagne, France",
    description: "The iconic Champagne with bright fruit, brioche and a generous, lively mousse.",
    buyUrl: "https://www.vivino.com/search/wines?q=moet+brut+imperial",
  },
  "Moët Rosé Impérial": {
    grape: "Pinot Noir · Chardonnay · Pinot Meunier",
    region: "Champagne, France",
    description: "Vibrant rosé Champagne with wild strawberry, rose and an intense, romantic finish.",
    buyUrl: "https://www.vivino.com/search/wines?q=moet+rose+imperial",
  },
};

// Sparkling bottle names for bubble particle effects
const SPARKLING_NAMES = [
  "gold", "chardonnay",
  "blason", "delamotte", "gobillard",
  "hattingley", "moët", "moet",
];

// Whether a bottle triggers bubble particles (champagne/sparkling style)
export function isSparklingBottle(name: string): boolean {
  const lower = name.toLowerCase();
  return SPARKLING_NAMES.some((s) => lower.includes(s));
}
