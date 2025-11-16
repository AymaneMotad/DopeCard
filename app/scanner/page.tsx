"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/server/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Camera, Plus, Gift, History } from "lucide-react";

export default function ScannerPage() {
  const [scanMode, setScanMode] = useState<'scan' | 'lookup' | 'customer'>('scan');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [stampCount, setStampCount] = useState(1);
  const [transactionAmount, setTransactionAmount] = useState('');

  const scanQR = trpc.scanner.scanQR.useMutation();
  const lookupCustomer = trpc.scanner.lookupCustomer.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 2 }
  );
  const addStamps = trpc.scanner.addStamps.useMutation({
    onSuccess: () => {
      alert('Stamps added successfully!');
      setSelectedCustomer(null);
      setScanMode('scan');
    },
  });
  const redeemReward = trpc.scanner.redeemReward.useMutation({
    onSuccess: () => {
      alert('Reward redeemed!');
      setSelectedCustomer(null);
      setScanMode('scan');
    },
  });

  const handleScan = async () => {
    // In a real implementation, you would use a QR code scanner library
    // For now, this is a placeholder
    const qrData = prompt('Enter QR code data (or scan):');
    if (qrData) {
      scanQR.mutate({ qrData }, {
        onSuccess: (data) => {
          setSelectedCustomer(data);
          setScanMode('customer');
        },
        onError: (error) => {
          alert(`Error: ${error.message}`);
        },
      });
    }
  };

  const handleAddStamps = () => {
    if (!selectedCustomer) return;
    
    addStamps.mutate({
      passId: selectedCustomer.pass.id,
      stampCount,
      transactionAmount: transactionAmount ? parseFloat(transactionAmount) : undefined,
    });
  };

  const handleRedeem = () => {
    if (!selectedCustomer) return;
    
    redeemReward.mutate({
      passId: selectedCustomer.pass.id,
      rewardType: 'free_coffee',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-2xl">Scanner App</CardTitle>
            <CardDescription>Scan customer cards or lookup manually</CardDescription>
          </CardHeader>
        </Card>

        {/* Scan Mode */}
        {scanMode === 'scan' && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={handleScan}
                  className="w-full h-32 text-lg"
                  size="lg"
                >
                  <Camera className="h-8 w-8 mr-2" />
                  Scan QR Code
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Or Search Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Search by name, email, or phone</Label>
                    <div className="flex gap-2">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                      />
                      <Button
                        onClick={() => setScanMode('lookup')}
                        disabled={!lookupCustomer.data || lookupCustomer.data.length === 0}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {lookupCustomer.data && lookupCustomer.data.length > 0 && (
                    <div className="space-y-2">
                      {lookupCustomer.data.map((customer: any) => (
                        <div
                          key={customer.id}
                          className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                          onClick={() => {
                            // Fetch full customer data with pass
                            scanQR.mutate({ qrData: `USER${customer.id}` }, {
                              onSuccess: (data) => {
                                setSelectedCustomer(data);
                                setScanMode('customer');
                              },
                            });
                          }}
                        >
                          <div className="font-medium">{customer.username}</div>
                          <div className="text-sm text-gray-600">{customer.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Customer View */}
        {scanMode === 'customer' && selectedCustomer && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedCustomer.user.username}</CardTitle>
              <CardDescription>
                {selectedCustomer.user.email} • {selectedCustomer.user.phoneNumber}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-4xl font-bold text-blue-600">
                  {selectedCustomer.pass.stampCount}
                </div>
                <div className="text-gray-600 mt-2">Stamps</div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Add Stamps</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={stampCount}
                      onChange={(e) => setStampCount(parseInt(e.target.value) || 1)}
                      className="w-24"
                    />
                    <Input
                      type="number"
                      placeholder="Transaction amount (optional)"
                      value={transactionAmount}
                      onChange={(e) => setTransactionAmount(e.target.value)}
                    />
                    <Button
                      onClick={handleAddStamps}
                      disabled={addStamps.isLoading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>

                <div>
                  <Button
                    onClick={handleRedeem}
                    disabled={redeemReward.isLoading || selectedCustomer.pass.stampCount < 10}
                    className="w-full"
                    variant="outline"
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    Redeem Reward (10 stamps)
                  </Button>
                </div>

                <Button
                  onClick={() => {
                    setSelectedCustomer(null);
                    setScanMode('scan');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Back to Scan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
