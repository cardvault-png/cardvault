import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Gift, Plus, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { giftCardService } from '@/services/giftcard';

export function GiftCards() {
  const { data } = useQuery({
    queryKey: ['giftcards'],
    queryFn: () => giftCardService.getMyCards(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Gift Cards</h1>
        <Link to="/gift-cards/submit">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Sell Gift Card
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <Gift className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.cards?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.cards?.filter((c: any) => c.status === 'PENDING' || c.status === 'AI_PROCESSING').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.cards?.filter((c: any) => c.status === 'COMPLETED').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Cards</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.cards?.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Gift className="mx-auto h-8 w-8" />
              <p className="mt-2">No gift cards yet</p>
              <Link to="/gift-cards/submit">
                <Button className="mt-4">Sell Your First Card</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {data?.cards?.map((card: any) => (
                <div key={card.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <Gift className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{card.brand}</p>
                      <p className="text-sm text-gray-500">
                        ${parseFloat(card.cardValue).toFixed(2)} value
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
                          : card.status === 'PENDING'
                          ? 'warning'
                          : 'destructive'
                      }
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
  );
}
