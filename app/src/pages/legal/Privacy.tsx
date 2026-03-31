import { Link } from 'react-router-dom';
import { Gift, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Privacy() {
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
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Privacy Policy</h1>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h2>1. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul>
              <li>Personal identification information (name, email, phone)</li>
              <li>KYC documents for verification</li>
              <li>Transaction history</li>
              <li>Device and IP information</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and maintain our services</li>
              <li>Verify your identity</li>
              <li>Process transactions</li>
              <li>Prevent fraud and abuse</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data.
              All sensitive information is encrypted both in transit and at rest.
            </p>

            <h2>4. Data Sharing</h2>
            <p>
              We do not sell your personal information. We may share data with:
            </p>
            <ul>
              <li>Payment processors</li>
              <li>Identity verification services</li>
              <li>Law enforcement when required by law</li>
            </ul>

            <h2>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
