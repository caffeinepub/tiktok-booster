import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copyToClipboard } from "@/lib/copyToClipboard";
import { AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface InsufficientBalanceGuidanceProps {
  principalId: string;
}

export default function InsufficientBalanceGuidance({
  principalId,
}: InsufficientBalanceGuidanceProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(principalId);
    if (success) {
      setCopied(true);
      toast.success("Principal ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Failed to copy Principal ID");
    }
  };

  return (
    <Card className="border-2 border-destructive/50 bg-destructive/5">
      <CardHeader>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
          <div>
            <CardTitle className="text-2xl text-destructive">
              Insufficient Balance
            </CardTitle>
            <CardDescription className="text-base mt-2">
              You don't have enough balance to place this order. Please request
              a top-up from an administrator.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTitle className="text-base font-semibold mb-2">
            How to get balance:
          </AlertTitle>
          <AlertDescription className="space-y-2">
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Copy your Principal ID below</li>
              <li>Contact an administrator</li>
              <li>Request them to add funds to your account</li>
              <li>Once funds are added, you can place your order</li>
            </ol>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="principal-id-input" className="text-sm font-medium">
            Your Principal ID:
          </Label>
          <div className="flex gap-2">
            <Input
              id="principal-id-input"
              value={principalId}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              onClick={handleCopy}
              variant="outline"
              size="icon"
              className="flex-shrink-0"
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this ID with an administrator to receive funds
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
