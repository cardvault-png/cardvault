import { useQuery } from '@tanstack/react-query';
import { Gavel, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AdminAppeals() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Appeals</h1>

      <Card>
        <CardContent className="p-0">
          <div className="py-12 text-center text-gray-500">
            <Gavel className="mx-auto h-8 w-8" />
            <p className="mt-2">No pending appeals</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
