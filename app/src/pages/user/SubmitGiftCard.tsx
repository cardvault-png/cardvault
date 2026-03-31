import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Gift, Upload, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { giftCardService } from '@/services/giftcard';

export function SubmitGiftCard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    imageFront: null,
    imageBack: null,
    imageScratched: null,
  });
  const [formData, setFormData] = useState({
    brand: '',
    country: 'US',
    cardValue: '',
    pinCode: '',
  });

  const { data: rates } = useQuery({
    queryKey: ['giftcard-rates'],
    queryFn: () => giftCardService.getRates(),
  });

  const brands = [...new Set(rates?.map((r: any) => r.brand) || ['Amazon', 'Apple', 'Google Play', 'Steam'])];

  const handleFileChange = (field: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append('brand', formData.brand);
      data.append('country', formData.country);
      data.append('cardValue', formData.cardValue);
      data.append('pinCode', formData.pinCode);
      
      if (files.imageFront) data.append('imageFront', files.imageFront);
      if (files.imageBack) data.append('imageBack', files.imageBack);
      if (files.imageScratched) data.append('imageScratched', files.imageScratched);

      await giftCardService.submitGiftCard(data);
      navigate('/gift-cards');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit gift card');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Sell Gift Card</h1>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Card Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Brand</Label>
              <Select
                value={formData.brand}
                onValueChange={(value) => setFormData({ ...formData, brand: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {(brands as string[]).map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Card Value ($)</Label>
              <Input
                type="number"
                placeholder="Enter card value"
                value={formData.cardValue}
                onChange={(e) => setFormData({ ...formData, cardValue: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>PIN Code</Label>
              <Input
                type="text"
                placeholder="Enter card PIN"
                value={formData.pinCode}
                onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Upload Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Front Image (Required)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('imageFront', e.target.files?.[0] || null)}
                required
              />
            </div>
            <div>
              <Label>Back Image (Required)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('imageBack', e.target.files?.[0] || null)}
                required
              />
            </div>
            <div>
              <Label>Scratched Area (Optional)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('imageScratched', e.target.files?.[0] || null)}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="mt-6 w-full" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Gift className="mr-2 h-4 w-4" />
          )}
          Submit Gift Card
        </Button>
      </form>
    </div>
  );
}
