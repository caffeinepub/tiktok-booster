export function formatTimestamp(timestamp: bigint): string {
  const nanoseconds = Number(timestamp);
  const milliseconds = nanoseconds / 1_000_000;
  const date = new Date(milliseconds);

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatOrderId(id: bigint): string {
  return id.toString().padStart(6, "0");
}

export function formatPKR(amount: number): string {
  return `PKR ${amount}`;
}

export function formatBalance(balance: bigint): string {
  return Number(balance).toLocaleString();
}

export function formatRelativeTime(timestamp: bigint): string {
  const nanoseconds = Number(timestamp);
  const milliseconds = nanoseconds / 1_000_000;
  const date = new Date(milliseconds);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatTimestamp(timestamp);
}
