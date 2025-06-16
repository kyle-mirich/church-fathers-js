-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "workTitle" TEXT NOT NULL,
    "partTitle" TEXT,
    "chapterTitle" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "noteType" TEXT NOT NULL DEFAULT 'GENERAL',
    "selectedText" TEXT,
    "selectionStart" INTEGER,
    "selectionEnd" INTEGER,
    "elementId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "highlights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "noteId" TEXT,
    "workTitle" TEXT NOT NULL,
    "partTitle" TEXT,
    "chapterTitle" TEXT NOT NULL,
    "selectedText" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'YELLOW',
    "selectionStart" INTEGER NOT NULL,
    "selectionEnd" INTEGER NOT NULL,
    "elementId" TEXT,
    "xpath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "highlights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "highlights_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "notes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reading_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "workTitle" TEXT NOT NULL,
    "partTitle" TEXT,
    "chapterTitle" TEXT NOT NULL,
    "scrollPosition" REAL,
    "lastReadAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "reading_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "study_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "totalTime" INTEGER,
    "worksStudied" TEXT NOT NULL DEFAULT '[]',
    "notesCreated" INTEGER NOT NULL DEFAULT 0,
    "highlightsMade" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "study_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_sessionId_key" ON "users"("sessionId");

-- CreateIndex
CREATE INDEX "notes_userId_idx" ON "notes"("userId");

-- CreateIndex
CREATE INDEX "notes_workTitle_chapterTitle_idx" ON "notes"("workTitle", "chapterTitle");

-- CreateIndex
CREATE INDEX "highlights_userId_idx" ON "highlights"("userId");

-- CreateIndex
CREATE INDEX "highlights_workTitle_chapterTitle_idx" ON "highlights"("workTitle", "chapterTitle");

-- CreateIndex
CREATE INDEX "reading_progress_userId_idx" ON "reading_progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "reading_progress_userId_workTitle_chapterTitle_key" ON "reading_progress"("userId", "workTitle", "chapterTitle");

-- CreateIndex
CREATE INDEX "study_sessions_userId_idx" ON "study_sessions"("userId");
