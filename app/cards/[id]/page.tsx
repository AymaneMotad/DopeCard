"use client";

import { use } from "react";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QRCodeSVG } from "qrcode.react";

export default function CardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: card, isLoading } = trpc.cards.getById.useQuery({ id: resolvedParams.id });
  const generateDistribution = trpc.cards.generateDistribution.useMutation();

  const handleGenerateQR = () => {
    generateDistribution.mutate({ id: resolvedParams.id });
  };

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (!card) {
    return <div className="container mx-auto p-6">Card not found</div>;
  }

  const design = card.design as any;
  const settings = card.settings as any;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{card.name}</h1>
        <Button variant="outline" onClick={() => router.push("/cards")}>
          Back to Cards
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Card Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Type:</strong> {card.type}
            </div>
            <div>
              <strong>Business:</strong> {settings?.businessName || 'N/A'}
            </div>
            <div>
              <strong>Status:</strong> {card.active ? 'Active' : 'Inactive'}
            </div>
            <div>
              <strong>Created:</strong> {new Date(card.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution</CardTitle>
            <CardDescription>Share this card with customers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGenerateQR} className="w-full">
              Generate QR Code & Link
            </Button>
            
            {generateDistribution.data && (
              <div className="space-y-4">
                <div>
                  <Label>Registration Link</Label>
                  <div className="flex gap-2">
                    <Input value={generateDistribution.data.registrationLink} readOnly />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(generateDistribution.data.registrationLink);
                        alert('Link copied!');
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <QRCodeSVG value={generateDistribution.data.registrationLink} size={200} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

