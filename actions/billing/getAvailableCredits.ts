"use server"
import { getAppUrl } from "@/lib/helper/appUrl";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe/stripe";
import { getCreditsPack, PackId } from "@/type/billing";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function getAvailableCredits() {
    const { userId } = await auth();
  
    if (!userId) {
      throw new Error("Unauthenticated");
    }
  
    const balance = await prisma.userBalance.findUnique({
      where: {
        userId,
      },
    });
  
    if (!balance) return -1;
  
    return balance.credits;
  }
  export async function setupUser() {
    const { userId } = await auth();
  
    if (!userId) {
      throw new Error("Unauthenticated");
    }
  
    const userBalance = await prisma.userBalance.findUnique({
      where: {
        userId,
      },
    });
  
    if (!userBalance) {
      await prisma.userBalance.create({
        data: {
          userId,
          credits: 200,
        },
      });
    }
  
    redirect("/home");
  }
  
  export async function purchaseCredits(packId: PackId) {
    const { userId } = await auth();
  
    if (!userId) {
      throw new Error("Unauthenticated");
    }
  
    const seletedPack = getCreditsPack(packId);
  
    if (!seletedPack) {
      throw new Error("Inavlid package");
    }
  
    const priceId = seletedPack?.priceId;
  
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      invoice_creation: {
        enabled: true,
      },
      success_url: getAppUrl("billing"),
      cancel_url: getAppUrl("billing"),
  
      // adding custom details to session info via metadata
      metadata: {
        userId,
        packId,
      },
      line_items: [
        {
          quantity: 1,
          price: priceId, // here price refer to priceId from stripe
        },
      ],
    });
  
    if (!session.url) {
      throw new Error("Cannot create stripe session");
    }
  
    redirect(session.url);
  }
  
  export async function getUserPurchases() {
    const { userId } = await auth();
  
    if (!userId) {
      throw new Error("Unauthenticated");
    }
  
    return await prisma.userPurchase.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: "desc",
      },
    });
  }
  
  export async function downloadInvoice(id: string) {
    const { userId } = await auth();
  
    if (!userId) {
      throw new Error("Unauthenticated");
    }
  
    const purchase = await prisma.userPurchase.findUnique({
      where: {
        userId,
        id,
      },
    });
  
    if (!purchase) {
      throw new Error("Bad request");
    }
  
    const session = await stripe.checkout.sessions.retrieve(purchase.stripeId);
    if (!session.invoice) {
      throw new Error("Invoice not found");
    }
  
    const invoice = await stripe.invoices.retrieve(session.invoice as string);
    return invoice.hosted_invoice_url;
  }