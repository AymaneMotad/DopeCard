"use client";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
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

const CreateUserPage = () => {
  const { getToken } = useAuth();
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.target);
      const token = await getToken();

      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: selectedRole,
          email: formData.get('email'),
          username: formData.get('username'),
          phoneNumber: formData.get('phoneNumber'),
          password: formData.get('password'),
          // Role-specific fields
          ...(selectedRole === 'client' && {
            businessName: formData.get('businessName'),
            businessType: formData.get('businessType'),
            subscriptionPack: formData.get('subscriptionPack')
          }),
          ...(selectedRole === 'commercial' && {
            assignedTerritory: formData.get('territory'),
            targetQuota: formData.get('quota'),
            commissionRate: formData.get('commission')
          }),
          ...(selectedRole === 'manager' && {
            clientId: formData.get('clientId'),
            permissions: {
              canEditPasses: formData.get('canEditPasses') === 'on',
              canDeletePasses: formData.get('canDeletePasses') === 'on',
              canViewAnalytics: formData.get('canViewAnalytics') === 'on'
            }
          })
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Reset form and show success message
      e.target.reset();
      setSelectedRole("");
      // You might want to add a success toast here
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="canEditPasses" 
                        name="canEditPasses" 
                        type="checkbox" 
                        className="w-4 h-4" 
                      />
                      <Label htmlFor="canEditPasses">Can Edit Passes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="canDeletePasses" 
                        name="canDeletePasses" 
                        type="checkbox" 
                        className="w-4 h-4" 
                      />
                      <Label htmlFor="canDeletePasses">Can Delete Passes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="canViewAnalytics" 
                        name="canViewAnalytics" 
                        type="checkbox" 
                        className="w-4 h-4" 
                      />
                      <Label htmlFor="canViewAnalytics">Can View Analytics</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateUserPage;