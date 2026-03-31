import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  TrendingUp,
  Clock,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { walletService } from '@/services/wallet';
import { transactionService } from '@/services/transaction';
import { giftCardService } from '@/services/giftcard';

export function Dashboard() {
  const { user } = useAuth();

  const { data: wallets } = useQuery({
    queryKey: ['wallets'],
    queryFn: walletService.getWallets,
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: () => transactionService.getTransactions({ limit: 5 }),
  });

  const { data: giftCards } = useQuery({
    queryKey: ['giftcards', 'recent'],
    queryFn: () => giftCardService.getMyCards({ limit: 5 }),
  });

  const usdWallet = wallets?.find((w: any) => w.type === 'USD');
  const usdtWallet = wallets?.find((w: any) => w.type === 'USDT');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white lg:p-8">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold lg:text-3xl">
            Welcome back, {user?.fullName?.split(' ')[0]}!
          </h1>
          <p className="mt-2 text-indigo-100">
            Here's what's happening with your account today.
          </p>
          
          {user?.kycStatus !== 'APPROVED' && (
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-white/10 p-3 backdrop-blur-sm">
              <AlertCircle className="h-5 w-5" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Complete your KYC verification
                </p>
                <p className="text-xs text-indigo-100">
                  Verify your identity to unlock all features
                </p>
              </div>
              <Link to="/profile/kyc">
                <Button size="sm" variant="secondary">
                  Verify Now
                </Button>
              </Link>
            </div>
          )}
        </div>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white/5" />
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              USD Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${parseFloat(usdWallet?.balance || '0').toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">Available balance</p>
            <div className="mt-4 flex gap-2">
              <Link to="/wallet/withdrawal" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                  Withdraw
                </Button>
              </Link>
              <Link to="/gift-cards/submit" className="flex-1">
                <Button size="sm" className="w-full">
                  <Gift className="mr-1 h-4 w-4" />
                  Sell Card
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              USDT Balance
            </CardTitle>
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[8px] text-white">
              T
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parseFloat(usdtWallet?.balance || '0').toFixed(2)} USDT
            </div>
            <p className="text-xs text-gray-500">TRC20 Network</p>
            <div className="mt-4 flex gap-2">
              <Link to="/wallet" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Deposit
                </Button>
              </Link>
              <Link to="/wallet/withdrawal" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Withdraw
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Earnings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${parseFloat(usdWallet?.balance || '0').toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">Lifetime earnings</p>
            <div className="mt-4">
              <Link to="/wallet/transactions">
                <Button variant="outline" size="sm" className="w-full">
                  View History
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Link to="/wallet/transactions">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTransactions?.transactions?.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <Clock className="mx-auto h-8 w-8" />
                <p className="mt-2">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions?.transactions?.map((tx: any) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          tx.type === 'DEPOSIT' || tx.type === 'GIFT_CARD_SALE'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {tx.type === 'DEPOSIT' || tx.type === 'GIFT_CARD_SALE' ? (
                          <ArrowDownLeft className="h-5 w-5" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.type.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium ${
                          tx.type === 'DEPOSIT' || tx.type === 'GIFT_CARD_SALE'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {tx.type === 'DEPOSIT' || tx.type === 'GIFT_CARD_SALE'
                          ? '+'
                          : '-'}
                        ${parseFloat(tx.amount).toFixed(2)}
                      </p>
                      <Badge
                        variant={
                          tx.status === 'COMPLETED'
                            ? 'success'
                            : tx.status === 'PENDING'
                            ? 'warning'
                            : 'destructive'
                        }
                        className="text-xs"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Gift Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Gift Cards</CardTitle>
            <Link to="/gift-cards">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {giftCards?.cards?.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <Gift className="mx-auto h-8 w-8" />
                <p className="mt-2">No gift cards submitted yet</p>
                <Link to="/gift-cards/submit">
                  <Button className="mt-4" size="sm">
                    Sell Your First Card
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {giftCards?.cards?.map((card: any) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                        <Gift className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{card.brand}</p>
                        <p className="text-sm text-gray-500">
                          ${parseFloat(card.cardValue).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        +${parseFloat(card.payoutAmount).toFixed(2)}
                      </p>
                      <Badge
                        variant={
                          card.status === 'COMPLETED'
                            ? 'success'
                            : card.status === 'PENDING' ||
                              card.status === 'AI_PROCESSING'
                            ? 'warning'
                            : 'destructive'
                        }
                        className="text-xs"
                      >
                        {card.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
