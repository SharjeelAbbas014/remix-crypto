import type { User, SavedCrypto } from "@prisma/client";

import { prisma } from "~/db.server";

export function getUserSavedCrypto({ userId }: { userId: User["id"] }) {
  return prisma.savedCrypto.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      priceUsd: true,
      name: true,
      volumeUsd24Hr: true,
      changePercent24Hr: true,
    },
  });
}

export function saveCrypto({
  id,
  priceUsd,
  name,
  volumeUsd24Hr,
  changePercent24Hr,
  userId,
}: Pick<
  SavedCrypto,
  "id" | "priceUsd" | "name" | "volumeUsd24Hr" | "changePercent24Hr"
> & {
  userId: User["id"];
}) {
  return prisma.savedCrypto.create({
    data: {
      id,
      priceUsd,
      name,
      volumeUsd24Hr,
      changePercent24Hr,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}
export function unSaveCrypto({
  id,
  userId,
}: Pick<SavedCrypto, "id"> & { userId: User["id"] }) {
  return prisma.savedCrypto.deleteMany({
    where: { id, userId },
  });
}
