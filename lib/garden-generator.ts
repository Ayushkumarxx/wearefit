import { DailyLog, GardenItem } from "@/types/health";

export function generateGardenFromLogs(logs: Record<string, DailyLog>): GardenItem[] {
  const items: GardenItem[] = [];
  const entries = Object.entries(logs).sort(([a], [b]) => a.localeCompare(b));

  // If no logs, generate a peaceful beginner starter garden
  if (entries.length === 0) {
    return [
      { id: "g_init_1", emoji: "🌱", name: "Seedling of Consistency", type: "healthy", category: "streak", x: 25, y: 35, scale: 1.1, rotation: -5, createdAt: new Date().toISOString(), sourceDate: "today" },
      { id: "g_init_2", emoji: "🌿", name: "Fresh Herb Sprout", type: "healthy", category: "nutrition", x: 65, y: 45, scale: 1.2, rotation: 8, createdAt: new Date().toISOString(), sourceDate: "today" },
      { id: "g_init_3", emoji: "🌻", name: "Morning Sunburst", type: "healthy", category: "activity", x: 45, y: 70, scale: 1.3, rotation: 2, createdAt: new Date().toISOString(), sourceDate: "today" },
      { id: "g_init_4", emoji: "💧", name: "Hydration Dew", type: "healthy", category: "hydration", x: 80, y: 25, scale: 0.9, rotation: 0, createdAt: new Date().toISOString(), sourceDate: "today" },
    ];
  }

  // Generate garden elements for each logged day
  let seedIndex = 0;
  entries.forEach(([date, log]) => {
    // 1. Healthy Eating items (Veggies & Fruits)
    if (log.healthyEatingScore >= 7) {
      const healthyEmojis = ["🥦", "🥑", "🍓", "🍎", "🥗", "🥕", "🫐", "🍇"];
      const emoji = healthyEmojis[seedIndex % healthyEmojis.length];
      items.push({
        id: `g_${date}_health_${seedIndex}`,
        emoji,
        name: "Nutrient-Dense Harvest",
        type: "healthy",
        category: "nutrition",
        x: 12 + ((seedIndex * 29) % 76),
        y: 15 + ((seedIndex * 37) % 70),
        scale: 1.1 + ((seedIndex % 3) * 0.1),
        rotation: (seedIndex * 13) % 25 - 12,
        createdAt: log.updatedAt,
        sourceDate: date,
      });
      seedIndex++;
    }

    // 2. Sleep / Flora Growth
    if (log.sleepHours >= 7.5) {
      const floraEmojis = ["🌿", "🌻", "🌸", "🌳", "🍀", "🪴"];
      const emoji = floraEmojis[seedIndex % floraEmojis.length];
      items.push({
        id: `g_${date}_sleep_${seedIndex}`,
        emoji,
        name: "Deep REM Blossom",
        type: "healthy",
        category: "sleep",
        x: 10 + ((seedIndex * 41) % 78),
        y: 18 + ((seedIndex * 23) % 68),
        scale: 1.2,
        rotation: (seedIndex * 17) % 20 - 10,
        createdAt: log.updatedAt,
        sourceDate: date,
      });
      seedIndex++;
    }

    // 3. Movement / Vitality Emojis
    if (log.steps >= 7000 || log.workoutMinutes >= 30) {
      const actionEmojis = ["🏃‍♂️", "⚡", "🚴", "🧘", "💪", "🧗"];
      const emoji = actionEmojis[seedIndex % actionEmojis.length];
      items.push({
        id: `g_${date}_action_${seedIndex}`,
        emoji,
        name: "Kinetic Vitality Sprite",
        type: "healthy",
        category: "activity",
        x: 15 + ((seedIndex * 33) % 70),
        y: 20 + ((seedIndex * 31) % 65),
        scale: 1.15,
        rotation: (seedIndex * 7) % 15 - 7,
        createdAt: log.updatedAt,
        sourceDate: date,
      });
      seedIndex++;
    }

    // 4. Bad Habits / Weeds / Junk Food
    if (log.ultraProcessed) {
      const junkEmojis = ["🍩", "🍔", "🍟", "🍕", "🧁"];
      const emoji = junkEmojis[seedIndex % junkEmojis.length];
      items.push({
        id: `g_${date}_junk_${seedIndex}`,
        emoji,
        name: "Ultra-Processed Gremlin",
        type: "unhealthy",
        category: "nutrition",
        x: 14 + ((seedIndex * 47) % 72),
        y: 22 + ((seedIndex * 29) % 64),
        scale: 1.05,
        rotation: (seedIndex * 21) % 30 - 15,
        createdAt: log.updatedAt,
        sourceDate: date,
      });
      seedIndex++;
    }

    if (log.sleepHours < 6) {
      items.push({
        id: `g_${date}_tired_${seedIndex}`,
        emoji: "🥱",
        name: "Fatigue Fog",
        type: "unhealthy",
        category: "sleep",
        x: 20 + ((seedIndex * 39) % 65),
        y: 15 + ((seedIndex * 43) % 65),
        scale: 1.0,
        rotation: -10,
        createdAt: log.updatedAt,
        sourceDate: date,
      });
      seedIndex++;
    }

    if (log.ateOutside && log.healthyEatingScore <= 5) {
      items.push({
        id: `g_${date}_weed_${seedIndex}`,
        emoji: "🥀",
        name: "Wilted Sprout",
        type: "unhealthy",
        category: "nutrition",
        x: 18 + ((seedIndex * 53) % 68),
        y: 28 + ((seedIndex * 19) % 60),
        scale: 0.95,
        rotation: 12,
        createdAt: log.updatedAt,
        sourceDate: date,
      });
      seedIndex++;
    }
  });

  return items;
}
