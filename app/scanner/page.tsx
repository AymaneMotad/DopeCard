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
  const sendTestNotification = trpc.notifications.sendManual.useMutation({
    onSuccess: (data) => {
      alert(`✅ Notification queued! ${data.devicesNotified} device(s) will be notified.`);
    },
    onError: (error) => {
      alert(`❌ Error: ${error.message}`);
    },
  });
  const testDirectNotification = trpc.notifications.testDirect.useMutation({
    onSuccess: (data) => {
      alert(`✅ Direct notification sent! ${data.devicesNotified || 0} device(s) notified.`);
    },
    onError: (error) => {
      alert(`❌ Error: ${error.message}`);
    },
  });
  const addStamps = trpc.scanner.addStamps.useMutation({
    onSuccess: (data) => {
      alert(`Stamps added successfully! New total: ${data.newStampCount}`);
      // Refresh customer data
      if (selectedCustomer) {
        scanQR.mutate({ qrData: selectedCustomer.user.id }, {
          onSuccess: (updatedData) => {
            setSelectedCustomer(updatedData);
          },
        });
      }
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });
  const redeemReward = trpc.scanner.redeemReward.useMutation({
    onSuccess: (data) => {
      alert(`Reward redeemed! New total: ${data.newStampCount} stamps`);
      // Refresh customer data
      if (selectedCustomer) {
        scanQR.mutate({ qrData: selectedCustomer.user.id }, {
          onSuccess: (updatedData) => {
            setSelectedCustomer(updatedData);
          },
        });
      }
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  // Check if input looks like a UUID or QR code data
  const isUUIDOrQRCode = (input: string): boolean => {
    const trimmed = input.trim();
    // UUID format: 8-4-4-4-12 hex characters
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    // Or COFFEE/USER prefix
    const prefixRegex = /^(COFFEE|USER)[0-9a-f-]+$/i;
    return uuidRegex.test(trimmed) || prefixRegex.test(trimmed) || trimmed.length > 30;
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    // If it looks like a UUID or QR code, use scanQR
    if (isUUIDOrQRCode(searchQuery)) {
      scanQR.mutate({ qrData: searchQuery.trim() }, {
        onSuccess: (data) => {
          setSelectedCustomer(data);
          setScanMode('customer');
          setSearchQuery('');
        },
        onError: (error) => {
          alert(`Error: ${error.message}`);
        },
      });
    } else {
      // Otherwise, show lookup results
      setScanMode('lookup');
    }
  };

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
                    <Label>Search by name, email, phone, or UUID/QR code</Label>
                    <div className="flex gap-2">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSearch();
                          }
                        }}
                        placeholder="Search or paste UUID/QR code..."
                      />
                      <Button
                        onClick={handleSearch}
                        disabled={!searchQuery.trim()}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    {isUUIDOrQRCode(searchQuery) && searchQuery.trim() && (
                      <p className="text-sm text-blue-600 mt-2">
                        Detected UUID/QR code - will search by ID
                      </p>
                    )}
                  </div>
                  
                  {lookupCustomer.data && lookupCustomer.data.length > 0 && !isUUIDOrQRCode(searchQuery) && (
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

        {/* Lookup Mode - Show search results */}
        {scanMode === 'lookup' && !isUUIDOrQRCode(searchQuery) && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>Select a customer to view their pass</CardDescription>
            </CardHeader>
            <CardContent>
              {lookupCustomer.isLoading && (
                <p className="text-center py-4">Searching...</p>
              )}
              {lookupCustomer.data && lookupCustomer.data.length > 0 ? (
                <div className="space-y-2">
                  {lookupCustomer.data.map((customer: any) => (
                    <div
                      key={customer.id}
                      className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        scanQR.mutate({ qrData: `USER${customer.id}` }, {
                          onSuccess: (data) => {
                            setSelectedCustomer(data);
                            setScanMode('customer');
                            setSearchQuery('');
                          },
                        });
                      }}
                    >
                      <div className="font-medium">{customer.username}</div>
                      <div className="text-sm text-gray-600">{customer.email}</div>
                      {customer.phoneNumber && (
                        <div className="text-sm text-gray-500">{customer.phoneNumber}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : lookupCustomer.data && lookupCustomer.data.length === 0 ? (
                <p className="text-center py-4 text-gray-500">No customers found</p>
              ) : null}
              <Button
                onClick={() => {
                  setScanMode('scan');
                  setSearchQuery('');
                }}
                variant="outline"
                className="w-full mt-4"
              >
                Back to Scan
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {scanQR.isLoading && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p>Loading customer data...</p>
            </CardContent>
          </Card>
        )}

        {/* Customer View */}
        {scanMode === 'customer' && selectedCustomer && !scanQR.isLoading && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedCustomer.user.username}</CardTitle>
              <CardDescription>
                {selectedCustomer.user.email} • {selectedCustomer.user.phoneNumber || 'No phone'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-4xl font-bold text-blue-600">
                  {selectedCustomer.pass.stampCount || 0}
                </div>
                <div className="text-gray-600 mt-2">Stamps</div>
                {selectedCustomer.deviceRegistrations !== undefined && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="text-sm text-gray-600">
                      Devices registered: <span className="font-semibold">{selectedCustomer.deviceRegistrations}</span>
                    </div>
                    {selectedCustomer.deviceRegistrations === 0 && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠️ No devices registered. Configure webServiceURL in pass generation for push notifications.
                      </p>
                    )}
                  </div>
                )}
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

                <div className="border-t pt-4">
                  <Label className="text-sm font-semibold mb-2 block">Test Push Notification</Label>
                  <div className="space-y-2">
                    <Button
                      onClick={() => {
                        sendTestNotification.mutate({
                          passId: selectedCustomer.pass.id,
                          title: 'Test Notification',
                          message: `Test push notification for ${selectedCustomer.user.username}. Current stamps: ${selectedCustomer.pass.stampCount}`,
                        });
                      }}
                      disabled={sendTestNotification.isLoading}
                      className="w-full"
                      variant="secondary"
                    >
                      📱 Send via QStash (Production)
                    </Button>
                    <Button
                      onClick={() => {
                        testDirectNotification.mutate({
                          passId: selectedCustomer.pass.id,
                          title: 'Test Notification',
                          message: `Direct test notification for ${selectedCustomer.user.username}. Current stamps: ${selectedCustomer.pass.stampCount}`,
                        });
                      }}
                      disabled={testDirectNotification.isLoading}
                      className="w-full"
                      variant="outline"
                    >
                      ⚡ Send Direct (Test - Bypasses QStash)
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedCustomer.deviceRegistrations === 0 ? (
                      <>
                        ⚠️ No devices registered. To test: Configure webServiceURL in pass generation, or use direct test with pushToken.
                      </>
                    ) : (
                      <>
                        ✅ {selectedCustomer.deviceRegistrations} device(s) registered. Notifications will be sent.
                      </>
                    )}
                  </p>
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
