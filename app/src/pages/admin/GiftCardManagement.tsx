import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Image,
  Brain,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/services/api';
import { AdminLayout } from './AdminLayout';

interface GiftCard {
  id: string;
  userId: string;
  brand: string;
  country: string;
  cardValue: number;
  currency: string;
  pinCode: string;
  ocrResult: string | null;
  ocrConfidence: number;
  fraudScore: number;
  reviewCategory: string | null;
  status: string;
  imageFront: string;
  imageBack: string;
  imageScratched: string | null;
  rate: number;
  payoutAmount: number;
  adminNotes: string | null;
  createdAt: string;
  processedAt: string | null;
  user: {
    fullName: string;
    email: string;
    username: string;
    lastLoginIp: string | null;
    deviceFingerprint: string | null;
  };
}

export function GiftCardManagement() {
  const navigate = useNavigate();
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'PENDING',
    brand: '',
    reviewCategory: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Dialog states
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState({
    status: 'APPROVED',
    notes: '',
    reviewCategory: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchGiftCards();
  }, [pagination.page, filters]);

  const fetchGiftCards = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.brand && { brand: filters.brand }),
        ...(filters.reviewCategory && { reviewCategory: filters.reviewCategory }),
      });

      const response = await api.get(`/admin/giftcards?${params}`);
      
      if (response.data.success) {
        setGiftCards(response.data.data.giftCards);
        setPagination(response.data.data.pagination);
      }
    } catch (err: any) {
      console.error('Failed to fetch gift cards:', err);
      setError(err.response?.data?.message || 'Failed to load gift cards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedCard) return;
    
    setIsSubmitting(true);
    try {
      const response = await api.post(`/admin/giftcards/${selectedCard.id}/review`, {
        status: reviewData.status,
        notes: reviewData.notes,
        reviewCategory: reviewData.reviewCategory,
      });

      if (response.data.success) {
        setGiftCards(giftCards.filter(c => c.id !== selectedCard.id));
        setShowReviewDialog(false);
        setReviewData({ status: 'APPROVED', notes: '', reviewCategory: '' });
        setSelectedCard(null);
        fetchGiftCards();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to review gift card');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverrideAI = async (newStatus: string) => {
    if (!selectedCard) return;

    setIsSubmitting(true);
    try {
      const response = await api.post(`/admin/giftcards/${selectedCard.id}/override`, {
        newStatus,
        reason: reviewData.notes,
      });

      if (response.data.success) {
        setGiftCards(giftCards.map(c => 
          c.id === selectedCard.id 
            ? { ...c, status: newStatus }
            : c
        ));
        setShowReviewDialog(false);
        setReviewData({ status: 'APPROVED', notes: '', reviewCategory: '' });
        setSelectedCard(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to override AI decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      AI_PROCESSING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      AI_APPROVED: 'bg-green-500/10 text-green-400 border-green-500/20',
      AI_REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
      ADMIN_REVIEW: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      APPROVED: 'bg-green-500/10 text-green-400 border-green-500/20',
      REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
      COMPLETED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    };
    return styles[status] || 'bg-slate-500/10 text-slate-400';
  };

  const getReviewCategoryBadge = (category: string | null) => {
    if (!category) return null;
    const styles: Record<string, string> = {
      BLURRED: 'bg-yellow-500/10 text-yellow-400',
      EDITED: 'bg-red-500/10 text-red-400',
      DUPLICATE: 'bg-orange-500/10 text-orange-400',
      PIN_MISMATCH: 'bg-purple-500/10 text-purple-400',
      LOW_CONFIDENCE: 'bg-blue-500/10 text-blue-400',
    };
    return styles[category] || 'bg-slate-500/10 text-slate-400';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const viewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageDialog(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Gift Card Management</h1>
            <p className="text-slate-400 mt-1">Review and manage gift card submissions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchGiftCards} className="border-slate-600">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" className="border-slate-600">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    placeholder="Search by brand or user..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger className="w-36 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="AI_PROCESSING">AI Processing</SelectItem>
                    <SelectItem value="AI_APPROVED">AI Approved</SelectItem>
                    <SelectItem value="AI_REJECTED">AI Rejected</SelectItem>
                    <SelectItem value="ADMIN_REVIEW">Admin Review</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.reviewCategory}
                  onValueChange={(value) => setFilters({ ...filters, reviewCategory: value })}
                >
                  <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="BLURRED">Blurred</SelectItem>
                    <SelectItem value="EDITED">Edited</SelectItem>
                    <SelectItem value="DUPLICATE">Duplicate</SelectItem>
                    <SelectItem value="PIN_MISMATCH">PIN Mismatch</SelectItem>
                    <SelectItem value="LOW_CONFIDENCE">Low Confidence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gift Cards Table */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-400">Card</TableHead>
                    <TableHead className="text-slate-400">User</TableHead>
                    <TableHead className="text-slate-400">Value</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">AI Analysis</TableHead>
                    <TableHead className="text-slate-400">Submitted</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" />
                      </TableCell>
                    </TableRow>
                  ) : giftCards.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No gift cards found
                      </TableCell>
                    </TableRow>
                  ) : (
                    giftCards.map((card) => (
                      <TableRow key={card.id} className="border-slate-700">
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">{card.brand}</p>
                            <p className="text-xs text-slate-400">{card.country}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">{card.user.fullName}</p>
                            <p className="text-sm text-slate-400">@{card.user.username}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">
                              {formatCurrency(card.cardValue)}
                            </p>
                            <p className="text-xs text-green-400">
                              Payout: {formatCurrency(card.payoutAmount)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadge(card.status)}>
                            {card.status.replace(/_/g, ' ')}
                          </Badge>
                          {card.reviewCategory && (
                            <Badge className={`ml-2 text-xs ${getReviewCategoryBadge(card.reviewCategory)}`}>
                              {card.reviewCategory}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="text-slate-400">
                              OCR: <span className={card.ocrConfidence > 0.8 ? 'text-green-400' : 'text-amber-400'}>
                                {(card.ocrConfidence * 100).toFixed(0)}%
                              </span>
                            </p>
                            {card.fraudScore > 0 && (
                              <p className="text-slate-400">
                                Fraud: <span className={card.fraudScore > 50 ? 'text-red-400' : 'text-green-400'}>
                                  {card.fraudScore}
                                </span>
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {formatDate(card.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-slate-400">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                              <DropdownMenuItem 
                                className="text-slate-300 cursor-pointer"
                                onClick={() => {
                                  setSelectedCard(card);
                                  setShowDetailsDialog(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              
                              {(card.status === 'PENDING' || card.status === 'AI_APPROVED' || card.status === 'AI_REJECTED' || card.status === 'ADMIN_REVIEW') && (
                                <>
                                  <DropdownMenuSeparator className="bg-slate-700" />
                                  <DropdownMenuItem 
                                    className="text-green-400 cursor-pointer"
                                    onClick={() => {
                                      setSelectedCard(card);
                                      setReviewData({ ...reviewData, status: 'APPROVED' });
                                      setShowReviewDialog(true);
                                    }}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-400 cursor-pointer"
                                    onClick={() => {
                                      setSelectedCard(card);
                                      setReviewData({ ...reviewData, status: 'REJECTED' });
                                      setShowReviewDialog(true);
                                    }}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                  
                                  {(card.status === 'AI_APPROVED' || card.status === 'AI_REJECTED') && (
                                    <DropdownMenuItem 
                                      className="text-amber-400 cursor-pointer"
                                      onClick={() => {
                                        setSelectedCard(card);
                                        handleOverrideAI(card.status === 'AI_APPROVED' ? 'REJECTED' : 'APPROVED');
                                      }}
                                    >
                                      <Brain className="w-4 h-4 mr-2" />
                                      Override AI
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} gift cards
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="border-slate-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                  className="border-slate-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Review Gift Card</DialogTitle>
              <DialogDescription className="text-slate-400">
                {selectedCard?.brand} - {formatCurrency(selectedCard?.cardValue || 0)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Card Images Preview */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => viewImage(selectedCard?.imageFront || '')}
                  className="aspect-video bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-600 transition-colors"
                >
                  <Image className="w-6 h-6 text-slate-400" />
                </button>
                <button
                  onClick={() => viewImage(selectedCard?.imageBack || '')}
                  className="aspect-video bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-600 transition-colors"
                >
                  <Image className="w-6 h-6 text-slate-400" />
                </button>
                {selectedCard?.imageScratched && (
                  <button
                    onClick={() => viewImage(selectedCard.imageScratched || '')}
                    className="aspect-video bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-600 transition-colors"
                  >
                    <Image className="w-6 h-6 text-slate-400" />
                  </button>
                )}
              </div>

              {/* PIN Info */}
              <div className="bg-slate-700/50 p-3 rounded">
                <p className="text-xs text-slate-400">Extracted PIN (OCR)</p>
                <p className="text-lg font-mono text-white tracking-wider">
                  {selectedCard?.pinCode || 'N/A'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Confidence: {(selectedCard?.ocrConfidence || 0) * 100}%
                </p>
              </div>

              {/* Review Category */}
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Review Category</label>
                <Select
                  value={reviewData.reviewCategory}
                  onValueChange={(value) => setReviewData({ ...reviewData, reviewCategory: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="BLURRED">Blurred Image</SelectItem>
                    <SelectItem value="EDITED">Edited/Tampered</SelectItem>
                    <SelectItem value="DUPLICATE">Duplicate</SelectItem>
                    <SelectItem value="PIN_MISMATCH">PIN Mismatch</SelectItem>
                    <SelectItem value="LOW_CONFIDENCE">Low OCR Confidence</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Notes</label>
                <Textarea
                  value={reviewData.notes}
                  onChange={(e) => setReviewData({ ...reviewData, notes: e.target.value })}
                  placeholder="Add notes about this review..."
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowReviewDialog(false)}
                className="border-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReview}
                disabled={isSubmitting}
                className={reviewData.status === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : reviewData.status === 'APPROVED' ? (
                  'Approve'
                ) : (
                  'Reject'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Gift Card Details</DialogTitle>
            </DialogHeader>
            
            {selectedCard && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 p-3 rounded">
                    <p className="text-xs text-slate-400">Card ID</p>
                    <p className="text-sm font-mono text-white">{selectedCard.id}</p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded">
                    <p className="text-xs text-slate-400">Brand</p>
                    <p className="text-sm text-white">{selectedCard.brand}</p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded">
                    <p className="text-xs text-slate-400">Value</p>
                    <p className="text-sm text-white">{formatCurrency(selectedCard.cardValue)}</p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded">
                    <p className="text-xs text-slate-400">Payout Amount</p>
                    <p className="text-sm text-green-400">{formatCurrency(selectedCard.payoutAmount)}</p>
                  </div>
                </div>

                <div className="bg-slate-700/50 p-3 rounded">
                  <p className="text-xs text-slate-400">User Information</p>
                  <p className="text-sm text-white">{selectedCard.user.fullName}</p>
                  <p className="text-sm text-slate-400">{selectedCard.user.email}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    IP: {selectedCard.user.lastLoginIp || 'N/A'} | 
                    Device: {selectedCard.user.deviceFingerprint ? 'Tracked' : 'N/A'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 p-3 rounded">
                    <p className="text-xs text-slate-400">Submitted</p>
                    <p className="text-sm text-white">{formatDate(selectedCard.createdAt)}</p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded">
                    <p className="text-xs text-slate-400">Processed</p>
                    <p className="text-sm text-white">{formatDate(selectedCard.processedAt)}</p>
                  </div>
                </div>

                {selectedCard.adminNotes && (
                  <div className="bg-slate-700/50 p-3 rounded">
                    <p className="text-xs text-slate-400">Admin Notes</p>
                    <p className="text-sm text-white">{selectedCard.adminNotes}</p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                onClick={() => setShowDetailsDialog(false)}
                className="border-slate-600"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image Viewer Dialog */}
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Card Image</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center bg-slate-900 rounded-lg overflow-hidden">
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Gift Card"
                  className="max-w-full max-h-[70vh] object-contain"
                />
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={() => setShowImageDialog(false)}
                className="border-slate-600"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
