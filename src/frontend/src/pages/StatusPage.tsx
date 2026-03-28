import AppHeader from "@/components/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetOrderById } from "@/hooks/useOrders";
import { formatOrderId, formatTimestamp } from "@/lib/format";
import { packages } from "@/lib/packages";
import { savePendingBoost } from "@/lib/pendingBoosts";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Clock, Package, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const AUTO_COMPLETE_SECONDS = 90;

// Map package id to boost amounts based on packages.ts benefits
function getBoostForPackage(packageName: string) {
  const pkg = packages.find(
    (p) =>
      p.id.toLowerCase() === packageName.toLowerCase() ||
      p.name.toLowerCase() === packageName.toLowerCase(),
  );

  if (pkg) {
    // Parse views and likes from benefits array
    const viewsBenefit = pkg.benefits.find((b) =>
      b.toLowerCase().includes("view"),
    );
    const likesBenefit = pkg.benefits.find((b) =>
      b.toLowerCase().includes("like"),
    );
    const views = viewsBenefit
      ? Number.parseInt(viewsBenefit.replace(/[^0-9]/g, ""), 10)
      : 1000;
    const likes = likesBenefit
      ? Number.parseInt(likesBenefit.replace(/[^0-9]/g, ""), 10)
      : 100;
    return {
      views,
      likes,
      comments: Math.round(views / 50),
      followers: Math.round(likes / 5),
    };
  }

  // Fallback defaults
  return { views: 5000, likes: 500, comments: 100, followers: 100 };
}

export default function StatusPage() {
  const { id } = useParams({ from: "/status/$id" });
  const { data: order, isLoading, isError } = useGetOrderById(id);
  const queryClient = useQueryClient();

  const [countdown, setCountdown] = useState<number | null>(null);
  const [localCompleted, setLocalCompleted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (localCompleted) return;
    if (!order || order.status !== "pending") {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCountdown(null);
      return;
    }

    // Start countdown display
    setCountdown(AUTO_COMPLETE_SECONDS);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Auto-complete after 90 seconds
    timerRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCountdown(0);

      // Save boost info to localStorage so SimulatorPage can pick it up
      const boost = getBoostForPackage(order.package);
      savePendingBoost({
        videoUrl: order.url,
        ...boost,
      });

      // Mark as completed locally (users can't call updateOrderStatus)
      setLocalCompleted(true);
      queryClient.invalidateQueries({ queryKey: ["order", id] });
    }, AUTO_COMPLETE_SECONDS * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [order, id, queryClient, localCompleted]);

  const effectiveStatus = localCompleted ? "completed" : order?.status;

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

          {isLoading && (
            <Card className="border-2 border-muted">
              <CardHeader className="text-center space-y-4">
                <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          )}

          {!isLoading && (isError || !order) && (
            <Card className="border-2 border-destructive/20">
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-destructive/10 p-4 rounded-full">
                    <AlertCircle className="w-12 h-12 text-destructive" />
                  </div>
                </div>
                <CardTitle className="text-3xl">Order Not Found</CardTitle>
                <CardDescription className="text-base">
                  The order you're looking for doesn't exist or has been
                  removed.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="bg-muted/50 rounded-lg p-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    Order ID:{" "}
                    <span className="font-mono font-semibold">#{id}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    If you believe this is an error, please contact us on
                    Telegram: @tiktokboosterpro
                  </p>
                </div>
                <Button asChild size="lg">
                  <Link to="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Return to Home
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {!isLoading && order && (
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Package className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-3xl">Order Status</CardTitle>
                <CardDescription className="text-base">
                  Track your TikTok boost order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Order ID
                    </span>
                    <Badge variant="outline" className="font-mono text-base">
                      #{formatOrderId(order.orderId)}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <Badge
                      variant={
                        effectiveStatus === "completed"
                          ? "default"
                          : effectiveStatus === "pending"
                            ? "secondary"
                            : effectiveStatus === "cancelled" ||
                                effectiveStatus === "failed"
                              ? "destructive"
                              : "outline"
                      }
                      className="text-base font-semibold"
                    >
                      {effectiveStatus
                        ? effectiveStatus.charAt(0).toUpperCase() +
                          effectiveStatus.slice(1)
                        : "Unknown"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Package
                    </span>
                    <span className="font-semibold">{order.package}</span>
                  </div>

                  <div className="flex justify-between items-start pt-4 border-t border-border">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Video URL
                    </span>
                    <a
                      href={order.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline max-w-xs break-all text-right"
                    >
                      {order.url}
                    </a>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Created
                    </span>
                    <span className="text-sm font-medium">
                      {formatTimestamp(order.createdAt)}
                    </span>
                  </div>
                </div>

                {!localCompleted &&
                  order.status === "pending" &&
                  countdown !== null && (
                    <div
                      className="bg-accent/50 rounded-lg p-4 space-y-3"
                      data-ocid="order.loading_state"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          ⏳ Processing your order...
                        </p>
                        <span className="text-sm font-mono text-muted-foreground">
                          {countdown}s remaining
                        </span>
                      </div>
                      <Progress
                        value={
                          ((AUTO_COMPLETE_SECONDS - countdown) /
                            AUTO_COMPLETE_SECONDS) *
                          100
                        }
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your boost will be activated automatically. Please wait.
                      </p>
                    </div>
                  )}

                {effectiveStatus === "completed" && (
                  <div
                    className="bg-primary/10 rounded-lg p-4 space-y-2"
                    data-ocid="order.success_state"
                  >
                    <p className="text-sm font-medium text-primary">
                      ✓ Your order has been completed successfully!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Visit the{" "}
                      <Link
                        to="/simulator"
                        className="text-primary underline hover:no-underline"
                      >
                        Engagement Simulator
                      </Link>{" "}
                      to see your video stats updated.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
