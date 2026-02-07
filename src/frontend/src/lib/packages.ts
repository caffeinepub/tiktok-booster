export interface Package {
  id: string;
  name: string;
  price: number; // Changed to number for PKR
  description: string;
  benefits: string[];
  icon: string;
  popular?: boolean;
}

export const packages: Package[] = [
  {
    id: 'Mini',
    name: 'Mini',
    price: 25,
    description: '2.5K Views',
    benefits: ['2,500 Views', '250 Likes', '50 Shares', '5–10 min delivery'],
    icon: '🌟',
  },
  {
    id: 'Starter',
    name: 'Starter',
    price: 50,
    description: '5K Views',
    benefits: ['5,000 Views', '500 Likes', '100 Shares', '5–10 min delivery'],
    icon: '🔥',
  },
  {
    id: 'Pro',
    name: 'Pro',
    price: 100,
    description: '10K Views',
    benefits: ['10,000 Views', '1,000 Likes', '200 Shares', '5–10 min delivery'],
    icon: '⭐',
    popular: true,
  },
  {
    id: 'Premium',
    name: 'Premium',
    price: 200,
    description: '25K Views',
    benefits: ['25,000 Views', '2,500 Likes', '500 Shares', '5–10 min delivery'],
    icon: '💎',
  },
  {
    id: 'Elite',
    name: 'Elite',
    price: 350,
    description: '50K Views',
    benefits: ['50,000 Views', '5,000 Likes', '1,000 Shares', '5–10 min delivery'],
    icon: '👑',
  },
  {
    id: 'Ultimate',
    name: 'Ultimate',
    price: 600,
    description: '100K Views',
    benefits: ['100,000 Views', '10,000 Likes', '2,000 Shares', '5–10 min delivery'],
    icon: '🚀',
  },
];
