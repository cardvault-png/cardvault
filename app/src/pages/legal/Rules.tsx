import { Link } from 'react-router-dom';
import { Gift, ArrowLeft, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Rules() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link to="/login">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
              <Gavel className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Rules & Regulations</h1>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h2>1. Gift Card Requirements</h2>
            <ul>
              <li>All gift cards must be legally obtained</li>
              <li>Cards must not be previously used or redeemed</li>
              <li>Physical cards must have clear, readable images</li>
              <li>Digital cards must include complete code information</li>
            </ul>

            <h2>2. Verification Process</h2>
            <ul>
              <li>All users must complete KYC verification</li>
              <li>Gift cards undergo AI and manual verification</li>
              <li>Large transactions may require additional verification</li>
              <li>Suspicious activity may result in account suspension</li>
            </ul>

            <h2>3. Trading Rules</h2>
            <ul>
              <li>Minimum transaction: $10</li>
              <li>Maximum transaction: $10,000 per day</li>
              <li>Rates are determined by market conditions</li>
              <li>All sales are final after approval</li>
            </ul>

            <h2>4. Prohibited Items</h2>
            <ul>
              <li>Stolen or fraudulently obtained cards</li>
              <li>Cards from restricted countries</li>
              <li>Expired or invalid cards</li>
              <li>Cards with disputed ownership</li>
            </ul>

            <h2>5. Account Suspension</h2>
            <p>Accounts may be suspended for:</p>
            <ul>
              <li>Violating platform rules</li>
              <li>Attempting fraud</li>
              <li>Multiple failed verification attempts</li>
              <li>Chargebacks or payment disputes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
