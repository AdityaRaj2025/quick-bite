import { db } from "../src/db/client";
import {
  restaurants,
  tables,
  categories,
  items,
  optionGroups,
  options,
} from "../src/db/schema";

async function main() {
  const [r] = await db
    .insert(restaurants)
    .values({ name: "Pilot Restaurant", localeDefault: "ja" })
    .returning();
  const tableCodes = ["T01", "T02", "T03"];
  for (const code of tableCodes) {
    await db
      .insert(tables)
      .values({ restaurantId: r.id, code, displayName: code })
      .onConflictDoNothing();
  }

  const [cat] = await db
    .insert(categories)
    .values({
      restaurantId: r.id,
      nameI18n: { en: "Popular", ja: "人気" },
      sortOrder: 0,
    })
    .returning();
  await db.insert(items).values([
    {
      restaurantId: r.id,
      categoryId: cat.id,
      nameI18n: { en: "Chicken Curry", ja: "チキンカレー" },
      priceJpy: 900,
      isActive: true,
      sortOrder: 0,
    },
    {
      restaurantId: r.id,
      categoryId: cat.id,
      nameI18n: { en: "Naan", ja: "ナン" },
      priceJpy: 300,
      isActive: true,
      sortOrder: 1,
    },
  ]);

  const [grp] = await db
    .insert(optionGroups)
    .values({
      restaurantId: r.id,
      nameI18n: { en: "Spice", ja: "辛さ" },
      minSelect: 1,
      maxSelect: 1,
    })
    .returning();
  await db.insert(options).values([
    { groupId: grp.id, nameI18n: { en: "Mild", ja: "甘口" }, sortOrder: 0 },
    { groupId: grp.id, nameI18n: { en: "Medium", ja: "中辛" }, sortOrder: 1 },
    { groupId: grp.id, nameI18n: { en: "Hot", ja: "辛口" }, sortOrder: 2 },
  ]);

  console.log("Seed completed:", r.id);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
