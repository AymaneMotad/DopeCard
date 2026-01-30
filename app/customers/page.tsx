"use client";

import { useState } from "react";
import { trpc } from "@/server/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, Mail, Phone, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  const { data: customers, isLoading, refetch } = trpc.customers.getAll.useQuery({
    search: search || undefined,
    limit: 50,
  });

  const deleteAllMutation = trpc.customers.deleteAllTestUsers.useMutation({
    onSuccess: (data) => {
      toast({
        title: "✅ Test Users Deleted",
        description: `Deleted ${data.deleted.users} users, ${data.deleted.passes} passes, ${data.deleted.registrations} device registrations, and ${data.deleted.updates} pass updates.`,
        variant: "default",
      });
      refetch();
      setIsDeleting(false);
    },
    onError: (error) => {
      toast({
        title: "❌ Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsDeleting(false);
    },
  });

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    deleteAllMutation.mutate();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        
        {/* Delete All Test Users Button - For Testing Only */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              size="sm"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete All Test Users"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>⚠️ Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p className="font-semibold text-red-600">
                  This will permanently delete ALL customer test data:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>All customer users (registered customers)</li>
                  <li>All issued passes</li>
                  <li>All device registrations</li>
                  <li>All pass update history</li>
                </ul>
                <p className="text-sm text-green-600 mt-2 font-semibold">
                  ✅ Safe: Admin, commercial, and manager accounts will NOT be deleted
                </p>
                <p className="text-sm text-gray-600">
                  This action cannot be undone. Only use this during testing.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAll}
                className="bg-red-600 hover:bg-red-700"
              >
                Yes, Delete Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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

