"use client";

import { useState } from "react";
import { trpc } from "@/server/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, Mail, Phone } from "lucide-react";
import Link from "next/link";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const { data: customers, isLoading } = trpc.customers.getAll.useQuery({
    search: search || undefined,
    limit: 50,
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div>Loading...</div>
      ) : customers && customers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer: any) => (
            <Card key={customer.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {customer.username}
                </CardTitle>
                <CardDescription>
                  {customer.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {customer.phoneNumber && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      {customer.phoneNumber}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    {customer.email}
                  </div>
                  <div className="pt-2">
                    <Link href={`/customers/${customer.id}`}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500">No customers found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

