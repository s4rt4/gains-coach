// Meal-prep plans for the demo persona. Macros are per portion; kcal is derived
// from them (4/4/9) in code so the numbers always add up.
// In production Claude builds these from the user's targets, food dislikes (memory)
// and the coaching knowledge base, then the app does the maths.

export type Aisle = "Meat & dairy" | "Grains & tins" | "Fruit & veg" | "Other";
export type Ingredient = { item: string; qty: number; unit: "g" | "ml" | ""; aisle: Aisle };

export type Recipe = {
  id: string;
  slot: "Breakfast" | "Lunch" | "Snack" | "Dinner" | "Evening";
  name: string;
  p: number;
  c: number;
  f: number;
  portions: number; // how many the batch makes
  prepMin: number;
  keepsDays: number;
  /** Ingredients for the whole batch. */
  batch: Ingredient[];
  steps: string[];
};

export type MealPlan = {
  id: "cut" | "bulk";
  label: string;
  note: string;
  targets: { kcal: number; p: number; c: number; f: number };
  recipes: Recipe[];
  /** The Sunday cook, in order. Times are minutes from the start. */
  timeline: { at: number; task: string }[];
};

export const kcal = (m: { p: number; c: number; f: number }) => Math.round(m.p * 4 + m.c * 4 + m.f * 9);

const cut: MealPlan = {
  id: "cut",
  label: "Cut · current",
  note: "Your current targets. Leaves room for coffee milk, cooking oil and fruit.",
  targets: { kcal: 2400, p: 210, c: 230, f: 65 },
  recipes: [
    {
      id: "oats", slot: "Breakfast", name: "Protein overnight oats", p: 47, c: 58, f: 7, portions: 5, prepMin: 10, keepsDays: 4,
      batch: [
        { item: "Rolled oats", qty: 300, unit: "g", aisle: "Grains & tins" },
        { item: "Whey protein", qty: 150, unit: "g", aisle: "Other" },
        { item: "0% Greek yoghurt", qty: 750, unit: "g", aisle: "Meat & dairy" },
        { item: "Frozen berries", qty: 500, unit: "g", aisle: "Fruit & veg" },
      ],
      steps: ["Mix oats, whey and yoghurt with 100 ml water per jar.", "Top with berries, lid on, fridge.", "Make jar 5 fresh on Thursday."],
    },
    {
      id: "burrito", slot: "Lunch", name: "Chicken burrito bowl", p: 62, c: 60, f: 10, portions: 5, prepMin: 30, keepsDays: 4,
      batch: [
        { item: "Chicken breast", qty: 900, unit: "g", aisle: "Meat & dairy" },
        { item: "Basmati rice (dry)", qty: 210, unit: "g", aisle: "Grains & tins" },
        { item: "Black beans (tin)", qty: 300, unit: "g", aisle: "Grains & tins" },
        { item: "Peppers", qty: 3, unit: "", aisle: "Fruit & veg" },
        { item: "Salsa", qty: 250, unit: "g", aisle: "Grains & tins" },
      ],
      steps: [
        "Toss chicken in fajita spice; bake at 200 °C for 22 min.",
        "Cook the rice; roast sliced peppers on the bottom shelf.",
        "Slice chicken and build 5 bowls with beans and salsa.",
      ],
    },
    {
      id: "skyr", slot: "Snack", name: "Skyr and an apple", p: 28, c: 30, f: 1, portions: 5, prepMin: 0, keepsDays: 7,
      batch: [
        { item: "Skyr", qty: 1250, unit: "g", aisle: "Meat & dairy" },
        { item: "Apples", qty: 5, unit: "", aisle: "Fruit & veg" },
      ],
      steps: ["No cooking: grab and go."],
    },
    {
      id: "bolognese", slot: "Dinner", name: "Turkey bolognese", p: 51, c: 66, f: 16, portions: 5, prepMin: 40, keepsDays: 4,
      batch: [
        { item: "5% turkey mince", qty: 850, unit: "g", aisle: "Meat & dairy" },
        { item: "Pasta (dry)", qty: 400, unit: "g", aisle: "Grains & tins" },
        { item: "Chopped tomatoes (tin)", qty: 800, unit: "g", aisle: "Grains & tins" },
        { item: "Onion, carrot, garlic", qty: 1, unit: "", aisle: "Fruit & veg" },
        { item: "Parmesan", qty: 50, unit: "g", aisle: "Meat & dairy" },
      ],
      steps: [
        "Brown the mince, add onion, carrot and garlic.",
        "Add tomatoes and simmer for 30 min.",
        "Cook pasta al dente; portion into 5 boxes with 10 g parmesan each.",
      ],
    },
    {
      id: "cottage", slot: "Evening", name: "Cottage cheese and rice cakes", p: 18, c: 22, f: 7, portions: 5, prepMin: 0, keepsDays: 7,
      batch: [
        { item: "Cottage cheese", qty: 750, unit: "g", aisle: "Meat & dairy" },
        { item: "Rice cakes", qty: 10, unit: "", aisle: "Grains & tins" },
      ],
      steps: ["No cooking."],
    },
  ],
  timeline: [
    { at: 0, task: "Oven on to 200 °C. Rice on. Brown the turkey mince." },
    { at: 10, task: "Chicken and peppers in the oven (22 min)." },
    { at: 15, task: "Veg and tomatoes into the mince; simmer 30 min." },
    { at: 20, task: "Make 4 jars of overnight oats while things cook." },
    { at: 35, task: "Chicken out to rest. Pasta on." },
    { at: 50, task: "Slice chicken, build 5 burrito bowls." },
    { at: 60, task: "Portion bolognese and pasta into 5 boxes. Done." },
  ],
};

const bulk: MealPlan = {
  id: "bulk",
  label: "Lean bulk · from January",
  note: "Preview of your next phase: about 250 kcal over maintenance, so the gain is mostly muscle.",
  targets: { kcal: 3300, p: 200, c: 400, f: 95 },
  recipes: [
    {
      id: "pb-oats", slot: "Breakfast", name: "PB & banana overnight oats", p: 48, c: 96, f: 21, portions: 5, prepMin: 10, keepsDays: 4,
      batch: [
        { item: "Rolled oats", qty: 450, unit: "g", aisle: "Grains & tins" },
        { item: "Whey protein", qty: 150, unit: "g", aisle: "Other" },
        { item: "Semi-skimmed milk", qty: 1000, unit: "ml", aisle: "Meat & dairy" },
        { item: "Bananas", qty: 5, unit: "", aisle: "Fruit & veg" },
        { item: "Peanut butter", qty: 100, unit: "g", aisle: "Other" },
      ],
      steps: ["Mix oats, whey and milk per jar.", "Slice a banana and add 20 g peanut butter on top.", "Fridge overnight."],
    },
    {
      id: "beef-bowl", slot: "Lunch", name: "Beef & rice power bowl", p: 45, c: 62, f: 22, portions: 5, prepMin: 30, keepsDays: 4,
      batch: [
        { item: "5% beef mince", qty: 900, unit: "g", aisle: "Meat & dairy" },
        { item: "Basmati rice (dry)", qty: 350, unit: "g", aisle: "Grains & tins" },
        { item: "Stir-fry veg", qty: 600, unit: "g", aisle: "Fruit & veg" },
        { item: "Olive oil", qty: 50, unit: "ml", aisle: "Other" },
        { item: "Soy & honey sauce", qty: 150, unit: "ml", aisle: "Grains & tins" },
      ],
      steps: ["Brown the beef in oil; add sauce to glaze.", "Stir-fry the veg.", "Build 5 bowls over 200 g cooked rice each."],
    },
    {
      id: "shake", slot: "Snack", name: "Mass shake", p: 54, c: 85, f: 20, portions: 5, prepMin: 5, keepsDays: 5,
      batch: [
        { item: "Semi-skimmed milk", qty: 2000, unit: "ml", aisle: "Meat & dairy" },
        { item: "Whey protein", qty: 200, unit: "g", aisle: "Other" },
        { item: "Rolled oats", qty: 250, unit: "g", aisle: "Grains & tins" },
        { item: "Bananas", qty: 5, unit: "", aisle: "Fruit & veg" },
        { item: "Peanut butter", qty: 75, unit: "g", aisle: "Other" },
      ],
      steps: ["Pre-portion oats and whey into 5 tubs.", "Blend with 400 ml milk, a banana and 15 g peanut butter on the day."],
    },
    {
      id: "pesto-pasta", slot: "Dinner", name: "Chicken pesto pasta", p: 66, c: 82, f: 22, portions: 5, prepMin: 35, keepsDays: 4,
      batch: [
        { item: "Chicken breast", qty: 900, unit: "g", aisle: "Meat & dairy" },
        { item: "Pasta (dry)", qty: 550, unit: "g", aisle: "Grains & tins" },
        { item: "Green pesto", qty: 125, unit: "g", aisle: "Grains & tins" },
        { item: "Parmesan", qty: 50, unit: "g", aisle: "Meat & dairy" },
        { item: "Cherry tomatoes", qty: 400, unit: "g", aisle: "Fruit & veg" },
      ],
      steps: [
        "Bake chicken at 200 °C for 22 min, then dice.",
        "Cook pasta, stir through pesto and halved tomatoes.",
        "Portion into 5 boxes and top with parmesan.",
      ],
    },
    {
      id: "yoghurt", slot: "Evening", name: "Greek yoghurt, honey & granola", p: 25, c: 55, f: 9, portions: 5, prepMin: 5, keepsDays: 5,
      batch: [
        { item: "0% Greek yoghurt", qty: 1000, unit: "g", aisle: "Meat & dairy" },
        { item: "Granola", qty: 250, unit: "g", aisle: "Grains & tins" },
        { item: "Honey", qty: 100, unit: "g", aisle: "Other" },
      ],
      steps: ["Keep the granola separate so it stays crunchy."],
    },
  ],
  timeline: [
    { at: 0, task: "Oven on to 200 °C. Rice and pasta water on." },
    { at: 5, task: "Chicken in the oven (22 min)." },
    { at: 10, task: "Brown the beef; glaze with soy & honey." },
    { at: 20, task: "Pasta in. Stir-fry the veg." },
    { at: 30, task: "Make 4 jars of PB oats; portion shake tubs." },
    { at: 40, task: "Dice chicken, mix with pesto pasta and tomatoes." },
    { at: 55, task: "Build beef bowls and pasta boxes. Done." },
  ],
};

export const mealPlans: MealPlan[] = [cut, bulk];
