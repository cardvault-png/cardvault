import { useEffect, useState } from 'react';
import { AlertTriangle, Check, Trash2, RefreshCw, Wrench, X, Bug, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { errorReporting, type ErrorReport } from '@/services/errorReporting';
import { cn } from '@/lib/utils';

export function ErrorDashboard() {
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [stats, setStats] = useState({ total: 0, unresolved: 0, resolved: 0, autoFixable: 0, byType: {} });
  const [selectedError, setSelectedError] = useState<ErrorReport | null>(null);
  const [fixDialogOpen, setFixDialogOpen] = useState(false);
  const [fixResult, setFixResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    refreshData();
    const unsubscribe = errorReporting.subscribe(() => {
      refreshData();
    });
    return unsubscribe;
  }, []);

  const refreshData = () => {
    setErrors(errorReporting.getErrors());
    setStats(errorReporting.getErrorStats());
  };

  const handleAutoFix = (error: ErrorReport) => {
    setSelectedError(error);
    setFixDialogOpen(true);
    setFixResult(null);
  };

  const executeFix = () => {
    if (selectedError) {
      const result = errorReporting.attemptAutoFix(selectedError.id);
      setFixResult(result);
      if (result.success) {
        refreshData();
      }
    }
  };

  const handleMarkResolved = (errorId: string) => {
    errorReporting.markAsResolved(errorId, 'Manually resolved by admin');
    refreshData();
  };

  const handleDelete = (errorId: string) => {
    errorReporting.deleteError(errorId);
    refreshData();
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all error reports?')) {
      errorReporting.clearAllErrors();
      refreshData();
    }
  };

  const getSuggestedFix = (error: ErrorReport) => {
    return errorReporting.getSuggestedFix(error);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Error Reporting Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClearAll}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Errors</CardTitle>
            <Bug className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Unresolved</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.unresolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Resolved</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Auto-Fixable</CardTitle>
            <Wrench className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.autoFixable}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error List */}
      <Card>
        <CardHeader>
          <CardTitle>Error Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {errors.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Check className="mx-auto h-12 w-12 text-green-500" />
              <p className="mt-4 text-lg font-medium">No errors reported</p>
              <p className="text-sm">The system is running smoothly</p>
            </div>
          ) : (
            <div className="divide-y">
              {errors.map((error) => (
                <div
                  key={error.id}
                  className={cn(
                    'p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800',
                    error.resolved && 'opacity-60'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            error.type === 'error'
                              ? 'destructive'
                              : error.type === 'warning'
                              ? 'warning'
                              : 'secondary'
                          }
                        >
                          {error.type.toUpperCase()}
                        </Badge>
                        {error.resolved && (
                          <Badge variant="success">RESOLVED</Badge>
                        )}
                        {error.autoFixable && !error.resolved && (
                          <Badge variant="default" className="bg-blue-500">AUTO-FIXABLE</Badge>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(error.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="mt-2 font-medium truncate">{error.message}</p>
                      
                      {error.component && (
                        <p className="text-sm text-gray-500">Component: {error.component}</p>
                      )}
                      
                      {error.url && (
                        <p className="text-sm text-gray-500 truncate">URL: {error.url}</p>
                      )}

                      {!error.resolved && (
                        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Suggested Action:
                          </p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            {getSuggestedFix(error) || 'Review error details and take appropriate action'}
                          </p>
                        </div>
                      )}

                      {error.resolved && error.resolution && (
                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            Resolution:
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            {error.resolution}
                          </p>
                        </div>
                      )}

                      {error.stack && (
                        <details className="mt-2">
                          <summary className="text-sm text-gray-500 cursor-pointer">View Stack Trace</summary>
                          <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-x-auto">
                            {error.stack}
                          </pre>
                        </details>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {!error.resolved && error.autoFixable && (
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-blue-500 hover:bg-blue-600"
                          onClick={() => handleAutoFix(error)}
                        >
                          <Wrench className="mr-1 h-4 w-4" />
                          Auto-Fix
                        </Button>
                      )}
                      {!error.resolved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkResolved(error.id)}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Mark Resolved
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(error.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-Fix Dialog */}
      <Dialog open={fixDialogOpen} onOpenChange={setFixDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auto-Fix Error</DialogTitle>
            <DialogDescription>
              Attempting to automatically fix the error. Review the action before proceeding.
            </DialogDescription>
          </DialogHeader>

          {selectedError && !fixResult && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Error:</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">{selectedError.message}</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="font-medium text-blue-800 dark:text-blue-200">Proposed Fix:</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {getSuggestedFix(selectedError)}
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFixDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={executeFix}>
                  <Wrench className="mr-2 h-4 w-4" />
                  Execute Fix
                </Button>
              </DialogFooter>
            </div>
          )}

          {fixResult && (
            <div className="space-y-4">
              <div className={cn(
                'p-4 rounded-lg',
                fixResult.success 
                  ? 'bg-green-50 dark:bg-green-900/20' 
                  : 'bg-red-50 dark:bg-red-900/20'
              )}>
                <p className={cn(
                  'font-medium',
                  fixResult.success 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                )}>
                  {fixResult.success ? 'Success!' : 'Auto-Fix Failed'}
                </p>
                <p className={cn(
                  'text-sm',
                  fixResult.success 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-red-700 dark:text-red-300'
                )}>
                  {fixResult.message}
                </p>
              </div>
              <DialogFooter>
                <Button onClick={() => setFixDialogOpen(false)}>
                  <Check className="mr-2 h-4 w-4" />
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
