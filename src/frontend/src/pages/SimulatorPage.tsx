import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { clearPendingBoosts, getPendingBoosts } from "@/lib/pendingBoosts";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  ChevronRight,
  Eye,
  Gauge,
  Heart,
  Info,
  Link2,
  MessageCircle,
  RefreshCw,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useReducer, useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type MetricKey = "views" | "likes" | "comments" | "followers";

interface VideoMetrics {
  views: number;
  likes: number;
  comments: number;
  followers: number;
}

interface VideoStore {
  [videoId: string]: VideoMetrics;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "ADD"; videoId: string; metric: MetricKey; amount: number }
  | { type: "ENSURE"; videoId: string; isDefault?: boolean };

const DEFAULT_VIDEO_ID = "default-video";

const DEFAULT_METRICS: VideoMetrics = {
  views: 1000,
  likes: 100,
  comments: 10,
  followers: 5000,
};

const NEW_VIDEO_METRICS: VideoMetrics = {
  views: 100,
  likes: 10,
  comments: 1,
  followers: 100,
};

function videosReducer(state: VideoStore, action: Action): VideoStore {
  switch (action.type) {
    case "ENSURE":
      if (state[action.videoId]) return state;
      return {
        ...state,
        [action.videoId]: action.isDefault
          ? DEFAULT_METRICS
          : { ...NEW_VIDEO_METRICS },
      };
    case "ADD": {
      const current = state[action.videoId];
      if (!current) return state;
      return {
        ...state,
        [action.videoId]: {
          ...current,
          [action.metric]: Math.max(0, current[action.metric] + action.amount),
        },
      };
    }
    default:
      return state;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseVideoId(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return DEFAULT_VIDEO_ID;
  if (trimmed.includes("/video/")) {
    const segment = trimmed.split("/video/")[1];
    const id = segment.split("?")[0].split("/")[0];
    if (id) return id;
  }
  return (
    trimmed.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32) || DEFAULT_VIDEO_ID
  );
}

function fmt(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toLocaleString();
}

// ─── Metric card config ───────────────────────────────────────────────────────

const METRIC_CONFIG: {
  key: MetricKey;
  label: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  glowClass: string;
  btnClass: string;
}[] = [
  {
    key: "views",
    label: "Views",
    icon: Eye,
    colorClass: "text-sim-blue",
    bgClass: "bg-sim-blue/10",
    borderClass: "border-sim-blue/20",
    glowClass: "metric-glow-blue",
    btnClass:
      "bg-sim-blue/15 hover:bg-sim-blue/25 text-sim-blue border-sim-blue/30 hover:border-sim-blue/50",
  },
  {
    key: "likes",
    label: "Likes",
    icon: Heart,
    colorClass: "text-sim-pink",
    bgClass: "bg-sim-pink/10",
    borderClass: "border-sim-pink/20",
    glowClass: "metric-glow-pink",
    btnClass:
      "bg-sim-pink/15 hover:bg-sim-pink/25 text-sim-pink border-sim-pink/30 hover:border-sim-pink/50",
  },
  {
    key: "comments",
    label: "Comments",
    icon: MessageCircle,
    colorClass: "text-sim-yellow",
    bgClass: "bg-sim-yellow/10",
    borderClass: "border-sim-yellow/20",
    glowClass: "metric-glow-yellow",
    btnClass:
      "bg-sim-yellow/15 hover:bg-sim-yellow/25 text-sim-yellow border-sim-yellow/30 hover:border-sim-yellow/50",
  },
  {
    key: "followers",
    label: "Followers",
    icon: Users,
    colorClass: "text-sim-green",
    bgClass: "bg-sim-green/10",
    borderClass: "border-sim-green/20",
    glowClass: "metric-glow-green",
    btnClass:
      "bg-sim-green/15 hover:bg-sim-green/25 text-sim-green border-sim-green/30 hover:border-sim-green/50",
  },
];

const BULK_BUTTONS: {
  key: MetricKey;
  label: string;
  btnClass: string;
}[] = [
  {
    key: "views",
    label: "Boost Views",
    btnClass:
      "bg-sim-blue/15 hover:bg-sim-blue/30 text-sim-blue border border-sim-blue/30 hover:border-sim-blue/60",
  },
  {
    key: "likes",
    label: "Boost Likes",
    btnClass:
      "bg-sim-pink/15 hover:bg-sim-pink/30 text-sim-pink border border-sim-pink/30 hover:border-sim-pink/60",
  },
  {
    key: "comments",
    label: "Boost Comments",
    btnClass:
      "bg-sim-yellow/15 hover:bg-sim-yellow/30 text-sim-yellow border border-sim-yellow/30 hover:border-sim-yellow/60",
  },
  {
    key: "followers",
    label: "Boost Followers",
    btnClass:
      "bg-sim-green/15 hover:bg-sim-green/30 text-sim-green border border-sim-green/30 hover:border-sim-green/60",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SimulatorPage() {
  const [urlInput, setUrlInput] = useState("");
  const [currentVideoId, setCurrentVideoId] = useState(DEFAULT_VIDEO_ID);
  const [bulkAmount, setBulkAmount] = useState(1000);
  const [activeNav, setActiveNav] = useState("boost");

  const [videos, dispatch] = useReducer(videosReducer, {
    [DEFAULT_VIDEO_ID]: { ...DEFAULT_METRICS },
  });

  // Apply any pending boosts from completed orders on mount
  useEffect(() => {
    const pendingBoosts = getPendingBoosts();
    if (pendingBoosts.length === 0) return;

    let lastVideoId = DEFAULT_VIDEO_ID;
    let lastUrl = "";

    for (const boost of pendingBoosts) {
      const videoId = parseVideoId(boost.videoUrl);
      dispatch({
        type: "ENSURE",
        videoId,
        isDefault: videoId === DEFAULT_VIDEO_ID,
      });
      if (boost.views)
        dispatch({
          type: "ADD",
          videoId,
          metric: "views",
          amount: boost.views,
        });
      if (boost.likes)
        dispatch({
          type: "ADD",
          videoId,
          metric: "likes",
          amount: boost.likes,
        });
      if (boost.comments)
        dispatch({
          type: "ADD",
          videoId,
          metric: "comments",
          amount: boost.comments,
        });
      if (boost.followers)
        dispatch({
          type: "ADD",
          videoId,
          metric: "followers",
          amount: boost.followers,
        });
      lastVideoId = videoId;
      lastUrl = boost.videoUrl;
    }

    setCurrentVideoId(lastVideoId);
    setUrlInput(lastUrl);
    clearPendingBoosts();

    toast.success("Boost applied! 🚀", {
      description:
        "Your video stats have been automatically increased from your order.",
    });
  }, []);

  const metrics = videos[currentVideoId] ?? DEFAULT_METRICS;

  const handleAnalyze = useCallback(() => {
    const id = parseVideoId(urlInput);
    dispatch({
      type: "ENSURE",
      videoId: id,
      isDefault: id === DEFAULT_VIDEO_ID,
    });
    setCurrentVideoId(id);
  }, [urlInput]);

  const handleAdd = useCallback(
    (metric: MetricKey) => {
      dispatch({ type: "ADD", videoId: currentVideoId, metric, amount: 100 });
    },
    [currentVideoId],
  );

  const handleBulk = useCallback(
    (metric: MetricKey) => {
      dispatch({
        type: "ADD",
        videoId: currentVideoId,
        metric,
        amount: bulkAmount,
      });
    },
    [currentVideoId, bulkAmount],
  );

  const isDefaultVideo = currentVideoId === DEFAULT_VIDEO_ID;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Nav Bar ── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <span className="text-base font-bold text-foreground hidden sm:block">
                TikTok Engagement Simulator
              </span>
              <span className="text-base font-bold text-foreground sm:hidden">
                TikTok Sim
              </span>
            </div>

            {/* Center nav */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { id: "dashboard", label: "Dashboard", icon: BarChart3 },
                { id: "analytics", label: "Analytics", icon: TrendingUp },
                { id: "boost", label: "Boost Tool", icon: Zap },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  data-ocid={`simulator.${id}.tab`}
                  onClick={() => setActiveNav(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeNav === id
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Right user chip */}
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="hidden sm:flex gap-1.5 border-border text-muted-foreground px-3 py-1.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-sim-green animate-pulse" />
                <span className="text-xs font-medium">Simulator Active</span>
              </Badge>
              <Link to="/">
                <Button
                  data-ocid="simulator.dashboard.link"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  Back
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* ── Hero Header ── */}
        <section className="text-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight gradient-headline leading-tight pb-1"
          >
            TikTok Engagement
            <br />
            Simulator
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto"
          >
            Paste a TikTok video link, view analytics, and simulate engagement
            boosts — all in real time.
          </motion.p>
          {/* Auto-boost info banner */}
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm text-primary mx-auto"
          >
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            After placing an order, your video stats will automatically increase
            here within 1–2 minutes.
          </motion.div>
        </section>

        {/* ── Hero Input Panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="glass-panel rounded-2xl p-6 sm:p-8 space-y-4"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link2 className="w-4 h-4" />
            <span>Paste a TikTok video URL to begin tracking</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                data-ocid="simulator.url.input"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                placeholder="https://www.tiktok.com/@user/video/1234567890"
                className="bg-background/60 border-border text-foreground placeholder:text-muted-foreground/50 h-12 pl-4 pr-4 rounded-xl text-sm"
              />
            </div>
            <Button
              data-ocid="simulator.analyze.primary_button"
              onClick={handleAnalyze}
              className="h-12 px-8 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] gap-2"
            >
              <Gauge className="w-4 h-4" />
              Analyze
            </Button>
          </div>

          {/* Video ID badge */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground">
              Current Video ID:
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentVideoId}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.2 }}
              >
                <Badge
                  variant="outline"
                  className="font-mono text-xs border-primary/40 text-primary bg-primary/10"
                >
                  {isDefaultVideo ? "default-video" : currentVideoId}
                </Badge>
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Metric Cards ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Engagement Metrics
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {METRIC_CONFIG.map(
              (
                {
                  key,
                  label,
                  icon: Icon,
                  colorClass,
                  bgClass,
                  borderClass,
                  glowClass,
                  btnClass,
                },
                i,
              ) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * i }}
                  className={`relative rounded-2xl border ${borderClass} bg-card p-5 flex flex-col gap-3 ${glowClass} overflow-hidden group`}
                >
                  {/* Background accent circle */}
                  <div
                    className={`absolute -top-4 -right-4 w-20 h-20 rounded-full ${bgClass} blur-2xl opacity-60 group-hover:opacity-90 transition-opacity`}
                  />

                  {/* Icon + Label */}
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-xs font-medium text-muted-foreground">
                      {label}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-lg ${bgClass} flex items-center justify-center`}
                    >
                      <Icon className={`w-4 h-4 ${colorClass}`} />
                    </div>
                  </div>

                  {/* Count */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${currentVideoId}-${key}-${metrics[key]}`}
                      initial={{ opacity: 0.5, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                      data-ocid={`simulator.${key}.card`}
                      className={`text-3xl font-extrabold ${colorClass} tabular-nums relative z-10`}
                    >
                      {fmt(metrics[key])}
                    </motion.div>
                  </AnimatePresence>

                  {/* Add button */}
                  <Button
                    data-ocid={`simulator.${key}.button`}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAdd(key)}
                    className={`h-8 text-xs font-semibold border rounded-lg transition-all ${btnClass} relative z-10`}
                  >
                    + Add 100
                  </Button>
                </motion.div>
              ),
            )}
          </div>
        </section>

        {/* ── Boost Controls ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Boost Controls
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Individual boosts */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-2xl border border-border bg-card p-6 space-y-4"
            >
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Individual Boosts
                </h3>
                <p className="text-xs text-muted-foreground">
                  Add +100 to any single metric instantly
                </p>
              </div>
              <Separator className="bg-border/50" />
              <div className="grid grid-cols-2 gap-3">
                {METRIC_CONFIG.map(({ key, label, icon: Icon, btnClass }) => (
                  <Button
                    key={key}
                    data-ocid={`simulator.individual.${key}.button`}
                    variant="outline"
                    onClick={() => handleAdd(key)}
                    className={`h-11 gap-2 font-medium border rounded-xl transition-all ${btnClass}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    +100 {label}
                  </Button>
                ))}
              </div>
            </motion.div>

            {/* Bulk boost */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="rounded-2xl border border-border bg-card p-6 space-y-4"
            >
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Bulk Boost
                </h3>
                <p className="text-xs text-muted-foreground">
                  Select amount and apply to any metric at once
                </p>
              </div>
              <Separator className="bg-border/50" />

              {/* Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Boost Amount
                  </span>
                  <span
                    data-ocid="simulator.bulk.amount.card"
                    className="text-lg font-bold text-primary tabular-nums"
                  >
                    {bulkAmount.toLocaleString()}
                  </span>
                </div>
                <Slider
                  data-ocid="simulator.bulk.amount.input"
                  min={100}
                  max={10000}
                  step={100}
                  value={[bulkAmount]}
                  onValueChange={([v]) => setBulkAmount(v)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>100</span>
                  <span>10,000</span>
                </div>
              </div>

              {/* Bulk buttons */}
              <div className="grid grid-cols-2 gap-3">
                {BULK_BUTTONS.map(({ key, label, btnClass }) => (
                  <Button
                    key={key}
                    data-ocid={`simulator.bulk.${key}.button`}
                    variant="outline"
                    onClick={() => handleBulk(key)}
                    className={`h-11 gap-2 text-sm font-semibold rounded-xl transition-all ${btnClass}`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {label}
                  </Button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="pt-4 pb-8 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with{" "}
            <span className="text-sim-pink">♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
