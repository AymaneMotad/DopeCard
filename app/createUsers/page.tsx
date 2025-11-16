"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/server/client";

const CreateUserPage = () => {
  const { data: session, status } = useSession();
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState("");
  
  const createUser = trpc.admin.createUser.useMutation({
    onSuccess: () => {
      // Reset form and show success
      setError("");
      setSelectedRole("");
      alert("User created successfully!");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You must be an admin to access this page.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    
    const userData: any = {
      role: selectedRole,
      email: formData.get('email') as string,
      username: formData.get('username') as string,
      phoneNumber: formData.get('phoneNumber') as string || undefined,
      password: formData.get('password') as string,
    };

    // Add role-specific fields
    if (selectedRole === 'client') {
      userData.businessName = formData.get('businessName') as string;
      userData.businessType = formData.get('businessType') as string;
      userData.subscriptionPack = formData.get('subscriptionPack') as string;
    } else if (selectedRole === 'commercial') {
      userData.assignedTerritory = formData.get('territory') as string;
      userData.targetQuota = Number(formData.get('quota'));
      userData.commissionRate = Number(formData.get('commission'));
    } else if (selectedRole === 'manager') {
      userData.clientId = formData.get('clientId') as string;
    }

    createUser.mutate(userData);
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">User Role</Label>
              <Select 
                value={selectedRole} 
                onValueChange={setSelectedRole}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="commercial">Commercial Agent</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Base User Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  name="username" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input 
                  id="phoneNumber" 
                  name="phoneNumber" 
                  type="tel" 
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                />
              </div>
            </div>

            {/* Client-specific Fields */}
            {selectedRole === 'client' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input 
                    id="businessName" 
                    name="businessName" 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <Input 
                    id="businessType" 
                    name="businessType" 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="subscriptionPack">Subscription Pack</Label>
                  <Select name="subscriptionPack">
                    <SelectTrigger>
                      <SelectValue placeholder="Select subscription" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Commercial Agent Fields */}
            {selectedRole === 'commercial' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="territory">Territory</Label>
                  <Input 
                    id="territory" 
                    name="territory" 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="quota">Target Quota</Label>
                  <Input 
                    id="quota" 
                    name="quota" 
                    type="number" 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="commission">Commission Rate (%)</Label>
                  <Input 
                    id="commission" 
                    name="commission" 
                    type="number" 
                    required 
                  />
                </div>
              </div>
            )}

            {/* Manager Fields */}
            {selectedRole === 'manager' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input 
                    id="clientId" 
                    name="clientId" 
                    required 
                  />
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={createUser.isLoading}>
              {createUser.isLoading ? "Creating..." : "Create User"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateUserPage;
