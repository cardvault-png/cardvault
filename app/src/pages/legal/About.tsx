import { Link } from 'react-router-dom';
import { Gift, ArrowLeft, Shield, Zap, Lock, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function About() {
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
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-600">
              <Gift className="h-10 w-10 text-white" />
            </div>
            <h1 className="mt-6 text-3xl font-bold">About GiftCard Pro</h1>
            <p className="mt-2 text-gray-500">
              The most secure platform for trading gift cards
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
              <Shield className="h-8 w-8 text-indigo-600" />
              <h3 className="mt-4 font-semibold">Secure Trading</h3>
              <p className="mt-2 text-sm text-gray-500">
                Advanced fraud detection and AI-powered verification ensure safe transactions.
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
              <Zap className="h-8 w-8 text-yellow-500" />
              <h3 className="mt-4 font-semibold">Instant Payouts</h3>
              <p className="mt-2 text-sm text-gray-500">
                Get paid quickly with our automated processing system.
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
              <Lock className="h-8 w-8 text-green-600" />
              <h3 className="mt-4 font-semibold">Data Protection</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your data is encrypted and protected with industry-standard security.
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
              <Headphones className="h-8 w-8 text-blue-600" />
              <h3 className="mt-4 font-semibold">24/7 Support</h3>
              <p className="mt-2 text-sm text-gray-500">
                Our support team is always ready to help you with any issues.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} GiftCard Pro. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
