import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { copyToClipboard } from "@/lib/copyToClipboard";
import { Copy, ExternalLink, MessageCircle } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "03481641187";

export default function WhatsAppContactSection() {
  const handleCopy = async () => {
    const success = await copyToClipboard(WHATSAPP_NUMBER);
    if (success) {
      toast.success("WhatsApp number copied to clipboard!");
    } else {
      toast.error("Failed to copy number. Please try again.");
    }
  };

  const handleOpenWhatsApp = () => {
    // Format number for WhatsApp (remove leading 0 and add country code if needed)
    // Assuming Pakistani number, format as +92 followed by number without leading 0
    const formattedNumber = `92${WHATSAPP_NUMBER.slice(1)}`;
    const whatsappUrl = `https://wa.me/${formattedNumber}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
            <SiWhatsapp className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              Connect on WhatsApp
            </CardTitle>
            <CardDescription>Get in touch with us directly</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-muted-foreground" />
            <span className="font-mono text-lg font-semibold">
              {WHATSAPP_NUMBER}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="hover:bg-green-500/10"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        <Button
          onClick={handleOpenWhatsApp}
          className="w-full gap-2 bg-green-500 hover:bg-green-600 text-white"
        >
          <SiWhatsapp className="w-5 h-5" />
          Open WhatsApp Chat
          <ExternalLink className="w-4 h-4 ml-auto" />
        </Button>
      </CardContent>
    </Card>
  );
}
