"use client";
import { downloadInvoice } from "@/actions/billing/getAvailableCredits";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

function InvoiceButton({ id }: { id: string }) {
    const mutation = useMutation({
      mutationFn: downloadInvoice,
      onSuccess: (data) => {
        window.open(data as string, "_blank");
      },
      onError: (error: any) => {
        toast.success(error.message || "Something went wrong", { id: "invoice" });
      },
    });
  
    return (
      <Button
        className="text-xs gap-2 text-muted-foreground px-1"
        variant={"ghost"}
        size={"sm"}
        disabled={mutation.isPending}
        onClick={() => {
          mutation.mutate(id);
        }}
      >
        Invoice
        {mutation.isPending && <Loader2Icon className="h-4 w-4 animate-spin" />}
      </Button>
    );
  }
  
  export default InvoiceButton;