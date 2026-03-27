import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, MessageCircle, Shield } from "lucide-react";

export default function CreditsPage() {
  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Button asChild variant="ghost" className="mb-8">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <Card className="border-2">
            <CardHeader className="text-center space-y-4">
              <div className="text-6xl">👨‍💻</div>
              <CardTitle className="text-4xl">Credits</CardTitle>
              <CardDescription className="text-lg">
                About TikTok Booster Pro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-center">
                  TikTok Booster Pro
                </h3>
                <p className="text-center text-muted-foreground text-lg">
                  Pentest & Marketing Tool
                </p>
              </div>

              <div className="grid gap-6">
                <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                  <h4 className="font-semibold text-lg">Built by:</h4>
                  <p className="text-muted-foreground">
                    Cybersecurity Pro | HackerAI Assisted
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                  <h4 className="font-semibold text-lg">Features:</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Real-time API</li>
                    <li>• Mobile Responsive</li>
                    <li>• Referral System</li>
                  </ul>
                </div>

                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <h4 className="font-semibold text-lg">Contact:</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">
                        Telegram:{" "}
                        <a
                          href="https://t.me/tiktokboosterpro"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          @tiktokboosterpro
                        </a>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">
                        Email:{" "}
                        <a
                          href="mailto:support@tiktokboost.pro"
                          className="text-primary hover:underline"
                        >
                          support@tiktokboost.pro
                        </a>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-destructive" />
                    <h4 className="font-semibold text-lg text-destructive">
                      Important Notice
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ⚠️ For Educational & Authorized Testing Only | No Real TikTok
                    API
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This tool is designed for educational purposes and
                    authorized penetration testing only. It does not interact
                    with actual TikTok services.
                  </p>
                </div>
              </div>

              <div className="text-center pt-6">
                <Button asChild size="lg">
                  <Link to="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Booster
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
