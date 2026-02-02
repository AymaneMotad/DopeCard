/**
 * Apple Wallet Get Pass Endpoint
 * 
 * Returns the latest version of a pass
 * GET /v1/passes/{passTypeIdentifier}/{serialNumber}
 * 
 * Must return:
 * - Content-Type: application/vnd.apple.pkpass
 * - Content-Disposition: attachment
 * - Last-Modified: RFC 2822 date
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { userPasses, passTemplates } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generatePass } from '@/app/utils/pass-generation/pass-generation';
import { verifyAuthToken } from '@/app/api/passes/v1/middleware';

// Force Node.js runtime (not Edge) - required for Apple Wallet
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { passTypeIdentifier: string; serialNumber: string } }
) {
  // Verify authentication
  if (!verifyAuthToken(req)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { serialNumber } = params;

    // Find the pass
    const pass = await db.query.userPasses.findFirst({
      where: eq(userPasses.serialNumber, serialNumber),
    });

    if (!pass) {
      return NextResponse.json(
        { error: 'Pass not found' },
        { status: 404 }
      );
    }

    // Extract userId from serial number (format: COFFEE{userId})
    const userId = serialNumber.replace('COFFEE', '');
    
    const metadata = (pass.metadata as any) || {};

    // Fetch template data to keep pass consistent with original design
    const template = pass.templateId
      ? await db.query.passTemplates.findFirst({
          where: eq(passTemplates.id, pass.templateId),
        })
      : null;

    // If template is missing, fall back to minimal generation
    if (!template) {
      const stampCount = metadata?.stampCount || 0;
      const passBuffer = await generatePass(userId, stampCount);
      const lastModified = new Date(pass.updatedAt || pass.createdAt || new Date()).toUTCString();
      return new NextResponse(passBuffer, {
        headers: {
          'Content-Type': 'application/vnd.apple.pkpass',
          'Content-Disposition': `attachment; filename="${serialNumber}.pkpass"`,
          'Last-Modified': lastModified,
        },
      });
    }

    const design = (template.design as any) || {};
    const settings = (template.settings as any) || {};
    const cardType = template.cardType || metadata.cardType || 'stamp';

    const stampCount = metadata.stampCount ?? 0;
    const stampThreshold = settings.stampCount ?? metadata.stampThreshold ?? 10;

    const cardData = {
      cardTitle: template.name,
      businessName: settings.businessName || design.businessName || 'Business',
      subtitle: settings.subtitle || '',
      description: settings.description || template.name,
      backgroundColor: design.backgroundColor || '#59341C',
      textColor: design.textColor || '#FFFFFF',
      accentColor: design.accentColor || '#FF8C00',
      logo: design.logo,
      icon: design.icon,
      strip: design.strip,
      stampCount: stampCount,
      stampThreshold: stampThreshold,
      rewardsCollected: metadata.rewardsCollected ?? 0,
      pointsBalance: metadata.pointsBalance ?? settings.pointsBalance ?? 0,
      pointsRate: settings.pointsRate ?? metadata.pointsRate ?? 1,
      nextRewardThreshold: metadata.nextRewardThreshold ?? 100,
      lifetimePoints: metadata.lifetimePoints ?? metadata.pointsBalance ?? 0,
      tier: metadata.tier || 'Bronze',
      discountPercentage: metadata.discountPercentage ?? settings.discountPercentage ?? 0,
      discountTier: metadata.discountTier ?? 'None',
      visits: metadata.visits ?? settings.visits ?? 0,
      cashbackPercentage: metadata.cashbackPercentage ?? settings.cashbackPercentage ?? 0,
      cashbackEarned: metadata.cashbackEarned ?? settings.cashbackEarned ?? 0,
      cashbackStatus: metadata.cashbackStatus ?? 'Bronze',
      expirationDate: metadata.expirationDate ?? settings.expirationDate ?? null,
      classesPerMonth: metadata.classesPerMonth ?? settings.classesPerMonth ?? 0,
      membershipType: metadata.membershipType ?? 'Standard',
      availableLimits: metadata.availableLimits ?? settings.classesPerMonth ?? 0,
      offerDescription: metadata.offerDescription ?? settings.offerDescription ?? '',
      balance: metadata.balance ?? settings.balance ?? 0,
      cardNumber: metadata.cardNumber ?? serialNumber,
      tagline: metadata.tagline ?? settings.tagline ?? '',
    };

    // Generate updated pass with full card data
    const passBuffer = await generatePass(userId, stampCount, cardType, cardData);

    // Return pass file with required headers
    const lastModified = new Date(pass.updatedAt || pass.createdAt || new Date()).toUTCString();
    return new NextResponse(passBuffer, {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="${serialNumber}.pkpass"`,
        'Last-Modified': lastModified,
      },
    });
  } catch (error) {
    console.error('Get pass error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

