/**
 * Card Type Field Structure Mappers
 * 
 * Maps card types to their field structures for storeCard pass type
 */

export interface CardData {
  // Common fields
  cardTitle?: string;
  businessName?: string;
  description?: string;
  subtitle?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  
  // Asset URLs from template design
  logo?: string;
  icon?: string;
  strip?: string;
  
  // Stamp card fields
  stampCount?: number;
  stampThreshold?: number;
  rewardsCollected?: number;
  
  // Points card fields
  pointsBalance?: number;
  pointsRate?: number;
  nextRewardThreshold?: number;
  lifetimePoints?: number;
  tier?: string;
  
  // Discount card fields
  discountPercentage?: number;
  discountTier?: string;
  visits?: number;
  
  // Cashback card fields
  cashbackPercentage?: number;
  cashbackEarned?: number;
  cashbackStatus?: string;
  
  // Membership card fields
  expirationDate?: string;
  classesPerMonth?: number;
  membershipType?: string;
  availableLimits?: number;
  
  // Coupon card fields
  offerDescription?: string;
  
  // Reward card fields
  currentReward?: string;
  
  // Gift card fields
  balance?: number;
  cardNumber?: string;
  tagline?: string;
}

export interface StoreCardFields {
  headerFields: Array<{
    key: string;
    label: string;
    value: string | number;
    textAlignment?: string;
  }>;
  primaryFields: Array<{
    key: string;
    label: string;
    value: string | number;
    textAlignment?: string;
  }>;
  secondaryFields?: Array<{
    key: string;
    label: string;
    value: string | number;
    textAlignment?: string;
  }>;
  auxiliaryFields?: Array<{
    key: string;
    label: string;
    value: string | number;
    textAlignment?: string;
  }>;
  backFields?: Array<{
    key: string;
    label: string;
    value: string;
  }>;
}

/**
 * Generate storeCard field structure for Stamp Card
 */
export function mapStampCardFields(data: CardData): StoreCardFields {
  const stampCount = data.stampCount || 0;
  const threshold = data.stampThreshold || 10;
  const rewardsCollected = data.rewardsCollected || 0;
  
  return {
    headerFields: [
      {
        key: 'stamps',
        label: 'STAMPS',
        value: `${stampCount}/${threshold}`,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    primaryFields: [
      {
        key: 'reward',
        label: 'REWARD STATUS',
        value: stampCount >= threshold ? 'FREE REWARD!' : 'Keep collecting!',
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    secondaryFields: [
      {
        key: 'progress',
        label: 'STAMPS UNTIL REWARD',
        value: `${Math.max(0, threshold - stampCount)} stamps`,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    auxiliaryFields: [
      {
        key: 'collected',
        label: 'REWARDS COLLECTED',
        value: `${rewardsCollected} rewards`,
        textAlignment: 'PKTextAlignmentLeft'
      },
      {
        key: 'status',
        label: 'STATUS',
        value: 'Active',
        textAlignment: 'PKTextAlignmentRight'
      }
    ],
    backFields: [
      {
        key: 'terms',
        label: 'TERMS AND CONDITIONS',
        value: data.description || 'Collect stamps to earn rewards. Terms apply.'
      }
    ]
  };
}

/**
 * Generate storeCard field structure for Points Card
 */
export function mapPointsCardFields(data: CardData): StoreCardFields {
  const pointsBalance = data.pointsBalance || 0;
  const pointsRate = data.pointsRate || 1;
  const nextThreshold = data.nextRewardThreshold || 100;
  const lifetimePoints = data.lifetimePoints || pointsBalance;
  const tier = data.tier || 'Bronze';
  
  return {
    headerFields: [
      {
        key: 'points',
        label: 'POINTS',
        value: pointsBalance,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    primaryFields: [
      {
        key: 'earn',
        label: 'Earn rewards',
        value: `£1 = ${pointsRate} points`,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    secondaryFields: [
      {
        key: 'next',
        label: 'NEXT REWARD',
        value: `After ${nextThreshold} points`,
        textAlignment: 'PKTextAlignmentLeft'
      },
      {
        key: 'current',
        label: 'CURRENT REWARD',
        value: pointsBalance >= nextThreshold ? 'Available!' : 'Keep earning',
        textAlignment: 'PKTextAlignmentRight'
      }
    ],
    auxiliaryFields: [
      {
        key: 'tier',
        label: 'TIER',
        value: tier,
        textAlignment: 'PKTextAlignmentLeft'
      },
      {
        key: 'lifetime',
        label: 'LIFETIME POINTS',
        value: lifetimePoints,
        textAlignment: 'PKTextAlignmentRight'
      }
    ],
    backFields: [
      {
        key: 'terms',
        label: 'TERMS AND CONDITIONS',
        value: data.description || 'Earn points with every purchase. Points can be redeemed for rewards.'
      }
    ]
  };
}

/**
 * Generate storeCard field structure for Discount Card
 */
export function mapDiscountCardFields(data: CardData): StoreCardFields {
  const discountPercentage = data.discountPercentage || 0;
  const discountTier = data.discountTier || 'Bronze';
  const visits = data.visits || 0;
  
  return {
    headerFields: [
      {
        key: 'discount',
        label: 'DISCOUNT',
        value: `${discountPercentage}%`,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    primaryFields: [
      {
        key: 'status',
        label: 'DISCOUNT STATUS',
        value: discountTier,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    auxiliaryFields: [
      {
        key: 'visits',
        label: 'VISITS',
        value: visits,
        textAlignment: 'PKTextAlignmentLeft'
      },
      {
        key: 'tier',
        label: 'TIER',
        value: discountTier,
        textAlignment: 'PKTextAlignmentRight'
      }
    ],
    backFields: [
      {
        key: 'terms',
        label: 'TERMS AND CONDITIONS',
        value: data.description || 'Discount increases with more visits. Terms apply.'
      }
    ]
  };
}

/**
 * Generate storeCard field structure for Cashback Card
 */
export function mapCashbackCardFields(data: CardData): StoreCardFields {
  const pointsBalance = data.pointsBalance || 0;
  const cashbackPercentage = data.cashbackPercentage || 0;
  const cashbackEarned = data.cashbackEarned || 0;
  const cashbackStatus = data.cashbackStatus || 'Bronze';
  
  return {
    headerFields: [
      {
        key: 'points',
        label: 'POINTS',
        value: pointsBalance.toFixed(2),
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    primaryFields: [
      {
        key: 'cashback',
        label: 'CASHBACK PERCENTAGE',
        value: `${cashbackPercentage}%`,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    secondaryFields: [
      {
        key: 'earned',
        label: 'CASHBACK EARNED',
        value: `£${cashbackEarned.toFixed(2)}`,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    auxiliaryFields: [
      {
        key: 'status',
        label: 'CASHBACK STATUS',
        value: cashbackStatus,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    backFields: [
      {
        key: 'terms',
        label: 'TERMS AND CONDITIONS',
        value: data.description || 'Earn cashback on every purchase. Terms apply.'
      }
    ]
  };
}

/**
 * Generate storeCard field structure for Membership Card
 */
export function mapMembershipCardFields(data: CardData): StoreCardFields {
  const expirationDate = data.expirationDate || 'N/A';
  const classesPerMonth = data.classesPerMonth || 0;
  const membershipType = data.membershipType || 'Standard';
  const availableLimits = data.availableLimits || 0;
  const tier = data.tier || 'Gold';
  
  return {
    headerFields: [
      {
        key: 'valid',
        label: 'VALID UNTIL',
        value: expirationDate,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    primaryFields: [
      {
        key: 'classes',
        label: 'CLASSES PER MONTH',
        value: classesPerMonth,
        textAlignment: 'PKTextAlignmentLeft'
      },
      {
        key: 'type',
        label: 'TYPE',
        value: membershipType,
        textAlignment: 'PKTextAlignmentRight'
      }
    ],
    auxiliaryFields: [
      {
        key: 'tier',
        label: 'MEMBERSHIP TIER',
        value: tier,
        textAlignment: 'PKTextAlignmentLeft'
      },
      {
        key: 'limits',
        label: 'AVAILABLE LIMITS',
        value: availableLimits,
        textAlignment: 'PKTextAlignmentRight'
      }
    ],
    backFields: [
      {
        key: 'terms',
        label: 'TERMS AND CONDITIONS',
        value: data.description || 'Membership terms and conditions apply.'
      }
    ]
  };
}

/**
 * Generate storeCard field structure for Coupon Card
 */
export function mapCouponCardFields(data: CardData): StoreCardFields {
  const expirationDate = data.expirationDate || 'N/A';
  const offerDescription = data.offerDescription || 'Special Offer';
  
  return {
    headerFields: [
      {
        key: 'valid',
        label: 'VALID UNTIL',
        value: expirationDate,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    primaryFields: [
      {
        key: 'offer',
        label: 'OFFER',
        value: offerDescription,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    backFields: [
      {
        key: 'terms',
        label: 'TERMS AND CONDITIONS',
        value: data.description || 'Coupon terms and conditions apply.'
      }
    ]
  };
}

/**
 * Generate storeCard field structure for Reward Card
 */
export function mapRewardCardFields(data: CardData): StoreCardFields {
  const pointsBalance = data.pointsBalance || 0;
  const pointsRate = data.pointsRate || 1;
  const currentReward = data.currentReward || 'None';
  const nextThreshold = data.nextRewardThreshold || 100;
  
  return {
    headerFields: [
      {
        key: 'points',
        label: 'POINTS',
        value: pointsBalance,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    primaryFields: [
      {
        key: 'earn',
        label: 'Earn rewards',
        value: `£1 = ${pointsRate} points`,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    secondaryFields: [
      {
        key: 'current',
        label: 'CURRENT REWARD',
        value: currentReward,
        textAlignment: 'PKTextAlignmentLeft'
      },
      {
        key: 'next',
        label: 'NEXT REWARD',
        value: `After ${nextThreshold} points`,
        textAlignment: 'PKTextAlignmentRight'
      }
    ],
    backFields: [
      {
        key: 'terms',
        label: 'TERMS AND CONDITIONS',
        value: data.description || 'Earn and redeem rewards. Terms apply.'
      }
    ]
  };
}

/**
 * Generate storeCard field structure for Gift Card
 */
export function mapGiftCardFields(data: CardData): StoreCardFields {
  const balance = data.balance || 0;
  const cardNumber = data.cardNumber || 'N/A';
  const tagline = data.tagline || '';
  
  return {
    headerFields: [
      {
        key: 'balance',
        label: 'BALANCE',
        value: `£${balance}`,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    primaryFields: [
      {
        key: 'tagline',
        label: '',
        value: tagline,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    secondaryFields: [
      {
        key: 'number',
        label: 'GIFT CARD #',
        value: cardNumber,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    backFields: [
      {
        key: 'terms',
        label: 'TERMS AND CONDITIONS',
        value: data.description || 'Gift card terms and conditions apply.'
      }
    ]
  };
}

/**
 * Generate storeCard field structure for Multipass Card
 */
export function mapMultipassCardFields(data: CardData): StoreCardFields {
  const visitsLeft = data.stampCount || 0; // Reusing stampCount for visits
  const totalVisits = data.stampThreshold || 10;
  
  return {
    headerFields: [
      {
        key: 'visits',
        label: 'VISITS LEFT',
        value: `${visitsLeft} visits`,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    primaryFields: [
      {
        key: 'status',
        label: 'MULTIPASS STATUS',
        value: visitsLeft > 0 ? 'Active' : 'Used',
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    secondaryFields: [
      {
        key: 'remaining',
        label: 'REMAINING',
        value: `${visitsLeft} of ${totalVisits}`,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    backFields: [
      {
        key: 'terms',
        label: 'TERMS AND CONDITIONS',
        value: data.description || 'Multipass terms and conditions apply.'
      }
    ]
  };
}

/**
 * Main mapper function - routes to appropriate card type mapper
 */
export function mapCardTypeToStoreCardFields(cardType: string, data: CardData): StoreCardFields {
  switch (cardType) {
    case 'stamp':
      return mapStampCardFields(data);
    case 'points':
      return mapPointsCardFields(data);
    case 'discount':
      return mapDiscountCardFields(data);
    case 'cashback':
    case 'cash_back':
      return mapCashbackCardFields(data);
    case 'membership':
      return mapMembershipCardFields(data);
    case 'coupon':
      return mapCouponCardFields(data);
    case 'reward':
      return mapRewardCardFields(data);
    case 'gift':
    case 'certificate':
      return mapGiftCardFields(data);
    case 'multipass':
      return mapMultipassCardFields(data);
    default:
      // Default to stamp card structure
      return mapStampCardFields(data);
  }
}

