export function formatTimestamp(timestamp: bigint): string {
  const nanoseconds = Number(timestamp);
  const milliseconds = nanoseconds / 1_000_000;
  const date = new Date(milliseconds);
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatOrderId(id: bigint): string {
  return id.toString().padStart(6, '0');
}

export function formatPKR(amount: number): string {
  return `PKR ${amount}`;
}

export function formatBalance(balance: bigint): string {
  return Number(balance).toLocaleString();
}
