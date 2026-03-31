import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Landmark, Plus, Trash2, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bankService } from '@/services/bank';

export function BankAccounts() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: accounts, refetch } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: bankService.getAccounts,
  });
  const { data: banks } = useQuery({
    queryKey: ['banks'],
    queryFn: () => bankService.getBanks('nigeria'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bank Accounts</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Bank Account</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div>
                <Label>Bank</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks?.map((bank: any) => (
                      <SelectItem key={bank.code} value={bank.code}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Account Number</Label>
                <Input placeholder="Enter account number" />
              </div>
              <Button className="w-full">Add Account</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {accounts?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Landmark className="mx-auto h-8 w-8" />
              <p className="mt-2">No bank accounts added</p>
            </CardContent>
          </Card>
        ) : (
          accounts?.map((account: any) => (
            <Card key={account.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{account.bankName}</p>
                    <p className="text-sm text-gray-500">{account.accountNumber}</p>
                    <p className="text-sm text-gray-500">{account.accountName}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {account.isDefault && (
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  )}
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
