import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { walletService } from '@/services/wallet';
import { bankService } from '@/services/bank';
import { transactionService } from '@/services/transaction';

export function Withdrawal() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [bankAccountId, setBankAccountId] = useState('');

  const { data: wallets } = useQuery({
    queryKey: ['wallets'],
    queryFn: walletService.getWallets,
  });

  const { data: accounts } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: bankService.getAccounts,
  });

  const usdWallet = wallets?.find((w: any) => w.type === 'USD');
  const balance = parseFloat(usdWallet?.balance || '0');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await transactionService.createWithdrawal({
        walletType: 'USD',
        amount: parseFloat(amount),
        bankAccountId,
      });
      navigate('/wallet/transactions');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Withdraw Funds</h1>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Available Balance</Label>
              <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
            </div>

            <div>
              <Label>Amount ($)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min={10}
                max={balance}
              />
            </div>

            <div>
              <Label>Bank Account</Label>
              <Select value={bankAccountId} onValueChange={setBankAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bank account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((account: any) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.bankName} - {account.accountNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500 dark:bg-gray-800">
              <p>Fee: 1% (${amount ? (parseFloat(amount) * 0.01).toFixed(2) : '0.00'})</p>
              <p>You will receive: ${amount ? (parseFloat(amount) * 0.99).toFixed(2) : '0.00'}</p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !amount || !bankAccountId || parseFloat(amount) > balance}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowUpRight className="mr-2 h-4 w-4" />
              )}
              Request Withdrawal
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
