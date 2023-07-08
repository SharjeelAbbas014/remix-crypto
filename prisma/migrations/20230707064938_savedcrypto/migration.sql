/*
  Warnings:

  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Note";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SavedCrypto" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "id" TEXT NOT NULL,
    "priceUsd" REAL NOT NULL,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "volumeUsd24Hr" REAL NOT NULL,
    "changePercent24Hr" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "SavedCrypto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
