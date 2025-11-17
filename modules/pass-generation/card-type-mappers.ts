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
 * Designed to match high-fidelity templates with clean, minimal layout
 */
export function mapStampCardFields(data: CardData): StoreCardFields {
  // Use ?? instead of || to properly handle 0 values
  const stampCount = data.stampCount ?? 0;
  const threshold = data.stampThreshold ?? 10;
  const rewardsCollected = data.rewardsCollected ?? 0;
  
  return {
    // Header: Two separate fields for stamps and rewards
    headerFields: [
      {
        key: 'stamps',
        label: 'stamps',
        value: stampCount.toString(),
        textAlignment: 'PKTextAlignmentLeft'
      },
      {
        key: 'rewards',
        label: 'rewards',
        value: rewardsCollected.toString(),
        textAlignment: 'PKTextAlignmentRight'
      }
    ],
    // Primary: Large visual stamp display (matches CITY HAIR design)
    primaryFields: [
      {
        key: 'visualStamps',
        label: '', // No label - cleaner look
        // Display visual stamps using Unicode symbols
        value: (() => {
          const maxDisplay = Math.min(threshold, 10); // Limit to 10 for cleaner display
          const displayCount = Math.min(stampCount, maxDisplay);
          // Use ● for filled and ○ for empty (cleaner circles like in inspiration)
          const filled = Array(displayCount).fill('●').join(' ');
          const empty = Array(Math.max(0, maxDisplay - displayCount)).fill('○').join(' ');
          const visualStamps = [filled, empty].filter(Boolean).join(' ');
          return visualStamps || Array(maxDisplay).fill('○').join(' ');
        })(),
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    // Secondary: Minimal, focused info
    secondaryFields: [
      {
        key: 'status',
        label: data.subtitle || 'Member',
        value: stampCount >= threshold ? 'Reward ready!' : `${Math.max(0, threshold - stampCount)} more`,
        textAlignment: 'PKTextAlignmentLeft'
      }
    ],
    // Auxiliary: Clean, two-column layout
    auxiliaryFields: [],
    // Back: Keep terms
    backFields: [
      {
        key: 'terms',
        label: 'TERMS AND CONDITIONS',
        value: data.description || 'Collect stamps to earn rewards. Terms apply.'
      },
      {
        key: 'how',
        label: 'HOW IT WORKS',
        value: `Collect ${threshold} stamps to earn a reward. Show this card when making a purchase to collect stamps.`
      }
    ]
  };
}

/**
 * Generate storeCard field structure for Points Card
 * Clean design matching inspiration templates
 */
export function mapPointsCardFields(data: CardData): StoreCardFields {
  const pointsBalance = data.pointsBalance || 0;
  const pointsRate = data.pointsRate || 1;
  const nextThreshold = data.nextRewardThreshold || 100;
  const tier = data.tier || data.subtitle || 'Bronze';
  
  return {
    headerFields: [
      {
        key: 'balance',
        label: 'Points balance',
        value: pointsBalance.toString(),
        textAlignment: 'PKTextAlignmentLeft'
      }
    ],
    primaryFields: [
      {
        key: 'earn',
        label: '',
        value: `Earn ${pointsRate} pts per £1`,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    secondaryFields: [
      {
        key: 'tier',
        label: tier,
        value: pointsBalance >= nextThreshold ? 'Reward ready' : `${nextThreshold - pointsBalance} more`,
        textAlignment: 'PKTextAlignmentLeft'
      }
    ],
    auxiliaryFields: [],
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
 * Clean design matching inspiration templates (like TESCO Clubcard)
 */
export function mapDiscountCardFields(data: CardData): StoreCardFields {
  const discountPercentage = data.discountPercentage || 0;
  const discountTier = data.discountTier || data.subtitle || 'Bronze';
  
  return {
    headerFields: [
      {
        key: 'discount',
        label: 'Discount percentage',
        value: `${discountPercentage}%`,
        textAlignment: 'PKTextAlignmentLeft'
      }
    ],
    primaryFields: [
      {
        key: 'status',
        label: '',
        value: discountTier,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    secondaryFields: [],
    auxiliaryFields: [],
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
 * Clean design matching inspiration templates (like BREAD AHEAD)
 */
export function mapCashbackCardFields(data: CardData): StoreCardFields {
  const cashbackPercentage = data.cashbackPercentage || 0;
  const cashbackEarned = data.cashbackEarned || 0;
  const cashbackStatus = data.cashbackStatus || data.subtitle || 'Bronze';
  
  return {
    headerFields: [
      {
        key: 'percentage',
        label: 'Cashback percentage',
        value: `${cashbackPercentage}%`,
        textAlignment: 'PKTextAlignmentLeft'
      }
    ],
    primaryFields: [
      {
        key: 'earned',
        label: '',
        value: `£${cashbackEarned.toFixed(2)} earned`,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    secondaryFields: [
      {
        key: 'status',
        label: cashbackStatus,
        value: `${cashbackPercentage}% cashback`,
        textAlignment: 'PKTextAlignmentLeft'
      }
    ],
    auxiliaryFields: [],
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
 * Clean design matching inspiration templates (like YOGA BLISS & SIERRA)
 */
export function mapMembershipCardFields(data: CardData): StoreCardFields {
  const expirationDate = data.expirationDate || 'N/A';
  const classesPerMonth = data.classesPerMonth || 0;
  const tier = data.tier || data.subtitle || 'Gold';
  
  return {
    headerFields: [
      {
        key: 'classes',
        label: 'Classes per month',
        value: classesPerMonth.toString(),
        textAlignment: 'PKTextAlignmentLeft'
      }
    ],
    primaryFields: [
      {
        key: 'tier',
        label: '',
        value: tier,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    secondaryFields: [
      {
        key: 'valid',
        label: 'Valid until',
        value: expirationDate,
        textAlignment: 'PKTextAlignmentLeft'
      }
    ],
    auxiliaryFields: [],
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
 * Clean design matching inspiration templates (like STRETCH INC.)
 */
export function mapCouponCardFields(data: CardData): StoreCardFields {
  const expirationDate = data.expirationDate || 'N/A';
  const offerDescription = data.offerDescription || 'Special Offer';
  
  return {
    headerFields: [
      {
        key: 'valid',
        label: 'Valid until',
        value: expirationDate,
        textAlignment: 'PKTextAlignmentLeft'
      }
    ],
    primaryFields: [
      {
        key: 'offer',
        label: '',
        value: offerDescription,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    secondaryFields: [],
    auxiliaryFields: [],
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
 * Clean design matching inspiration templates
 */
export function mapRewardCardFields(data: CardData): StoreCardFields {
  const pointsBalance = data.pointsBalance || 0;
  const pointsRate = data.pointsRate || 1;
  const nextThreshold = data.nextRewardThreshold || 100;
  const tier = data.tier || data.subtitle || 'Member';
  
  return {
    headerFields: [
      {
        key: 'balance',
        label: 'Points balance',
        value: pointsBalance.toString(),
        textAlignment: 'PKTextAlignmentLeft'
      }
    ],
    primaryFields: [
      {
        key: 'rate',
        label: '',
        value: `£1 = ${pointsRate} pts`,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    secondaryFields: [
      {
        key: 'tier',
        label: tier,
        value: pointsBalance >= nextThreshold ? 'Reward ready' : `${nextThreshold - pointsBalance} more`,
        textAlignment: 'PKTextAlignmentLeft'
      }
    ],
    auxiliaryFields: [],
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
 * Clean design matching inspiration templates
 */
export function mapGiftCardFields(data: CardData): StoreCardFields {
  const balance = data.balance || 0;
  const cardNumber = data.cardNumber || 'N/A';
  
  return {
    headerFields: [
      {
        key: 'balance',
        label: 'Gift card balance',
        value: `£${balance.toFixed(2)}`,
        textAlignment: 'PKTextAlignmentLeft'
      }
    ],
    primaryFields: [
      {
        key: 'card',
        label: '',
        value: cardNumber,
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    secondaryFields: [],
    auxiliaryFields: [],
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
 * Clean design matching inspiration templates
 */
export function mapMultipassCardFields(data: CardData): StoreCardFields {
  const visitsLeft = data.stampCount || 0; // Reusing stampCount for visits
  const totalVisits = data.stampThreshold || 10;
  const tier = data.subtitle || 'Member';
  
  return {
    headerFields: [
      {
        key: 'visits',
        label: 'Visits left',
        value: `${visitsLeft}`,
        textAlignment: 'PKTextAlignmentLeft'
      }
    ],
    primaryFields: [
      {
        key: 'visual',
        label: '',
        // Display visual visits using circles
        value: (() => {
          const maxDisplay = Math.min(totalVisits, 10);
          const displayCount = Math.min(visitsLeft, maxDisplay);
          const filled = Array(displayCount).fill('●').join(' ');
          const empty = Array(Math.max(0, maxDisplay - displayCount)).fill('○').join(' ');
          const visualVisits = [filled, empty].filter(Boolean).join(' ');
          return visualVisits || Array(maxDisplay).fill('○').join(' ');
        })(),
        textAlignment: 'PKTextAlignmentCenter'
      }
    ],
    secondaryFields: [
      {
        key: 'status',
        label: tier,
        value: visitsLeft > 0 ? `${visitsLeft} of ${totalVisits}` : 'Expired',
        textAlignment: 'PKTextAlignmentLeft'
      }
    ],
    auxiliaryFields: [],
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

