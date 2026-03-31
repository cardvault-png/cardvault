import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Ban, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { adminService } from '@/services/admin';

export function AdminUsers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => adminService.getUsers({ page, limit: 20, search }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {data?.users?.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={user.isBanned ? 'destructive' : 'success'}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </Badge>
                      <Badge variant={user.kycStatus === 'APPROVED' ? 'success' : 'warning'}>
                        {user.kycStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Wallet className="mr-2 h-4 w-4" />
                    Balance
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Ban className="mr-2 h-4 w-4" />
                    Ban
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
