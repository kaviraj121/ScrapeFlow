import { handleCheckoutSessionCompleted } from "@/lib/stripe/handleCheckoutSessionCompleted";
import { stripe } from "@/lib/stripe/stripe";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.arrayBuffer(); // Read raw body as a buffer
  const signature = request.headers.get("stripe-signature") as string;

  try {
    const event = stripe.webhooks.constructEvent(
      Buffer.from(body), // Convert buffer to string
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      default:
        break;
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return new NextResponse("Webhook error", { status: 400 });
  }
}
