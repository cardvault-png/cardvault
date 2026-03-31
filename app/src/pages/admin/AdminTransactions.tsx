import { useQuery } from '@tanstack/react-query';
import { ArrowLeftRight, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/services/admin';

export function AdminTransactions() {
  const { data } = useQuery({
    queryKey: ['admin-pending-transactions'],
    queryFn: () => adminService.getPendingTransactions(),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pending Transactions</h1>

      <Card>
        <CardContent className="p-0">
          {data?.transactions?.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p>No pending transactions</p>
            </div>
          ) : (
            <div className="divide-y">
              {data?.transactions?.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <ArrowLeftRight className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{tx.type.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-gray-500">{tx.user?.email}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${parseFloat(tx.amount).toFixed(2)}</p>
                    <div className="flex gap-2 mt-2">
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
