import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CreditCard,
  Gift,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  Shield,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import { AdminLayout } from './AdminLayout';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  pendingTransactions: number;
  totalGiftCards: number;
  pendingGiftCards: number;
  totalDeposits: number;
  totalWithdrawals: number;
  adminBalance: number;
}

interface ActivityItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  user?: {
    fullName: string;
    email: string;
  };
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.data.stats);
        setRecentActivity(response.data.data.recentActivity);
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActivityIcon = (action: string) => {
    if (action.includes('CREATE')) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (action.includes('UPDATE')) return <Activity className="w-4 h-4 text-blue-500" />;
    if (action.includes('DELETE')) return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-slate-500" />;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-slate-400">{error}</p>
            <Button onClick={fetchDashboardData} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 mt-1">Real-time platform overview</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-green-500 text-green-400">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
              System Online
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Total Users</CardDescription>
              <CardTitle className="text-3xl text-white">{stats?.totalUsers.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-slate-400">
                <Users className="w-4 h-4 mr-2" />
                {stats?.activeUsers.toLocaleString()} active this week
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Total Transactions</CardDescription>
              <CardTitle className="text-3xl text-white">{stats?.totalTransactions.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2 text-amber-500" />
                <span className="text-amber-500">{stats?.pendingTransactions} pending</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Gift Cards</CardDescription>
              <CardTitle className="text-3xl text-white">{stats?.totalGiftCards.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm">
                <Gift className="w-4 h-4 mr-2 text-amber-500" />
                <span className="text-amber-500">{stats?.pendingGiftCards} pending review</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Admin Balance</CardDescription>
              <CardTitle className="text-3xl text-white">{formatCurrency(stats?.adminBalance || 0)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-slate-400">
                <DollarSign className="w-4 h-4 mr-2" />
                Available for distribution
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Total Deposits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-400">
                {formatCurrency(stats?.totalDeposits || 0)}
              </div>
              <p className="text-slate-400 mt-2">Lifetime deposit volume</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingDown className="w-5 h-5 mr-2 text-red-500" />
                Total Withdrawals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-400">
                {formatCurrency(stats?.totalWithdrawals || 0)}
              </div>
              <p className="text-slate-400 mt-2">Lifetime withdrawal volume</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-slate-400">
              Latest system events and admin actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No recent activity</p>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                  >
                    <div className="mt-1">{getActivityIcon(activity.action)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{activity.action}</span>
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                          {activity.entityType}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">
                        by {activity.user?.fullName || 'System'} • {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 border-slate-600 hover:bg-slate-700"
                onClick={() => navigate('/admin/users')}
              >
                <Users className="w-5 h-5 mr-2" />
                Manage Users
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 border-slate-600 hover:bg-slate-700"
                onClick={() => navigate('/admin/transactions')}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Transactions
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 border-slate-600 hover:bg-slate-700"
                onClick={() => navigate('/admin/giftcards')}
              >
                <Gift className="w-5 h-5 mr-2" />
                Gift Cards
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 border-slate-600 hover:bg-slate-700"
                onClick={() => navigate('/admin/audit-logs')}
              >
                <Shield className="w-5 h-5 mr-2" />
                Audit Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
