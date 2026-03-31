import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  ExternalLink
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

interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  type: string;
  status: string;
  amount: number;
  fee: number;
  netAmount: number;
  walletType: string;
  referenceCode: string | null;
  blockchainHash: string | null;
  bankReference: string | null;
  fraudScore: number;
  createdAt: string;
  completedAt: string | null;
  user: {
    fullName: string;
    email: string;
    username: string;
  };
  wallet: {
    type: string;
  };
}

export function TransactionManagement() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Dialog states
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showReverseDialog, setShowReverseDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, filters]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
      });

      const response = await api.get(`/admin/transactions?${params}`);
      
      if (response.data.success) {
        setTransactions(response.data.data.transactions);
        setPagination(response.data.data.pagination);
      }
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchTransactions();
  };

  const handleApprove = async (status: 'COMPLETED' | 'REJECTED') => {
    if (!selectedTransaction) return;
    
    setIsSubmitting(true);
    try {
      const response = await api.post(`/admin/transactions/${selectedTransaction.id}/approve`, {
        status,
        notes: actionNotes,
      });

      if (response.data.success) {
        // Update local state
        setTransactions(transactions.map(t => 
          t.id === selectedTransaction.id 
            ? { ...t, status, adminNotes: actionNotes }
            : t
        ));
        setShowApproveDialog(false);
        setActionNotes('');
        setSelectedTransaction(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReverse = async () => {
    if (!selectedTransaction) return;

    setIsSubmitting(true);
    try {
      const response = await api.post(`/admin/transactions/${selectedTransaction.id}/reverse`, {
        reason: actionNotes,
      });

      if (response.data.success) {
        // Update local state
        setTransactions(transactions.map(t => 
          t.id === selectedTransaction.id 
            ? { ...t, status: 'REVERSED' }
            : t
        ));
        setShowReverseDialog(false);
        setActionNotes('');
        setSelectedTransaction(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reverse transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      PROCESSING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
      REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
      REVERSED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      UNDER_REVIEW: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    };
    return styles[status] || 'bg-slate-500/10 text-slate-400';
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      DEPOSIT: 'bg-green-500/10 text-green-400',
      WITHDRAWAL: 'bg-red-500/10 text-red-400',
      GIFT_CARD_SALE: 'bg-amber-500/10 text-amber-400',
      GIFT_CARD_PURCHASE: 'bg-blue-500/10 text-blue-400',
      TRANSFER_SEND: 'bg-red-500/10 text-red-400',
      TRANSFER_RECEIVE: 'bg-green-500/10 text-green-400',
      ADMIN_ADJUSTMENT: 'bg-purple-500/10 text-purple-400',
    };
    return styles[type] || 'bg-slate-500/10 text-slate-400';
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Transaction Management</h1>
            <p className="text-slate-400 mt-1">Monitor and manage all platform transactions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchTransactions} className="border-slate-600">
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
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    placeholder="Search by ID, hash, or reference..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </form>

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
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="REVERSED">Reversed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters({ ...filters, type: value })}
                >
                  <SelectTrigger className="w-36 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="DEPOSIT">Deposit</SelectItem>
                    <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                    <SelectItem value="GIFT_CARD_SALE">Gift Card Sale</SelectItem>
                    <SelectItem value="ADMIN_ADJUSTMENT">Admin Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-400">Transaction</TableHead>
                    <TableHead className="text-slate-400">User</TableHead>
                    <TableHead className="text-slate-400">Type</TableHead>
                    <TableHead className="text-slate-400">Amount</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Date</TableHead>
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
                  ) : transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id} className="border-slate-700">
                        <TableCell>
                          <div>
                            <p className="font-medium text-white font-mono text-sm">
                              {transaction.id.slice(0, 8)}...
                            </p>
                            <p className="text-xs text-slate-400">{transaction.walletType}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">{transaction.user.fullName}</p>
                            <p className="text-sm text-slate-400">@{transaction.user.username}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getTypeBadge(transaction.type)}>
                            {transaction.type.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">
                              {formatCurrency(transaction.amount, transaction.walletType)}
                            </p>
                            <p className="text-xs text-slate-400">
                              Fee: {formatCurrency(transaction.fee, transaction.walletType)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadge(transaction.status)}>
                            {transaction.status}
                          </Badge>
                          {transaction.fraudScore > 50 && (
                            <Badge className="ml-2 bg-red-500 text-white text-xs">
                              Fraud: {transaction.fraudScore}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {formatDate(transaction.createdAt)}
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
                                  setSelectedTransaction(transaction);
                                  setShowDetailsDialog(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              
                              {transaction.status === 'PENDING' && (
                                <>
                                  <DropdownMenuSeparator className="bg-slate-700" />
                                  <DropdownMenuItem 
                                    className="text-green-400 cursor-pointer"
                                    onClick={() => {
                                      setSelectedTransaction(transaction);
                                      setShowApproveDialog(true);
                                    }}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-400 cursor-pointer"
                                    onClick={() => {
                                      setSelectedTransaction(transaction);
                                      setShowApproveDialog(true);
                                    }}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              {transaction.status === 'COMPLETED' && (
                                <>
                                  <DropdownMenuSeparator className="bg-slate-700" />
                                  <DropdownMenuItem 
                                    className="text-purple-400 cursor-pointer"
                                    onClick={() => {
                                      setSelectedTransaction(transaction);
                                      setShowReverseDialog(true);
                                    }}
                                  >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Reverse
                                  </DropdownMenuItem>
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
                {pagination.total} transactions
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

        {/* Approve/Reject Dialog */}
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Review Transaction</DialogTitle>
              <DialogDescription className="text-slate-400">
                Transaction: {selectedTransaction?.id.slice(0, 16)}...
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">User</p>
                    <p className="text-white font-medium">{selectedTransaction?.user.fullName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Amount</p>
                    <p className="text-white font-medium">
                      {selectedTransaction && formatCurrency(selectedTransaction.amount, selectedTransaction.walletType)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Type</p>
                    <p className="text-white font-medium">{selectedTransaction?.type.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Wallet</p>
                    <p className="text-white font-medium">{selectedTransaction?.walletType}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Notes (optional)</label>
                <Textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Add notes about this decision..."
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowApproveDialog(false)}
                className="border-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleApprove('REJECTED')}
                disabled={isSubmitting}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                Reject
              </Button>
              <Button
                onClick={() => handleApprove('COMPLETED')}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reverse Dialog */}
        <Dialog open={showReverseDialog} onOpenChange={setShowReverseDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Reverse Transaction</DialogTitle>
              <DialogDescription className="text-slate-400">
                This will reverse the transaction and adjust the user's balance.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Transaction ID</p>
                    <p className="text-white font-mono">{selectedTransaction?.id.slice(0, 16)}...</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Amount to Reverse</p>
                    <p className="text-white font-medium">
                      {selectedTransaction && formatCurrency(selectedTransaction.netAmount, selectedTransaction.walletType)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Reason for reversal *</label>
                <Textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Enter reason for reversal..."
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowReverseDialog(false)}
                className="border-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReverse}
                disabled={isSubmitting || !actionNotes}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Reverse Transaction
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 p-3 rounded">
                    <p className="text-xs text-slate-400">Transaction ID</p>
                    <p className="text-sm font-mono text-white">{selectedTransaction.id}</p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded">
                    <p className="text-xs text-slate-400">Reference Code</p>
                    <p className="text-sm text-white">{selectedTransaction.referenceCode || '-'}</p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded">
                    <p className="text-xs text-slate-400">User</p>
                    <p className="text-sm text-white">{selectedTransaction.user.fullName}</p>
                    <p className="text-xs text-slate-400">{selectedTransaction.user.email}</p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded">
                    <p className="text-xs text-slate-400">Amount</p>
                    <p className="text-sm text-white">
                      {formatCurrency(selectedTransaction.amount, selectedTransaction.walletType)}
                    </p>
                    <p className="text-xs text-slate-400">
                      Fee: {formatCurrency(selectedTransaction.fee, selectedTransaction.walletType)} | 
                      Net: {formatCurrency(selectedTransaction.netAmount, selectedTransaction.walletType)}
                    </p>
                  </div>
                </div>

                {selectedTransaction.blockchainHash && (
                  <div className="bg-slate-700/50 p-3 rounded">
                    <p className="text-xs text-slate-400">Blockchain Hash</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono text-white truncate flex-1">
                        {selectedTransaction.blockchainHash}
                      </p>
                      <a
                        href={`https://tronscan.org/#/transaction/${selectedTransaction.blockchainHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-500 hover:text-amber-400"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}

                {selectedTransaction.bankReference && (
                  <div className="bg-slate-700/50 p-3 rounded">
                    <p className="text-xs text-slate-400">Bank Reference</p>
                    <p className="text-sm text-white">{selectedTransaction.bankReference}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 p-3 rounded">
                    <p className="text-xs text-slate-400">Created At</p>
                    <p className="text-sm text-white">{formatDate(selectedTransaction.createdAt)}</p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded">
                    <p className="text-xs text-slate-400">Completed At</p>
                    <p className="text-sm text-white">{formatDate(selectedTransaction.completedAt)}</p>
                  </div>
                </div>

                {selectedTransaction.fraudScore > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded">
                    <p className="text-xs text-red-400">Fraud Score: {selectedTransaction.fraudScore}</p>
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
      </div>
    </AdminLayout>
  );
}
