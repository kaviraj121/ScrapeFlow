"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getWorkflowsForUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthenticated");
  }
  return prisma.workFlow.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}