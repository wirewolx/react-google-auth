-- CreateTable
CREATE TABLE "BotButton" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "responseText" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotButton_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BotButton_projectId_idx" ON "BotButton"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "BotButton_projectId_order_key" ON "BotButton"("projectId", "order");

-- AddForeignKey
ALTER TABLE "BotButton" ADD CONSTRAINT "BotButton_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
