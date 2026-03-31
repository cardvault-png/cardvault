import { Link } from 'react-router-dom';
import { Gift, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Terms() {
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
              <Gift className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Terms of Service</h1>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using GiftCard Pro, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              GiftCard Pro is a platform that allows users to buy and sell gift cards securely.
              We provide verification, escrow, and payment processing services.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              You must be at least 18 years old to use this service. You are responsible for
              maintaining the confidentiality of your account information.
            </p>

            <h2>4. Prohibited Activities</h2>
            <p>Users are prohibited from:</p>
            <ul>
              <li>Selling stolen or fraudulent gift cards</li>
              <li>Using the platform for money laundering</li>
              <li>Creating multiple accounts</li>
              <li>Attempting to circumvent our verification systems</li>
            </ul>

            <h2>5. Fees</h2>
            <p>
              We charge a fee for each transaction. Fees are clearly displayed before you
              confirm any transaction.
            </p>

            <h2>6. Limitation of Liability</h2>
            <p>
              GiftCard Pro is not liable for any indirect, incidental, or consequential damages
              arising from your use of the service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
