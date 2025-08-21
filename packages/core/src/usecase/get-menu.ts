import { MenuRepositoryPort } from "../application/ports";

export async function getMenuUseCase(
  repo: MenuRepositoryPort,
  restaurantId: string
) {
  const [categories, items] = await Promise.all([
    repo.getCategories(restaurantId),
    repo.getItems(restaurantId),
  ]);
  return { categories, items };
}
