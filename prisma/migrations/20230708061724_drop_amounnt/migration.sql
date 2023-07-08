/*
  Warnings:

  - You are about to drop the column `amount` on the `SavedCrypto` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SavedCrypto" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "id" TEXT NOT NULL,
    "priceUsd" REAL NOT NULL,
    "name" TEXT NOT NULL,
    "volumeUsd24Hr" REAL NOT NULL,
    "changePercent24Hr" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "SavedCrypto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SavedCrypto" ("changePercent24Hr", "createdAt", "id", "name", "priceUsd", "uid", "updatedAt", "userId", "volumeUsd24Hr") SELECT "changePercent24Hr", "createdAt", "id", "name", "priceUsd", "uid", "updatedAt", "userId", "volumeUsd24Hr" FROM "SavedCrypto";
DROP TABLE "SavedCrypto";
ALTER TABLE "new_SavedCrypto" RENAME TO "SavedCrypto";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
