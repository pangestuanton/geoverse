import { badges as staticBadges } from "@/data/badges";
import type { Badge, BadgeDB, UserBadge } from "@/types";

export type BadgeCardData = Pick<Badge, "id" | "name" | "description" | "icon" | "requirement"> & {
  slug?: string;
  category?: string;
};

const staticBadgeBySlug = new Map(staticBadges.map((badge) => [badge.id, badge]));

export function toBadgeCardData(badge: BadgeDB): BadgeCardData {
  const staticBadge = staticBadgeBySlug.get(badge.slug);

  return {
    id: badge.id,
    slug: badge.slug,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    category: badge.category,
    requirement: staticBadge?.requirement || "Badge khusus dari admin",
  };
}

export function getEarnedBadgeCards(userBadges: UserBadge[]): BadgeCardData[] {
  const seen = new Set<string>();
  const cards: BadgeCardData[] = [];

  for (const userBadge of userBadges) {
    if (!userBadge.unlocked) continue;

    if (userBadge.badge) {
      const card = toBadgeCardData(userBadge.badge);
      if (!seen.has(card.id)) {
        cards.push(card);
        seen.add(card.id);
      }
      continue;
    }

    const fallbackSlug = userBadge.badgeSlug || userBadge.badgeId;
    const staticBadge = staticBadgeBySlug.get(fallbackSlug);
    if (staticBadge && !seen.has(staticBadge.id)) {
      cards.push(staticBadge);
      seen.add(staticBadge.id);
    }
  }

  return cards;
}

export function getStaticBadgeBySlug(slug: string) {
  return staticBadgeBySlug.get(slug);
}
