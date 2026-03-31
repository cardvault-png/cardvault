import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  MoreHorizontal,
  Ban,
  CheckCircle,
  UserX,
  UserCheck,
  Eye,
  Wallet,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download
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
import { api } from '@/services/api';
import { AdminLayout } from './AdminLayout';

interface User {
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  username: string;
  role: string;
  kycStatus: string;
  isBanned: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  _count: {
    transactions: number;
    giftCards: number;
  };
}

export function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    kycStatus: '',
    isBanned: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Dialog states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showBalanceDialog, setShowBalanceDialog] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [balanceData, setBalanceData] = useState({
    walletType: 'USD',
    amount: '',
    operation: 'ADD',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(filters.role && { role: filters.role }),
        ...(filters.kycStatus && { kycStatus: filters.kycStatus }),
        ...(filters.isBanned && { isBanned: filters.isBanned }),
      });

      const response = await api.get(`/admin/users?${params}`);
      
      if (response.data.success) {
        setUsers(response.data.data.users);
        setPagination(response.data.data.pagination);
      }
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchUsers();
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      const response = await api.post(`/admin/users/${selectedUser.id}/ban`, {
        isBanned: !selectedUser.isBanned,
        reason: banReason,
      });

      if (response.data.success) {
        // Update local state
        setUsers(users.map(u => 
          u.id === selectedUser.id 
            ? { ...u, isBanned: !u.isBanned }
            : u
        ));
        setShowBanDialog(false);
        setBanReason('');
        setSelectedUser(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjustBalance = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const response = await api.post(`/admin/users/${selectedUser.id}/balance`, {
        walletType: balanceData.walletType,
        amount: parseFloat(balanceData.amount),
        operation: balanceData.operation,
        reason: balanceData.reason,
      });

      if (response.data.success) {
        setShowBalanceDialog(false);
        setBalanceData({
          walletType: 'USD',
          amount: '',
          operation: 'ADD',
          reason: '',
        });
        setSelectedUser(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to adjust balance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getKycBadge = (status: string) => {
    const styles: Record<string, string> = {
      NOT_SUBMITTED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      APPROVED: 'bg-green-500/10 text-green-400 border-green-500/20',
      REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return styles[status] || styles.NOT_SUBMITTED;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-slate-400 mt-1">Manage platform users and their accounts</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchUsers} className="border-slate-600">
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
                    placeholder="Search by name, email, or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </form>

              <div className="flex gap-2 flex-wrap">
                <Select
                  value={filters.role}
                  onValueChange={(value) => setFilters({ ...filters, role: value })}
                >
                  <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="">All Roles</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.kycStatus}
                  onValueChange={(value) => setFilters({ ...filters, kycStatus: value })}
                >
                  <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="KYC" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="">All KYC</SelectItem>
                    <SelectItem value="NOT_SUBMITTED">Not Submitted</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.isBanned}
                  onValueChange={(value) => setFilters({ ...filters, isBanned: value })}
                >
                  <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="true">Banned</SelectItem>
                    <SelectItem value="false">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-400">User</TableHead>
                    <TableHead className="text-slate-400">Role</TableHead>
                    <TableHead className="text-slate-400">KYC Status</TableHead>
                    <TableHead className="text-slate-400">2FA</TableHead>
                    <TableHead className="text-slate-400">Last Login</TableHead>
                    <TableHead className="text-slate-400">Activity</TableHead>
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
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} className="border-slate-700">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {user.fullName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-white">{user.fullName}</p>
                              <p className="text-sm text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={user.role === 'SUPER_ADMIN' 
                              ? 'border-purple-500 text-purple-400' 
                              : user.role === 'ADMIN' 
                                ? 'border-amber-500 text-amber-400'
                                : 'border-slate-500 text-slate-400'
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getKycBadge(user.kycStatus)}>
                            {user.kycStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.twoFactorEnabled ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {formatDate(user.lastLoginAt)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-400">
                            <span className="text-amber-500">{user._count.transactions}</span> txns
                            {' • '}
                            <span className="text-amber-500">{user._count.giftCards}</span> cards
                          </div>
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
                                onClick={() => navigate(`/admin/users/${user.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-slate-300 cursor-pointer"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowBalanceDialog(true);
                                }}
                              >
                                <Wallet className="w-4 h-4 mr-2" />
                                Adjust Balance
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-slate-700" />
                              <DropdownMenuItem 
                                className={user.isBanned ? 'text-green-400 cursor-pointer' : 'text-red-400 cursor-pointer'}
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowBanDialog(true);
                                }}
                              >
                                {user.isBanned ? (
                                  <>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Unban User
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-4 h-4 mr-2" />
                                    Ban User
                                  </>
                                )}
                              </DropdownMenuItem>
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
                {pagination.total} users
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

        {/* Ban/Unban Dialog */}
        <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>
                {selectedUser?.isBanned ? 'Unban User' : 'Ban User'}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {selectedUser?.isBanned 
                  ? `Are you sure you want to unban ${selectedUser?.fullName}?`
                  : `Are you sure you want to ban ${selectedUser?.fullName}?`
                }
              </DialogDescription>
            </DialogHeader>
            
            {!selectedUser?.isBanned && (
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Reason for ban</label>
                <Input
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter reason..."
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowBanDialog(false)}
                className="border-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBanUser}
                disabled={isSubmitting || (!selectedUser?.isBanned && !banReason)}
                className={selectedUser?.isBanned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : selectedUser?.isBanned ? (
                  'Unban User'
                ) : (
                  'Ban User'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Adjust Balance Dialog */}
        <Dialog open={showBalanceDialog} onOpenChange={setShowBalanceDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Adjust User Balance</DialogTitle>
              <DialogDescription className="text-slate-400">
                Adjust balance for {selectedUser?.fullName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Wallet Type</label>
                <Select
                  value={balanceData.walletType}
                  onValueChange={(value) => setBalanceData({ ...balanceData, walletType: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Operation</label>
                <Select
                  value={balanceData.operation}
                  onValueChange={(value) => setBalanceData({ ...balanceData, operation: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="ADD">Add Funds</SelectItem>
                    <SelectItem value="SUBTRACT">Subtract Funds</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  value={balanceData.amount}
                  onChange={(e) => setBalanceData({ ...balanceData, amount: e.target.value })}
                  placeholder="0.00"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Reason</label>
                <Input
                  value={balanceData.reason}
                  onChange={(e) => setBalanceData({ ...balanceData, reason: e.target.value })}
                  placeholder="Enter reason for adjustment..."
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowBalanceDialog(false)}
                className="border-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdjustBalance}
                disabled={isSubmitting || !balanceData.amount || !balanceData.reason}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Adjust Balance'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
