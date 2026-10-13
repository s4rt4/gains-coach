// Demo business data for the admin panel. In production this comes from the
// database, the payment provider (subscriptions) and Claude API usage logs.

export const ARPU = 17.9; // average revenue per paying subscriber, £/month
export const AI_COST_PER_USER = 1.1; // average Claude API cost per active user, £/month

export const monthly = [
  { month: "May", subscribers: 410, signups: 520 },
  { month: "Jun", subscribers: 690, signups: 470 },
  { month: "Jul", subscribers: 1020, signups: 590 },
  { month: "Aug", subscribers: 1380, signups: 640 },
  { month: "Sep", subscribers: 1790, signups: 760 },
  { month: "Oct", subscribers: 2140, signups: 690 },
].map((m) => ({ ...m, mrr: Math.round(m.subscribers * ARPU), aiCost: Math.round(m.subscribers * AI_COST_PER_USER) }));

export const current = {
  subscribers: 2140,
  trials: 312,
  churnRate: 3.4, // % monthly
  messages: 184_200, // coach messages this month
  reports: 7_950, // weekly reports generated this month
  bloodReviews: 640,
  cacheHitRate: 71, // % of prompt tokens served from cache
};

export type Influencer = {
  name: string;
  handle: string;
  audience: string;
  code: string;
  signups: number;
  active: number;
  status: "active" | "new";
};

export const COMMISSION = 0.2; // share of referred revenue paid to the influencer

export const influencers: Influencer[] = [
  { name: "Dan Mercer", handle: "@mercerbuilt", audience: "412k", code: "MERCER", signups: 612, active: 488, status: "active" },
  { name: "Priya Shah", handle: "@priyalifts", audience: "228k", code: "PRIYA", signups: 341, active: 290, status: "active" },
  { name: "Jordan Cole", handle: "@colepreps", audience: "185k", code: "COLE", signups: 274, active: 219, status: "active" },
  { name: "Marcus Reid", handle: "@reidenhanced", audience: "96k", code: "REID", signups: 133, active: 117, status: "active" },
  { name: "Liam Hart", handle: "@hartiron", audience: "61k", code: "HART", signups: 58, active: 41, status: "new" },
];

export type UserStatus = "active" | "trial" | "past_due" | "churned";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  plan: "Monthly" | "Annual" | "Trial";
  source: string; // influencer code or "Organic"
  joined: string;
  lastActive: string;
  phase: "Cut" | "Bulk" | "Maintain" | "Prep";
  messages: number; // this month
  aiCost: number; // £ this month
  status: UserStatus;
  flag?: string;
};

export const users: AdminUser[] = [
  { id: "u1", name: "Tom Walker", email: "tom.walker@example.com", plan: "Monthly", source: "MERCER", joined: "2026-07-18", lastActive: "Today, 08:14", phase: "Cut", messages: 142, aiCost: 1.84, status: "active", flag: "Blood work" },
  { id: "u2", name: "Aisha Khan", email: "aisha.k@example.com", plan: "Annual", source: "PRIYA", joined: "2026-06-02", lastActive: "Today, 07:51", phase: "Bulk", messages: 96, aiCost: 1.22, status: "active" },
  { id: "u3", name: "Ryan Doyle", email: "ryan.doyle@example.com", plan: "Monthly", source: "Organic", joined: "2026-08-21", lastActive: "Yesterday", phase: "Prep", messages: 231, aiCost: 2.96, status: "active" },
  { id: "u4", name: "Ellie Morgan", email: "ellie.m@example.com", plan: "Monthly", source: "COLE", joined: "2026-09-04", lastActive: "Today, 06:30", phase: "Cut", messages: 58, aiCost: 0.71, status: "active", flag: "Wellbeing" },
  { id: "u5", name: "Chris Okafor", email: "chris.o@example.com", plan: "Trial", source: "REID", joined: "2026-10-09", lastActive: "Today, 09:02", phase: "Cut", messages: 34, aiCost: 0.48, status: "trial", flag: "Feedback" },
  { id: "u6", name: "Ben Ashworth", email: "ben.ash@example.com", plan: "Annual", source: "MERCER", joined: "2026-05-27", lastActive: "2 days ago", phase: "Maintain", messages: 41, aiCost: 0.55, status: "active" },
  { id: "u7", name: "Sophie Turner", email: "sophie.t@example.com", plan: "Monthly", source: "Organic", joined: "2026-07-30", lastActive: "6 days ago", phase: "Bulk", messages: 12, aiCost: 0.19, status: "past_due" },
  { id: "u8", name: "Kieran Walsh", email: "kieran.w@example.com", plan: "Trial", source: "HART", joined: "2026-10-11", lastActive: "Today, 08:47", phase: "Bulk", messages: 19, aiCost: 0.27, status: "trial" },
  { id: "u9", name: "Mo Haddad", email: "mo.h@example.com", plan: "Monthly", source: "PRIYA", joined: "2026-06-15", lastActive: "Yesterday", phase: "Prep", messages: 178, aiCost: 2.31, status: "active" },
  { id: "u10", name: "Jack Pearson", email: "jack.p@example.com", plan: "Monthly", source: "COLE", joined: "2026-07-07", lastActive: "3 weeks ago", phase: "Cut", messages: 0, aiCost: 0, status: "churned" },
];

export type Review = { user: string; area: string; detail: string; tone: "flag" | "watch"; action: string };

export const reviews: Review[] = [
  {
    user: "Tom Walker",
    area: "Blood work",
    detail: "Haematocrit and ALT above range. Coach advised booking a GP review and gave no dosage advice.",
    tone: "flag",
    action: "Escalated",
  },
  {
    user: "Ellie Morgan",
    area: "Wellbeing",
    detail: "Messages suggest very low intake. Coach shared support resources and paused deficit advice.",
    tone: "flag",
    action: "Needs review",
  },
  {
    user: "Chris Okafor",
    area: "Feedback",
    detail: "Rated an answer unhelpful: disagreed with a calorie cut after a high-stress week.",
    tone: "watch",
    action: "Needs review",
  },
];

export const knowledgeBase = [
  { name: "Cutting protocol v3.pdf", detail: "Deficits, refeeds, diet breaks", chunks: 84, updated: "2 Oct" },
  { name: "Hypertrophy programming.pdf", detail: "Volume, progression, deloads", chunks: 126, updated: "28 Sep" },
  { name: "Enhanced athlete blood markers.pdf", detail: "Reference notes for lab reviews", chunks: 52, updated: "21 Sep" },
  { name: "Meal prep recipe library.xlsx", detail: "212 recipes with macros", chunks: 212, updated: "14 Sep" },
];
