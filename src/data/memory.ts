// What the coach remembers about the demo persona. In production these are written by
// Claude after chats and check-ins (one fact per item, with where it came from) and are
// added to the context of every answer. The user can see, edit and delete all of them.

export type MemoryCategory = "Goals" | "Training" | "Nutrition" | "Lifestyle" | "Health";
export type MemorySource = "You told me" | "From your data";

export type MemoryItem = {
  id: string;
  category: MemoryCategory;
  text: string;
  source: MemorySource;
  where: string; // the chat, check-in or sync it came from
  date: string;
  usedIn?: string; // last answer that relied on it
  pinned?: boolean;
};

export const memoryCategories: MemoryCategory[] = ["Goals", "Training", "Nutrition", "Lifestyle", "Health"];

export const memories: MemoryItem[] = [
  { id: "g1", category: "Goals", text: "You want to be 85 kg by 20 December, for a holiday on the 22nd.", source: "You told me", where: "Onboarding", date: "2026-07-20", usedIn: "Am I on track for my goal?", pinned: true },
  { id: "g2", category: "Goals", text: "Keeping your squat and deadlift strength through the cut matters most to you.", source: "You told me", where: "Chat", date: "2026-08-02", usedIn: "Week 12 report" },
  { id: "g3", category: "Goals", text: "You plan a lean bulk from January and want a bench PR in the spring.", source: "You told me", where: "Chat", date: "2026-09-14" },

  { id: "t1", category: "Training", text: "You train at 06:30 before work, so sessions have to fit in 75 minutes.", source: "You told me", where: "Onboarding", date: "2026-07-20", usedIn: "Should I change my workout programme?" },
  { id: "t2", category: "Training", text: "Upright rows and behind-the-neck pressing irritate your left shoulder. Cable laterals are fine.", source: "You told me", where: "Chat", date: "2026-08-11", pinned: true },
  { id: "t3", category: "Training", text: "Bench is your priority lift, and the one that frustrates you most.", source: "From your data", where: "Hevy + chats", date: "2026-09-29", usedIn: "How can I improve my bench press?" },
  { id: "t4", category: "Training", text: "In high-stress weeks you skip a session rather than do a shorter one (weeks 9 and 11).", source: "From your data", where: "Hevy", date: "2026-10-05", usedIn: "Should I change my workout programme?" },

  { id: "n1", category: "Nutrition", text: "You don't eat fish. Chicken, turkey, beef and dairy are your protein sources.", source: "You told me", where: "Onboarding", date: "2026-07-20", usedIn: "Meal prep plan", pinned: true },
  { id: "n2", category: "Nutrition", text: "You can't face a big breakfast at 06:00. Overnight oats work.", source: "You told me", where: "Chat", date: "2026-07-27", usedIn: "Meal prep plan" },
  { id: "n3", category: "Nutrition", text: "Saturday is usually a takeaway and drinks with friends.", source: "From your data", where: "Nutrition log", date: "2026-09-21", usedIn: "Should I reduce my calories this week?" },
  { id: "n4", category: "Nutrition", text: "You have three coffees a day with semi-skimmed milk (about 100 kcal).", source: "You told me", where: "Check-in, week 3", date: "2026-08-03" },

  { id: "l1", category: "Lifestyle", text: "You work a desk job in finance. Month-end deadlines push your stress up and steps down.", source: "From your data", where: "Check-ins", date: "2026-09-28", usedIn: "Week 12 report" },
  { id: "l2", category: "Lifestyle", text: "Late-night phone scrolling cuts your sleep; the goal is screens off at 23:00.", source: "You told me", where: "Check-in, week 10", date: "2026-09-21", usedIn: "Week 12 report" },
  { id: "l3", category: "Lifestyle", text: "Your partner cooks dinner two or three nights a week.", source: "You told me", where: "Chat", date: "2026-08-18" },

  { id: "h1", category: "Health", text: "You declared testosterone use at onboarding. It's only used to interpret blood work.", source: "You told me", where: "Onboarding", date: "2026-07-20", usedIn: "Blood work review" },
  { id: "h2", category: "Health", text: "You take 5 g creatine a day, which raises creatinine on blood tests.", source: "You told me", where: "Blood work upload", date: "2026-10-09", usedIn: "Blood work review" },
  { id: "h3", category: "Health", text: "Your haematocrit was 0.53 on 9 Oct; re-test 6–8 weeks after the dose change.", source: "From your data", where: "Blood work", date: "2026-10-09", usedIn: "Blood work review" },
];

/** One line per past weekly report: the coach re-reads these before writing the next one. */
export const reportSummaries = [
  { week: 12, text: "Scale stalled (−0.1 kg) but waist −0.5 cm. Kept 2,400 kcal; focus on weekends, steps and protein." },
  { week: 11, text: "Only 4 sessions in a deadline week. Protein down to 190 g. Suggested a 35-minute minimum day." },
  { week: 10, text: "Hunger up to 7/10. Moved more carbs to the evening; added a planned Saturday meal." },
  { week: 9, text: "First slowdown in fat loss. Steps under 8,500; no calorie change, walk after lunch added." },
];
