// Mock data following the PRD data model

export type TipModel = "individual" | "pool" | "hybrid";
export type ServiceStyle =
  | "casual"
  | "upscale"
  | "fine_dining"
  | "nightclub"
  | "hotel";
export type PriceRange = "$" | "$$" | "$$$" | "$$$$";
export type Role =
  | "server"
  | "bartender"
  | "barback"
  | "host"
  | "server_assistant"
  | "manager"
  | "bottle_service"
  | "cook"
  | "chef"
  | "dishwasher";
export type ShiftTimeOfDay =
  | "am"
  | "lunch"
  | "brunch"
  | "dinner"
  | "late_night"
  | "overnight";
export type ShiftType =
  | "standard"
  | "private_party"
  | "club_bar"
  | "bottle_service"
  | "event"
  | "holiday";

export interface Restaurant {
  id: string;
  name: string;
  city: string;
  state: string;
  cuisine: string;
  priceRange: PriceRange;
  serviceStyle: ServiceStyle;
  tipModel: TipModel;
  poolDistribution?: "equal" | "point_based" | "sales_weighted";
  creditCardFeeDeduction: boolean;
}

export interface ShiftSubmission {
  id: string;
  restaurantId: string;
  role: Role;
  shiftTimeOfDay: ShiftTimeOfDay;
  shiftType: ShiftType;
  date: string;
  dayOfWeek: string;
  baseWage: number;
  totalSales: number;
  grossTips: number;
  tipOutAmount: number;
  netTips: number;
  hoursWorked: number;
  effectiveHourly: number;
  partyCount?: number;
  sectionSize?: number;
  staffingLevel: "short" | "normal" | "over";
}

export interface EarningsStats {
  restaurantId: string;
  role: Role;
  shiftTimeOfDay: ShiftTimeOfDay;
  submissionCount: number;
  medianNetTips: number;
  percentile25: number;
  percentile75: number;
  medianHourly: number;
  medianSales: number;
  avgTipOutPercent: number;
  avgHoursPerShift: number;
  confidenceScore: number; // 0-100
  lastUpdated: string;
}

// Mock restaurants
export const mockRestaurants: Restaurant[] = [
  {
    id: "r1",
    name: "The French Laundry",
    city: "Yountville",
    state: "CA",
    cuisine: "French",
    priceRange: "$$$$",
    serviceStyle: "fine_dining",
    tipModel: "pool",
    poolDistribution: "point_based",
    creditCardFeeDeduction: true,
  },
  {
    id: "r2",
    name: "Carbone",
    city: "New York",
    state: "NY",
    cuisine: "Italian",
    priceRange: "$$$$",
    serviceStyle: "upscale",
    tipModel: "individual",
    creditCardFeeDeduction: true,
  },
  {
    id: "r3",
    name: "Tao Nightclub",
    city: "Las Vegas",
    state: "NV",
    cuisine: "Asian Fusion",
    priceRange: "$$$",
    serviceStyle: "nightclub",
    tipModel: "individual",
    creditCardFeeDeduction: true,
  },
  {
    id: "r4",
    name: "Joe's Stone Crab",
    city: "Miami Beach",
    state: "FL",
    cuisine: "Seafood",
    priceRange: "$$$",
    serviceStyle: "upscale",
    tipModel: "individual",
    creditCardFeeDeduction: false,
  },
  {
    id: "r5",
    name: "Alinea",
    city: "Chicago",
    state: "IL",
    cuisine: "Contemporary",
    priceRange: "$$$$",
    serviceStyle: "fine_dining",
    tipModel: "pool",
    poolDistribution: "equal",
    creditCardFeeDeduction: true,
  },
  {
    id: "r6",
    name: "Beauty & Essex",
    city: "New York",
    state: "NY",
    cuisine: "American",
    priceRange: "$$$",
    serviceStyle: "upscale",
    tipModel: "hybrid",
    poolDistribution: "sales_weighted",
    creditCardFeeDeduction: true,
  },
  {
    id: "r7",
    name: "Catch LA",
    city: "Los Angeles",
    state: "CA",
    cuisine: "Seafood",
    priceRange: "$$$",
    serviceStyle: "upscale",
    tipModel: "individual",
    creditCardFeeDeduction: true,
  },
  {
    id: "r8",
    name: "Maggiano's",
    city: "Chicago",
    state: "IL",
    cuisine: "Italian",
    priceRange: "$$",
    serviceStyle: "casual",
    tipModel: "individual",
    creditCardFeeDeduction: true,
  },
];

// Generate realistic mock shift submissions
const generateShiftSubmissions = (): ShiftSubmission[] => {
  const submissions: ShiftSubmission[] = [];
  const dayOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Generate data for Carbone - Server - Dinner (high-end)
  for (let i = 0; i < 45; i++) {
    const sales = 1500 + Math.random() * 2000;
    const tipPercent = 0.18 + Math.random() * 0.07;
    const grossTips = sales * tipPercent;
    const tipOut = grossTips * (0.03 + Math.random() * 0.02);
    const netTips = grossTips - tipOut;
    const hours = 5 + Math.random() * 2;

    submissions.push({
      id: `s-carbone-server-${i}`,
      restaurantId: "r2",
      role: "server",
      shiftTimeOfDay: "dinner",
      shiftType: "standard",
      date: `2026-01-${String(Math.floor(Math.random() * 20) + 1).padStart(2, "0")}`,
      dayOfWeek: dayOfWeek[Math.floor(Math.random() * 7)],
      baseWage: 10.5,
      totalSales: Math.round(sales),
      grossTips: Math.round(grossTips),
      tipOutAmount: Math.round(tipOut),
      netTips: Math.round(netTips),
      hoursWorked: Number(hours.toFixed(1)),
      effectiveHourly: Math.round(netTips / hours + 10.5),
      partyCount: Math.floor(12 + Math.random() * 8),
      sectionSize: Math.floor(4 + Math.random() * 3),
      staffingLevel: ["normal", "normal", "normal", "short"][
        Math.floor(Math.random() * 4)
      ] as any,
    });
  }

  // Carbone - Bartender - Dinner
  for (let i = 0; i < 38; i++) {
    const sales = 2200 + Math.random() * 1800;
    const tipPercent = 0.2 + Math.random() * 0.08;
    const grossTips = sales * tipPercent;
    const tipOut = grossTips * 0.02;
    const netTips = grossTips - tipOut;
    const hours = 6 + Math.random() * 2;

    submissions.push({
      id: `s-carbone-bartender-${i}`,
      restaurantId: "r2",
      role: "bartender",
      shiftTimeOfDay: "dinner",
      shiftType: "standard",
      date: `2026-01-${String(Math.floor(Math.random() * 20) + 1).padStart(2, "0")}`,
      dayOfWeek: dayOfWeek[Math.floor(Math.random() * 7)],
      baseWage: 12.0,
      totalSales: Math.round(sales),
      grossTips: Math.round(grossTips),
      tipOutAmount: Math.round(tipOut),
      netTips: Math.round(netTips),
      hoursWorked: Number(hours.toFixed(1)),
      effectiveHourly: Math.round(netTips / hours + 12),
      staffingLevel: "normal",
    });
  }

  // Tao Nightclub - Bottle Service - Late Night
  for (let i = 0; i < 52; i++) {
    const sales = 3500 + Math.random() * 5000;
    const tipPercent = 0.18 + Math.random() * 0.12;
    const grossTips = sales * tipPercent;
    const tipOut = grossTips * 0.05;
    const netTips = grossTips - tipOut;
    const hours = 6 + Math.random() * 2;

    submissions.push({
      id: `s-tao-bottle-${i}`,
      restaurantId: "r3",
      role: "bottle_service",
      shiftTimeOfDay: "late_night",
      shiftType: "bottle_service",
      date: `2026-01-${String(Math.floor(Math.random() * 20) + 1).padStart(2, "0")}`,
      dayOfWeek: dayOfWeek[Math.floor(Math.random() * 7)],
      baseWage: 15.0,
      totalSales: Math.round(sales),
      grossTips: Math.round(grossTips),
      tipOutAmount: Math.round(tipOut),
      netTips: Math.round(netTips),
      hoursWorked: Number(hours.toFixed(1)),
      effectiveHourly: Math.round(netTips / hours + 15),
      partyCount: Math.floor(2 + Math.random() * 4),
      staffingLevel: "normal",
    });
  }

  // French Laundry - Server - Dinner (pooled tips)
  for (let i = 0; i < 41; i++) {
    const hours = 7 + Math.random() * 2;
    const netTips = 280 + Math.random() * 180; // Pooled, so more consistent

    submissions.push({
      id: `s-fl-server-${i}`,
      restaurantId: "r1",
      role: "server",
      shiftTimeOfDay: "dinner",
      shiftType: "standard",
      date: `2026-01-${String(Math.floor(Math.random() * 20) + 1).padStart(2, "0")}`,
      dayOfWeek: dayOfWeek[Math.floor(Math.random() * 7)],
      baseWage: 16.0,
      totalSales: Math.round(1800 + Math.random() * 800),
      grossTips: 0, // Pooled
      tipOutAmount: 0,
      netTips: Math.round(netTips),
      hoursWorked: Number(hours.toFixed(1)),
      effectiveHourly: Math.round(netTips / hours + 16),
      partyCount: Math.floor(15 + Math.random() * 10),
      sectionSize: Math.floor(3 + Math.random() * 2),
      staffingLevel: "normal",
    });
  }

  // Maggiano's - Server - Dinner (casual dining)
  for (let i = 0; i < 36; i++) {
    const sales = 600 + Math.random() * 500;
    const tipPercent = 0.15 + Math.random() * 0.08;
    const grossTips = sales * tipPercent;
    const tipOut = grossTips * 0.025;
    const netTips = grossTips - tipOut;
    const hours = 5 + Math.random() * 1.5;

    submissions.push({
      id: `s-maggiano-server-${i}`,
      restaurantId: "r8",
      role: "server",
      shiftTimeOfDay: "dinner",
      shiftType: "standard",
      date: `2026-01-${String(Math.floor(Math.random() * 20) + 1).padStart(2, "0")}`,
      dayOfWeek: dayOfWeek[Math.floor(Math.random() * 7)],
      baseWage: 5.5,
      totalSales: Math.round(sales),
      grossTips: Math.round(grossTips),
      tipOutAmount: Math.round(tipOut),
      netTips: Math.round(netTips),
      hoursWorked: Number(hours.toFixed(1)),
      effectiveHourly: Math.round(netTips / hours + 5.5),
      partyCount: Math.floor(8 + Math.random() * 8),
      sectionSize: Math.floor(5 + Math.random() * 3),
      staffingLevel: ["normal", "normal", "over"][
        Math.floor(Math.random() * 3)
      ] as any,
    });
  }

  // Carbone - Server - Lunch
  for (let i = 0; i < 28; i++) {
    const sales = 800 + Math.random() * 700;
    const tipPercent = 0.18 + Math.random() * 0.06;
    const grossTips = sales * tipPercent;
    const tipOut = grossTips * 0.03;
    const netTips = grossTips - tipOut;
    const hours = 4 + Math.random() * 1.5;

    submissions.push({
      id: `s-carbone-server-lunch-${i}`,
      restaurantId: "r2",
      role: "server",
      shiftTimeOfDay: "lunch",
      shiftType: "standard",
      date: `2026-01-${String(Math.floor(Math.random() * 20) + 1).padStart(2, "0")}`,
      dayOfWeek: dayOfWeek.slice(0, 5)[Math.floor(Math.random() * 5)], // Weekdays only
      baseWage: 10.5,
      totalSales: Math.round(sales),
      grossTips: Math.round(grossTips),
      tipOutAmount: Math.round(tipOut),
      netTips: Math.round(netTips),
      hoursWorked: Number(hours.toFixed(1)),
      effectiveHourly: Math.round(netTips / hours + 10.5),
      partyCount: Math.floor(8 + Math.random() * 6),
      sectionSize: Math.floor(4 + Math.random() * 2),
      staffingLevel: "normal",
    });
  }

  // Beauty & Essex - Server - Brunch
  for (let i = 0; i < 32; i++) {
    const sales = 950 + Math.random() * 600;
    const tipPercent = 0.17 + Math.random() * 0.06;
    const grossTips = sales * tipPercent;
    const tipOut = grossTips * 0.04;
    const netTips = grossTips - tipOut;
    const hours = 5 + Math.random() * 1.5;

    submissions.push({
      id: `s-beauty-server-brunch-${i}`,
      restaurantId: "r6",
      role: "server",
      shiftTimeOfDay: "brunch",
      shiftType: "standard",
      date: `2026-01-${String(Math.floor(Math.random() * 20) + 1).padStart(2, "0")}`,
      dayOfWeek: ["Saturday", "Sunday"][Math.floor(Math.random() * 2)],
      baseWage: 12.0,
      totalSales: Math.round(sales),
      grossTips: Math.round(grossTips),
      tipOutAmount: Math.round(tipOut),
      netTips: Math.round(netTips),
      hoursWorked: Number(hours.toFixed(1)),
      effectiveHourly: Math.round(netTips / hours + 12),
      partyCount: Math.floor(10 + Math.random() * 8),
      sectionSize: Math.floor(5 + Math.random() * 2),
      staffingLevel: "normal",
    });
  }

  return submissions;
};

export const mockShiftSubmissions = generateShiftSubmissions();

// Calculate earnings stats from submissions
const calculateStats = (
  restaurantId: string,
  role: Role,
  shiftTimeOfDay: ShiftTimeOfDay,
): EarningsStats | null => {
  const relevantSubmissions = mockShiftSubmissions.filter(
    (s) =>
      s.restaurantId === restaurantId &&
      s.role === role &&
      s.shiftTimeOfDay === shiftTimeOfDay,
  );

  if (relevantSubmissions.length < 5) return null;

  const sortedTips = relevantSubmissions
    .map((s) => s.netTips)
    .sort((a, b) => a - b);
  const sortedHourly = relevantSubmissions
    .map((s) => s.effectiveHourly)
    .sort((a, b) => a - b);

  const median = (arr: number[]) => {
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid];
  };

  const percentile = (arr: number[], p: number) => {
    const index = Math.floor(arr.length * p);
    return arr[index];
  };

  const avgSales =
    relevantSubmissions.reduce((sum, s) => sum + s.totalSales, 0) /
    relevantSubmissions.length;
  const avgTipOut =
    relevantSubmissions.reduce(
      (sum, s) => sum + (s.tipOutAmount / s.grossTips || 0),
      0,
    ) / relevantSubmissions.length;
  const avgHours =
    relevantSubmissions.reduce((sum, s) => sum + s.hoursWorked, 0) /
    relevantSubmissions.length;

  // Confidence score based on submission count and recency
  const confidenceScore = Math.min(
    100,
    (relevantSubmissions.length / 50) * 100,
  );

  return {
    restaurantId,
    role,
    shiftTimeOfDay,
    submissionCount: relevantSubmissions.length,
    medianNetTips: Math.round(median(sortedTips)),
    percentile25: Math.round(percentile(sortedTips, 0.25)),
    percentile75: Math.round(percentile(sortedTips, 0.75)),
    medianHourly: Math.round(median(sortedHourly)),
    medianSales: Math.round(avgSales),
    avgTipOutPercent: Number((avgTipOut * 100).toFixed(1)),
    avgHoursPerShift: Number(avgHours.toFixed(1)),
    confidenceScore: Math.round(confidenceScore),
    lastUpdated: "2026-01-20",
  };
};

// Pre-calculate stats for common combinations
export const mockEarningsStats: EarningsStats[] = [
  calculateStats("r2", "server", "dinner"),
  calculateStats("r2", "server", "lunch"),
  calculateStats("r2", "bartender", "dinner"),
  calculateStats("r3", "bottle_service", "late_night"),
  calculateStats("r1", "server", "dinner"),
  calculateStats("r8", "server", "dinner"),
  calculateStats("r6", "server", "brunch"),
].filter(Boolean) as EarningsStats[];

// Helper functions
export const getRestaurantById = (id: string) =>
  mockRestaurants.find((r) => r.id === id);

export const getStatsForRestaurant = (
  restaurantId: string,
  role?: Role,
  shiftTime?: ShiftTimeOfDay,
) => {
  return mockEarningsStats.filter((s) => {
    if (s.restaurantId !== restaurantId) return false;
    if (role && s.role !== role) return false;
    if (shiftTime && s.shiftTimeOfDay !== shiftTime) return false;
    return true;
  });
};

export const getSubmissionsForRestaurant = (
  restaurantId: string,
  role?: Role,
  shiftTime?: ShiftTimeOfDay,
) => {
  return mockShiftSubmissions.filter((s) => {
    if (s.restaurantId !== restaurantId) return false;
    if (role && s.role !== role) return false;
    if (shiftTime && s.shiftTimeOfDay !== shiftTime) return false;
    return true;
  });
};

export const roleLabels: Record<Role, string> = {
  server: "Server",
  bartender: "Bartender",
  barback: "Barback",
  host: "Host",
  server_assistant: "Server Assistant",
  bottle_service: "Bottle Service",
  manager: "Manager",
  cook: "Cook",
  chef: "Chef",
  dishwasher: "Dishwasher",
};

export const shiftTimeLabels: Record<ShiftTimeOfDay, string> = {
  am: "AM",
  lunch: "Lunch",
  brunch: "Brunch",
  dinner: "Dinner",
  late_night: "Late Night",
  overnight: "Overnight",
};
