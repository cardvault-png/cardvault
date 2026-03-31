import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', async () => {
    const duration = Date.now() - start;
    const userId = (req as any).user?.id;
    
    // Log to console
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${req.ip}`
    );
    
    // Log sensitive operations to audit log
    const sensitiveMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    const sensitivePaths = [
      '/api/auth',
      '/api/wallet',
      '/api/transactions',
      '/api/giftcards',
      '/api/admin',
      '/api/kyc',
      '/api/bank'
    ];
    
    const isSensitive = sensitiveMethods.includes(req.method) && 
                       sensitivePaths.some(path => req.originalUrl.startsWith(path));
    
    if (isSensitive && process.env.NODE_ENV === 'production') {
      try {
        await prisma.auditLog.create({
          data: {
            userId,
            action: req.method,
            entityType: req.originalUrl.split('/')[2]?.toUpperCase() || 'UNKNOWN',
            oldData: JSON.stringify({ path: req.originalUrl, query: req.query }),
            newData: JSON.stringify({ statusCode: res.statusCode }),
            ipAddress: req.ip || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown',
          }
        });
      } catch (error) {
        console.error('Audit log error:', error);
      }
    }
  });
  
  next();
};
