import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, Check, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

export function Kyc() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<{ [key: string]: File | null }>({});
  const [documentType, setDocumentType] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Implementation would call KYC API
    setTimeout(() => {
      setIsLoading(false);
      refreshUser();
    }, 2000);
  };

  if (user?.kycStatus === 'APPROVED') {
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mx-auto">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">KYC Verified</h1>
        <p className="text-gray-500">Your identity has been verified successfully.</p>
      </div>
    );
  }

  if (user?.kycStatus === 'PENDING') {
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 mx-auto">
          <Loader2 className="h-10 w-10 text-yellow-600 animate-spin" />
        </div>
        <h1 className="text-2xl font-bold">KYC Under Review</h1>
        <p className="text-gray-500">Your documents are being reviewed. This may take 1-2 business days.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">KYC Verification</h1>

      <Card>
        <CardHeader>
          <CardTitle>Submit Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PASSPORT">Passport</SelectItem>
                  <SelectItem value="ID_CARD">National ID Card</SelectItem>
                  <SelectItem value="DRIVERS_LICENSE">Driver's License</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Front Image</Label>
              <Input type="file" accept="image/*" />
            </div>

            <div>
              <Label>Back Image</Label>
              <Input type="file" accept="image/*" />
            </div>

            <div>
              <Label>Selfie with Document</Label>
              <Input type="file" accept="image/*" />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Submit for Verification
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
