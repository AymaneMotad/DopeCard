"use client";

import { use } from "react";
import { trpc } from "@/server/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, CreditCard } from "lucide-react";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: customer, isLoading } = trpc.customers.getById.useQuery({ id: resolvedParams.id });
  const { data: passes } = trpc.customers.getCustomerPass.useQuery({ customerId: resolvedParams.id });

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (!customer) {
    return <div className="container mx-auto p-6">Customer not found</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customer Details</h1>
        <Button variant="outline" onClick={() => router.push("/customers")}>
          Back to Customers
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <div className="font-medium">{customer.username}</div>
                <div className="text-sm text-gray-600">Username</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <div className="font-medium">{customer.email}</div>
                <div className="text-sm text-gray-600">Email</div>
              </div>
            </div>
            {customer.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium">{customer.phoneNumber}</div>
                  <div className="text-sm text-gray-600">Phone</div>
                </div>
              </div>
            )}
            <div>
              <div className="font-medium">{customer.active ? 'Active' : 'Inactive'}</div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
            <div>
              <div className="font-medium">{new Date(customer.createdAt).toLocaleDateString()}</div>
              <div className="text-sm text-gray-600">Member Since</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loyalty Passes</CardTitle>
            <CardDescription>{passes?.length || 0} active pass(es)</CardDescription>
          </CardHeader>
          <CardContent>
            {passes && passes.length > 0 ? (
              <div className="space-y-4">
                {passes.map((pass: any) => {
                  const metadata = pass.metadata as any || {};
                  return (
                    <div key={pass.id} className="p-4 border rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-4 w-4" />
                        <div className="font-medium">Pass #{pass.serialNumber}</div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Stamps: {metadata.stampCount || 0}
                      </div>
                      <div className="text-sm text-gray-600">
                        Status: {pass.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No passes found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

