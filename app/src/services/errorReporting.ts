// Error Reporting Service - Captures and reports errors to dashboard
// This is an independent error reporting system with no external callbacks

export interface ErrorReport {
  id: string;
  timestamp: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  component?: string;
  action?: string;
  userAgent: string;
  url: string;
  resolved: boolean;
  resolution?: string;
  autoFixable: boolean;
}

class ErrorReportingService {
  private errors: ErrorReport[] = [];
  private listeners: ((errors: ErrorReport[]) => void)[] = [];
  private readonly STORAGE_KEY = 'giftcard_pro_errors';
  private readonly MAX_ERRORS = 100;

  constructor() {
    this.loadErrors();
    this.setupGlobalHandlers();
  }

  private loadErrors() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.errors = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load error reports:', e);
    }
  }

  private saveErrors() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.errors.slice(-this.MAX_ERRORS)));
    } catch (e) {
      console.error('Failed to save error reports:', e);
    }
  }

  private setupGlobalHandlers() {
    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.reportError({
        type: 'error',
        message: event.message || 'Unknown error',
        stack: event.error?.stack,
        url: window.location.href,
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        type: 'error',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        url: window.location.href,
      });
    });

    // Capture console errors
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      originalConsoleError.apply(console, args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      // Don't report duplicate errors
      if (!message.includes('ErrorReportingService')) {
        this.reportError({
          type: 'error',
          message: message.substring(0, 500),
          url: window.location.href,
        }, false); // Don't notify for console errors
      }
    };
  }

  reportError({
    type = 'error',
    message = 'Unknown error',
    stack,
    component,
    action,
    url,
  }: Partial<ErrorReport>, notify = true): ErrorReport {
    const error: ErrorReport = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type,
      message,
      stack,
      component,
      action,
      userAgent: navigator.userAgent,
      url: url || window.location.href,
      resolved: false,
      autoFixable: this.isAutoFixable(message, stack),
    };

    this.errors.push(error);
    this.saveErrors();
    
    if (notify) {
      this.notifyListeners();
    }

    return error;
  }

  private isAutoFixable(message: string, stack?: string): boolean {
    const autoFixablePatterns = [
      { pattern: /localStorage/, fix: 'Clear browser storage and reload' },
      { pattern: /sessionStorage/, fix: 'Clear browser storage and reload' },
      { pattern: /Network Error/i, fix: 'Check internet connection' },
      { pattern: /Failed to fetch/i, fix: 'Check API server status' },
      { pattern: /Cannot read properties of undefined/i, fix: 'Refresh page to reload data' },
      { pattern: /undefined is not an object/i, fix: 'Refresh page to reload data' },
    ];

    return autoFixablePatterns.some(p => p.pattern.test(message));
  }

  getSuggestedFix(error: ErrorReport): string | null {
    const fixes: { pattern: RegExp; fix: string }[] = [
      { pattern: /localStorage|sessionStorage/, fix: 'Clear browser storage and reload the page' },
      { pattern: /Network Error|Failed to fetch|ECONNREFUSED/i, fix: 'Check your internet connection and ensure the API server is running' },
      { pattern: /Cannot read properties of undefined|undefined is not an object/i, fix: 'Refresh the page to reload application data' },
      { pattern: /JWT|token|unauthorized|401/i, fix: 'Your session has expired. Please log in again.' },
      { pattern: /permission|access denied|403/i, fix: 'You do not have permission to perform this action. Contact admin if needed.' },
      { pattern: /not found|404/i, fix: 'The requested resource was not found. Check the URL or navigate back.' },
      { pattern: /timeout|ETIMEDOUT/i, fix: 'Request timed out. Please try again.' },
      { pattern: /validation|invalid/i, fix: 'Check your input data and try again with valid information.' },
      { pattern: /database|prisma|sql/i, fix: 'Database connection issue. Contact system administrator.' },
      { pattern: /cors|CORS/i, fix: 'Cross-origin request blocked. Check API configuration.' },
    ];

    for (const { pattern, fix } of fixes) {
      if (pattern.test(error.message) || (error.stack && pattern.test(error.stack))) {
        return fix;
      }
    }

    return null;
  }

  attemptAutoFix(errorId: string): { success: boolean; message: string } {
    const error = this.errors.find(e => e.id === errorId);
    if (!error) {
      return { success: false, message: 'Error not found' };
    }

    const suggestedFix = this.getSuggestedFix(error);
    
    if (!suggestedFix) {
      return { success: false, message: 'No automatic fix available for this error type' };
    }

    // Apply fixes based on error type
    if (/localStorage|sessionStorage/.test(error.message)) {
      try {
        localStorage.clear();
        sessionStorage.clear();
        this.markAsResolved(errorId, 'Cleared browser storage');
        return { success: true, message: 'Browser storage cleared. Please reload the page.' };
      } catch (e) {
        return { success: false, message: 'Failed to clear storage: ' + (e as Error).message };
      }
    }

    if (/JWT|token|unauthorized|401/i.test(error.message)) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      this.markAsResolved(errorId, 'Cleared authentication tokens');
      return { success: true, message: 'Session cleared. Please log in again.' };
    }

    return { success: false, message: suggestedFix };
  }

  markAsResolved(errorId: string, resolution: string) {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      error.resolution = resolution;
      this.saveErrors();
      this.notifyListeners();
    }
  }

  deleteError(errorId: string) {
    this.errors = this.errors.filter(e => e.id !== errorId);
    this.saveErrors();
    this.notifyListeners();
  }

  clearAllErrors() {
    this.errors = [];
    this.saveErrors();
    this.notifyListeners();
  }

  getErrors(): ErrorReport[] {
    return [...this.errors].reverse();
  }

  getUnresolvedErrors(): ErrorReport[] {
    return this.errors.filter(e => !e.resolved).reverse();
  }

  getErrorStats() {
    const total = this.errors.length;
    const unresolved = this.errors.filter(e => !e.resolved).length;
    const resolved = this.errors.filter(e => e.resolved).length;
    const autoFixable = this.errors.filter(e => e.autoFixable && !e.resolved).length;
    
    const byType = this.errors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, unresolved, resolved, autoFixable, byType };
  }

  subscribe(listener: (errors: ErrorReport[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getErrors()));
  }

  private generateId(): string {
    return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

export const errorReporting = new ErrorReportingService();
