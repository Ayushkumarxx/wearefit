import { DailyLog, GardenItem } from "@/types/health";

export function generateGardenFromLogs(logs: Record<string, DailyLog>): GardenItem[] {
  const items: GardenItem[] = [];
  const entries = Object.entries(logs).sort(([a], [b]) => a.localeCompare(b));

  if (entries.length === 0) {
    return [];
  }

  let seedIndex = 0;
  entries.forEach(([date, log]) => {
    // Only generate flora/weeds for days with actual core logs
    const hasActualData =
      (log.sleepHours || 0) > 0 ||
      (log.calories || 0) > 0 ||
      (log.steps || 0) > 0 ||
      (log.waterLiters || 0) > 0;

    if (!hasActualData) return;

    // 1. Healthy Eating items (Veggies & Fruits)
    if (log.calories > 0 && log.healthyEatingScore >= 7) {
      const healthyEmojis = ["🥦", "🥑", "🍓", "🍎", "🥗", "🥕", "🫐", "🍇"];
      const emoji = healthyEmojis[seedIndex % healthyEmojis.length];
      items.push({
        id: `g_${date}_health_${seedIndex}`,
        emoji,
        name: "Nutrient-Dense Harvest",
        type: "healthy",
        category: "nutrition",
        x: 10 + ((seedIndex * 29) % 78),
        y: 12 + ((seedIndex * 37) % 72),
        scale: 1.1 + ((seedIndex % 3) * 0.1),
        rotation: (seedIndex * 13) % 25 - 12,
        createdAt: log.updatedAt || date,
        sourceDate: date,
      });
      seedIndex++;
    }

    // 2. Sleep / Flora Growth
    if (log.sleepHours >= 7.0) {
      const floraEmojis = ["🌿", "🌻", "🌸", "🌳", "🍀", "🪴"];
      const emoji = floraEmojis[seedIndex % floraEmojis.length];
      items.push({
        id: `g_${date}_sleep_${seedIndex}`,
        emoji,
        name: "Deep REM Blossom",
        type: "healthy",
        category: "sleep",
        x: 12 + ((seedIndex * 41) % 76),
        y: 16 + ((seedIndex * 23) % 68),
        scale: 1.2,
        rotation: (seedIndex * 17) % 20 - 10,
        createdAt: log.updatedAt || date,
        sourceDate: date,
      });
      seedIndex++;
    }

    // 3. Movement / Vitality Sprites
    if ((log.steps || 0) >= 6000 || (log.workoutMinutes || 0) >= 30) {
      const actionEmojis = ["🏃‍♂️", "⚡", "🚴", "🧘", "💪", "🧗"];
      const emoji = actionEmojis[seedIndex % actionEmojis.length];
      items.push({
        id: `g_${date}_action_${seedIndex}`,
        emoji,
        name: "Kinetic Vitality Sprite",
        type: "healthy",
        category: "activity",
        x: 15 + ((seedIndex * 33) % 70),
        y: 18 + ((seedIndex * 31) % 66),
        scale: 1.15,
        rotation: (seedIndex * 7) % 15 - 7,
        createdAt: log.updatedAt || date,
        sourceDate: date,
      });
      seedIndex++;
    }

    // 4. Hydration Bloom
    if ((log.waterLiters || 0) >= 2.0) {
      const waterEmojis = ["💧", "🌊", "🫧", "💎"];
      const emoji = waterEmojis[seedIndex % waterEmojis.length];
      items.push({
        id: `g_${date}_water_${seedIndex}`,
        emoji,
        name: "Hydration Dewdrop",
        type: "healthy",
        category: "hydration",
        x: 14 + ((seedIndex * 35) % 72),
        y: 20 + ((seedIndex * 27) % 64),
        scale: 1.1,
        rotation: (seedIndex * 9) % 16 - 8,
        createdAt: log.updatedAt || date,
        sourceDate: date,
      });
      seedIndex++;
    }

    // 5. Bad Habits / Weeds / Junk Food
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
        createdAt: log.updatedAt || date,
        sourceDate: date,
      });
      seedIndex++;
    }

    // Sleep Deficit Fatigue Weed (Only when sleep was logged and <6.0h)
    if (log.sleepHours > 0 && log.sleepHours < 6.0) {
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
        createdAt: log.updatedAt || date,
        sourceDate: date,
      });
      seedIndex++;
    }

    if (log.ateOutside && log.calories > 0 && log.healthyEatingScore <= 5) {
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
        createdAt: log.updatedAt || date,
        sourceDate: date,
      });
      seedIndex++;
    }
  });

  return items;
}
