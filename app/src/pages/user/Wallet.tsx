import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, History, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { walletService } from '@/services/wallet';

export function Wallet() {
  const [copied, setCopied] = useState(false);
  const { data: wallets } = useQuery({
    queryKey: ['wallets'],
    queryFn: walletService.getWallets,
  });

  const usdWallet = wallets?.find((w: any) => w.type === 'USD');
  const usdtWallet = wallets?.find((w: any) => w.type === 'USDT');

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Wallets</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* USD Wallet */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              USD Wallet
            </CardTitle>
            <WalletIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${parseFloat(usdWallet?.balance || '0').toFixed(2)}
            </div>
            <p className="text-sm text-gray-500">Fiat Currency</p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <ArrowDownLeft className="mr-1 h-4 w-4" />
                Deposit
              </Button>
              <Button size="sm" className="flex-1">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* USDT Wallet */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              USDT Wallet (TRC20)
            </CardTitle>
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[8px] text-white">
              T
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {parseFloat(usdtWallet?.balance || '0').toFixed(2)} USDT
            </div>
            <p className="text-sm text-gray-500">Tether on TRON Network</p>
            
            {usdtWallet?.address && (
              <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <p className="text-xs text-gray-500">Deposit Address</p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 truncate text-sm">{usdtWallet.address}</code>
                  <button
                    onClick={() => copyAddress(usdtWallet.address)}
                    className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-gray-500">No recent transactions</p>
        </CardContent>
      </Card>
    </div>
  );
}
