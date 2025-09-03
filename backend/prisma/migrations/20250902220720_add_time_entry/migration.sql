-- CreateTable
CREATE TABLE "TimeEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "checkIn" TEXT,
    "checkOut" TEXT,
    "totalHours" REAL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employeeId" TEXT NOT NULL,
    CONSTRAINT "TimeEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
