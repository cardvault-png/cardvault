import { useQuery } from '@tanstack/react-query';
import { Shield, Check, X, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/services/admin';

export function AdminKyc() {
  const { data } = useQuery({
    queryKey: ['admin-pending-kyc'],
    queryFn: () => adminService.getPendingKyc(),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pending KYC Verification</h1>

      <Card>
        <CardContent className="p-0">
          {data?.users?.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p>No pending KYC verifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {data?.users?.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        Submitted: {new Date(user.kycSubmittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Check className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive">
                      <X className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
