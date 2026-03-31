import { useState, useEffect, useRef } from 'react';
import {
  Eye,
  EyeOff,
  Activity,
  AlertTriangle,
  Shield,
  User,
  Image,
  CreditCard,
  MapPin,
  Smartphone,
  Zap,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/services/api';
import { AdminLayout } from './AdminLayout';

interface LiveActivity {
  id: string;
  type: 'UPLOAD' | 'SUBMIT' | 'PAYMENT' | 'LOGIN' | 'ACTION';
  user: {
    id: string;
    fullName: string;
    email: string;
    ip: string;
    device: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  action: string;
  details: any;
  timestamp: string;
  fraudScore: number;
  imageUrl?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'FLAGGED';
}

interface AlertItem {
  id: string;
  type: 'FRAUD' | 'DUPLICATE' | 'BLURRED' | 'EDITED' | 'RAPID_UPLOAD' | 'HIGH_VALUE' | 'PIN_MISMATCH';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  userId: string;
  userName: string;
  giftCardId?: string;
  timestamp: string;
  acknowledged: boolean;
}

interface UserRiskProfile {
  userId: string;
  fullName: string;
  email: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  fraudScore: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalGiftCards: number;
  approvedCards: number;
  rejectedCards: number;
  ipHistory: string[];
  deviceHistory: string[];
  uploadPatterns: {
    avgTimeBetweenUploads: number;
    rapidUploadCount: number;
    unusualHoursCount: number;
  };
  behaviorFlags: string[];
  lastActivity: string;
}

interface ImageComparison {
  originalId: string;
  originalImage: string;
  duplicateId: string;
  duplicateImage: string;
  similarity: number;
  matchType: 'EXACT' | 'HIGH' | 'MODERATE';
  originalUser: string;
  duplicateUser: string;
}

export function AdminLiveWall() {
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [riskProfiles, setRiskProfiles] = useState<UserRiskProfile[]>([]);
  const [imageComparisons, setImageComparisons] = useState<ImageComparison[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<LiveActivity | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<UserRiskProfile | null>(null);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showImageCompareDialog, setShowImageCompareDialog] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState<ImageComparison | null>(null);
  const [isStealthMode, setIsStealthMode] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulate live data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Generate random activity
      const newActivity: LiveActivity = generateRandomActivity();
      setActivities(prev => [newActivity, ...prev].slice(0, 50));

      // Generate random alert occasionally
      if (Math.random() > 0.7) {
        const newAlert = generateRandomAlert();
        setAlerts(prev => [newAlert, ...prev]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Initial data
  useEffect(() => {
    setActivities(Array.from({ length: 10 }, (_, i) => generateRandomActivity(i)));
    setAlerts(Array.from({ length: 5 }, (_, i) => generateRandomAlert(i)));
    setRiskProfiles(generateRiskProfiles());
    setImageComparisons(generateImageComparisons());
  }, []);

  const generateRandomActivity = (offset = 0): LiveActivity => {
    const types: LiveActivity['type'][] = ['UPLOAD', 'SUBMIT', 'PAYMENT', 'LOGIN', 'ACTION'];
    const riskLevels: LiveActivity['user']['riskLevel'][] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const brands = ['Amazon', 'Steam', 'iTunes', 'Google Play', 'Visa', 'Mastercard'];
    
    return {
      id: `act-${Date.now()}-${offset}`,
      type: types[Math.floor(Math.random() * types.length)],
      user: {
        id: `user-${Math.floor(Math.random() * 1000)}`,
        fullName: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown'][Math.floor(Math.random() * 4)],
        email: `user${Math.floor(Math.random() * 1000)}@example.com`,
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        device: ['Chrome/Windows', 'Safari/Mac', 'Firefox/Linux', 'Mobile/iOS'][Math.floor(Math.random() * 4)],
        riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      },
      action: ['Uploading image', 'Submitting card', 'Making payment', 'Logging in', 'Viewing dashboard'][Math.floor(Math.random() * 5)],
      details: {
        brand: brands[Math.floor(Math.random() * brands.length)],
        value: [25, 50, 100, 200, 500][Math.floor(Math.random() * 5)],
      },
      timestamp: new Date(Date.now() - offset * 5000).toISOString(),
      fraudScore: Math.floor(Math.random() * 100),
      imageUrl: Math.random() > 0.5 ? '/uploads/sample-card.jpg' : undefined,
      status: ['ACTIVE', 'COMPLETED', 'FLAGGED'][Math.floor(Math.random() * 3)] as LiveActivity['status'],
    };
  };

  const generateRandomAlert = (offset = 0): AlertItem => {
    const types: AlertItem['type'][] = ['FRAUD', 'DUPLICATE', 'BLURRED', 'EDITED', 'RAPID_UPLOAD', 'HIGH_VALUE', 'PIN_MISMATCH'];
    const severities: AlertItem['severity'][] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    
    return {
      id: `alert-${Date.now()}-${offset}`,
      type: types[Math.floor(Math.random() * types.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      message: [
        'High fraud score detected',
        'Duplicate image uploaded',
        'Blurred image detected',
        'Image appears edited',
        'Rapid uploads detected',
        'High value from new user',
        'PIN mismatch detected'
      ][Math.floor(Math.random() * 7)],
      userId: `user-${Math.floor(Math.random() * 1000)}`,
      userName: ['John Doe', 'Jane Smith', 'Bob Johnson'][Math.floor(Math.random() * 3)],
      giftCardId: `gc-${Date.now()}`,
      timestamp: new Date(Date.now() - offset * 10000).toISOString(),
      acknowledged: false,
    };
  };

  const generateRiskProfiles = (): UserRiskProfile[] => {
    return Array.from({ length: 8 }, (_, i) => ({
      userId: `user-${i + 1}`,
      fullName: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson', 'Diana Prince', 'Eve Davis', 'Frank Miller'][i],
      email: `user${i + 1}@example.com`,
      riskLevel: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as UserRiskProfile['riskLevel'],
      fraudScore: Math.floor(Math.random() * 100),
      totalTransactions: Math.floor(Math.random() * 100),
      successfulTransactions: Math.floor(Math.random() * 80),
      failedTransactions: Math.floor(Math.random() * 20),
      totalGiftCards: Math.floor(Math.random() * 50),
      approvedCards: Math.floor(Math.random() * 40),
      rejectedCards: Math.floor(Math.random() * 10),
      ipHistory: Array.from({ length: 3 }, () => `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`),
      deviceHistory: ['Chrome/Windows', 'Safari/Mac', 'Mobile/iOS'],
      uploadPatterns: {
        avgTimeBetweenUploads: Math.floor(Math.random() * 300),
        rapidUploadCount: Math.floor(Math.random() * 10),
        unusualHoursCount: Math.floor(Math.random() * 5),
      },
      behaviorFlags: Math.random() > 0.5 ? ['Rapid uploads', 'Unusual hours'] : [],
      lastActivity: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    }));
  };

  const generateImageComparisons = (): ImageComparison[] => {
    return Array.from({ length: 4 }, (_, i) => ({
      originalId: `gc-${Date.now()}-${i}`,
      originalImage: '/uploads/sample-card.jpg',
      duplicateId: `gc-${Date.now()}-${i + 100}`,
      duplicateImage: '/uploads/sample-card.jpg',
      similarity: [100, 95, 87, 82][i],
      matchType: ['EXACT', 'EXACT', 'HIGH', 'MODERATE'][i] as ImageComparison['matchType'],
      originalUser: 'John Doe',
      duplicateUser: ['Jane Smith', 'Bob Johnson', 'Alice Brown'][Math.floor(Math.random() * 3)],
    }));
  };

  const getRiskBadge = (level: string) => {
    const styles: Record<string, string> = {
      LOW: 'bg-green-500/10 text-green-400 border-green-500/20',
      MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse',
    };
    return styles[level] || styles.LOW;
  };

  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, string> = {
      LOW: 'bg-blue-500/10 text-blue-400',
      MEDIUM: 'bg-amber-500/10 text-amber-400',
      HIGH: 'bg-orange-500/10 text-orange-400',
      CRITICAL: 'bg-red-500/10 text-red-400 animate-pulse',
    };
    return styles[severity] || styles.LOW;
  };

  const handleFreezeUser = (userId: string) => {
    console.log('Freezing user:', userId);
    // Implement freeze logic
  };

  const handleBanUser = (userId: string) => {
    console.log('Banning user:', userId);
    // Implement ban logic
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Eye className="w-8 h-8 text-amber-500" />
              Admin Live Wall
            </h1>
            <p className="text-slate-400 mt-1">Real-time surveillance and monitoring</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isStealthMode ? 'default' : 'outline'}
              onClick={() => setIsStealthMode(!isStealthMode)}
              className={isStealthMode ? 'bg-red-600 hover:bg-red-700' : 'border-slate-600'}
            >
              {isStealthMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {isStealthMode ? 'Stealth ON' : 'Stealth OFF'}
            </Button>
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-600 hover:bg-green-700' : 'border-slate-600'}
            >
              <Activity className="w-4 h-4 mr-2" />
              {autoRefresh ? 'Live' : 'Paused'}
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Sessions</p>
                  <p className="text-2xl font-bold text-white">{activities.filter(a => a.status === 'ACTIVE').length}</p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Pending Alerts</p>
                  <p className="text-2xl font-bold text-white">{alerts.filter(a => !a.acknowledged).length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">High Risk Users</p>
                  <p className="text-2xl font-bold text-white">{riskProfiles.filter(p => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL').length}</p>
                </div>
                <Shield className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Duplicates</p>
                  <p className="text-2xl font-bold text-white">{imageComparisons.length}</p>
                </div>
                <Image className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="live" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="live" className="data-[state=active]:bg-amber-500">
              <Activity className="w-4 h-4 mr-2" />
              Live Activity
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-red-500">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Alerts
              {alerts.filter(a => !a.acknowledged).length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">{alerts.filter(a => !a.acknowledged).length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="profiles" className="data-[state=active]:bg-blue-500">
              <User className="w-4 h-4 mr-2" />
              Risk Profiles
            </TabsTrigger>
            <TabsTrigger value="duplicates" className="data-[state=active]:bg-purple-500">
              <Image className="w-4 h-4 mr-2" />
              Duplicates
            </TabsTrigger>
          </TabsList>

          {/* Live Activity Tab */}
          <TabsContent value="live">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Real-Time Activity Stream
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]" ref={scrollRef}>
                  <div className="space-y-2">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        onClick={() => {
                          setSelectedActivity(activity);
                          setShowActivityDialog(true);
                        }}
                        className="p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 cursor-pointer transition-colors border-l-4"
                        style={{
                          borderLeftColor: activity.fraudScore > 60 ? '#ef4444' : activity.fraudScore > 30 ? '#f59e0b' : '#22c55e'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {activity.type === 'UPLOAD' && <Image className="w-4 h-4 text-blue-400" />}
                            {activity.type === 'SUBMIT' && <CreditCard className="w-4 h-4 text-green-400" />}
                            {activity.type === 'PAYMENT' && <TrendingUp className="w-4 h-4 text-amber-400" />}
                            {activity.type === 'LOGIN' && <User className="w-4 h-4 text-purple-400" />}
                            {activity.type === 'ACTION' && <Activity className="w-4 h-4 text-slate-400" />}
                            <div>
                              <p className="text-white font-medium">{activity.action}</p>
                              <p className="text-sm text-slate-400">
                                {activity.user.fullName} • {activity.details?.brand} ${activity.details?.value}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getRiskBadge(activity.user.riskLevel)}>
                              {activity.user.riskLevel}
                            </Badge>
                            {activity.fraudScore > 60 && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-xs text-slate-500">{formatTime(activity.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Security Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${alert.acknowledged ? 'bg-slate-800/30 border-slate-700 opacity-60' : 'bg-slate-700/50 border-slate-600'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded ${getSeverityBadge(alert.severity)}`}>
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium">{alert.message}</p>
                              <Badge className={getSeverityBadge(alert.severity)}>
                                {alert.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">
                              User: {alert.userName} • {formatTime(alert.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!alert.acknowledged && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFreezeUser(alert.userId)}
                                className="border-amber-600 text-amber-400 hover:bg-amber-600/20"
                              >
                                <Shield className="w-4 h-4 mr-1" />
                                Freeze
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBanUser(alert.userId)}
                                className="border-red-600 text-red-400 hover:bg-red-600/20"
                              >
                                <Ban className="w-4 h-4 mr-1" />
                                Ban
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAcknowledgeAlert(alert.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Ack
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Profiles Tab */}
          <TabsContent value="profiles">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  User Risk Profiles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {riskProfiles.map((profile) => (
                    <div
                      key={profile.userId}
                      onClick={() => {
                        setSelectedProfile(profile);
                        setShowProfileDialog(true);
                      }}
                      className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                            <span className="text-lg font-medium text-white">
                              {profile.fullName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{profile.fullName}</p>
                            <p className="text-sm text-slate-400">{profile.email}</p>
                          </div>
                        </div>
                        <Badge className={getRiskBadge(profile.riskLevel)}>
                          {profile.riskLevel}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-slate-800/50 p-2 rounded">
                          <p className="text-lg font-bold text-white">{profile.fraudScore}</p>
                          <p className="text-xs text-slate-400">Fraud Score</p>
                        </div>
                        <div className="bg-slate-800/50 p-2 rounded">
                          <p className="text-lg font-bold text-white">{profile.totalTransactions}</p>
                          <p className="text-xs text-slate-400">Transactions</p>
                        </div>
                        <div className="bg-slate-800/50 p-2 rounded">
                          <p className="text-lg font-bold text-white">{profile.totalGiftCards}</p>
                          <p className="text-xs text-slate-400">Gift Cards</p>
                        </div>
                      </div>
                      {profile.behaviorFlags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {profile.behaviorFlags.map((flag, i) => (
                            <Badge key={i} variant="outline" className="border-red-500/50 text-red-400 text-xs">
                              {flag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Duplicates Tab */}
          <TabsContent value="duplicates">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Image className="w-5 h-5 text-purple-500" />
                  Image Similarity Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {imageComparisons.map((comparison) => (
                    <div
                      key={comparison.originalId}
                      onClick={() => {
                        setSelectedComparison(comparison);
                        setShowImageCompareDialog(true);
                      }}
                      className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge className={comparison.similarity === 100 ? 'bg-red-500' : comparison.similarity > 90 ? 'bg-orange-500' : 'bg-amber-500'}>
                            {comparison.similarity}% Match
                          </Badge>
                          <Badge variant="outline" className="border-purple-500 text-purple-400">
                            {comparison.matchType}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline" className="border-slate-600">
                          <Eye className="w-4 h-4 mr-1" />
                          Compare
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-3 rounded">
                          <p className="text-xs text-slate-400 mb-2">Original • {comparison.originalUser}</p>
                          <div className="aspect-video bg-slate-700 rounded flex items-center justify-center">
                            <Image className="w-8 h-8 text-slate-500" />
                          </div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded">
                          <p className="text-xs text-slate-400 mb-2">Duplicate • {comparison.duplicateUser}</p>
                          <div className="aspect-video bg-slate-700 rounded flex items-center justify-center">
                            <Image className="w-8 h-8 text-slate-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Activity Detail Dialog */}
        <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Activity Details</DialogTitle>
            </DialogHeader>
            {selectedActivity && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 p-3 rounded">
                    <p className="text-xs text-slate-400">User</p>
                    <p className="text-white font-medium">{selectedActivity.user.fullName}</p>
                    <p className="text-sm text-slate-400">{selectedActivity.user.email}</p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded">
                    <p className="text-xs text-slate-400">Risk Level</p>
                    <Badge className={getRiskBadge(selectedActivity.user.riskLevel)}>
                      {selectedActivity.user.riskLevel}
                    </Badge>
                  </div>
                </div>
                <div className="bg-slate-700/50 p-3 rounded">
                  <p className="text-xs text-slate-400">Device Info</p>
                  <p className="text-white"><MapPin className="w-4 h-4 inline mr-1" /> {selectedActivity.user.ip}</p>
                  <p className="text-white"><Smartphone className="w-4 h-4 inline mr-1" /> {selectedActivity.user.device}</p>
                </div>
                <div className="bg-slate-700/50 p-3 rounded">
                  <p className="text-xs text-slate-400">Fraud Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${selectedActivity.fraudScore > 60 ? 'bg-red-500' : selectedActivity.fraudScore > 30 ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${selectedActivity.fraudScore}%` }}
                      />
                    </div>
                    <span className="text-white font-medium">{selectedActivity.fraudScore}</span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowActivityDialog(false)} className="border-slate-600">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Risk Profile Dialog */}
        <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Risk Profile</DialogTitle>
            </DialogHeader>
            {selectedProfile && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center">
                    <span className="text-2xl font-medium text-white">{selectedProfile.fullName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{selectedProfile.fullName}</p>
                    <p className="text-slate-400">{selectedProfile.email}</p>
                    <Badge className={getRiskBadge(selectedProfile.riskLevel)}>
                      {selectedProfile.riskLevel} RISK
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-slate-700/50 p-3 rounded text-center">
                    <p className="text-2xl font-bold text-white">{selectedProfile.fraudScore}</p>
                    <p className="text-xs text-slate-400">Fraud Score</p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded text-center">
                    <p className="text-2xl font-bold text-white">{selectedProfile.totalTransactions}</p>
                    <p className="text-xs text-slate-400">Transactions</p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded text-center">
                    <p className="text-2xl font-bold text-white">{selectedProfile.totalGiftCards}</p>
                    <p className="text-xs text-slate-400">Gift Cards</p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded text-center">
                    <p className="text-2xl font-bold text-white">{selectedProfile.uploadPatterns.rapidUploadCount}</p>
                    <p className="text-xs text-slate-400">Rapid Uploads</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowProfileDialog(false)} className="border-slate-600">
                Close
              </Button>
              <Button variant="outline" className="border-amber-600 text-amber-400">
                <Shield className="w-4 h-4 mr-1" />
                Freeze Account
              </Button>
              <Button variant="destructive">
                <Ban className="w-4 h-4 mr-1" />
                Ban User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
