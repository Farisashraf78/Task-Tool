/*
  Warnings:

  - Added the required column `entityId` to the `ActivityLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entityType` to the `ActivityLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "projectId" TEXT;

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "dueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "creatorId" TEXT NOT NULL,
    CONSTRAINT "Project_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ProjectAssignees" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProjectAssignees_A_fkey" FOREIGN KEY ("A") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProjectAssignees_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "dueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "creatorId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "projectId" TEXT,
    CONSTRAINT "Task_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("assigneeId", "createdAt", "creatorId", "description", "dueDate", "id", "priority", "status", "title", "updatedAt") SELECT "assigneeId", "createdAt", "creatorId", "description", "dueDate", "id", "priority", "status", "title", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE TABLE "new_ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT,
    "field" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskId" TEXT,
    "projectId" TEXT,
    CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActivityLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ActivityLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ActivityLog" ("action", "createdAt", "field", "id", "newValue", "oldValue", "taskId", "userId", "entityType", "entityId") 
SELECT "action", "createdAt", "field", "id", "newValue", "oldValue", "taskId", "userId", 'TASK', "taskId" 
FROM "ActivityLog";
DROP TABLE "ActivityLog";
ALTER TABLE "new_ActivityLog" RENAME TO "ActivityLog";
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");
CREATE INDEX "ActivityLog_taskId_idx" ON "ActivityLog"("taskId");
CREATE INDEX "ActivityLog_projectId_idx" ON "ActivityLog"("projectId");
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectAssignees_AB_unique" ON "_ProjectAssignees"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectAssignees_B_index" ON "_ProjectAssignees"("B");
