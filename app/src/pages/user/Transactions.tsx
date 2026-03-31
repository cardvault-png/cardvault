import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDownLeft, ArrowUpRight, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { transactionService } from '@/services/transaction';

export function Transactions() {
  const [page, setPage] = useState(1);
  const { data } = useQuery({
    queryKey: ['transactions', page],
    queryFn: () => transactionService.getTransactions({ page, limit: 20 }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {data?.transactions?.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="divide-y">
              {data?.transactions?.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
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
                        {new Date(tx.createdAt).toLocaleString()}
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
                      {tx.type === 'DEPOSIT' || tx.type === 'GIFT_CARD_SALE' ? '+' : '-'}
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
    </div>
  );
}
