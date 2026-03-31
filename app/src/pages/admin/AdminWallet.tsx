import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wallet, Send, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminService } from '@/services/admin';

export function AdminWallet() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: wallet } = useQuery({
    queryKey: ['admin-wallet'],
    queryFn: adminService.getAdminWallet,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Wallet</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Available Balance
          </CardTitle>
          <Wallet className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            ${parseFloat(wallet?.balance || '15000').toFixed(2)}
          </div>
          <p className="text-sm text-gray-500">Auto-refill enabled</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Funds to User</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="mr-2 h-4 w-4" />
                Send Funds
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Funds to User</DialogTitle>
              </DialogHeader>
              <form className="space-y-4">
                <div>
                  <Label>User ID</Label>
                  <Input placeholder="Enter user ID" />
                </div>
                <div>
                  <Label>Wallet Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input type="number" placeholder="Enter amount" />
                </div>
                <div>
                  <Label>Reason</Label>
                  <Input placeholder="Enter reason" />
                </div>
                <Button className="w-full">Send Funds</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
