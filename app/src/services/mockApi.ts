// Mock API Service - Simulates backend responses for demo purposes
import { v4 as uuidv4 } from 'uuid';

// Generate UUID
const generateId = () => uuidv4();

// In-memory storage
const db = {
  users: new Map(),
  sessions: new Map(),
  giftCards: new Map(),
  transactions: new Map(),
  wallets: new Map(),
  notifications: new Map(),
  otpCodes: new Map(),
};

// Default admin user
const adminUser = {
  id: 'admin-001',
  email: 'admin@giftcardpro.com',
  fullName: 'System Administrator',
  username: 'admin',
  role: 'SUPER_ADMIN',
  passwordHash: 'admin123', // In real app, this would be hashed
  twoFactorEnabled: false,
  twoFactorSecret: null,
  kycStatus: 'APPROVED',
  isBanned: false,
  termsAccepted: true,
  createdAt: new Date().toISOString(),
};

db.users.set(adminUser.id, adminUser);

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate tokens
const generateTokens = (userId: string) => ({
  accessToken: `mock_token_${userId}_${Date.now()}`,
  refreshToken: `mock_refresh_${userId}_${Date.now()}`,
});

// Mock API handlers
export const mockApi = {
  // Auth endpoints
  async post(url: string, data: any) {
    console.log('[MockAPI] POST', url, data);
    
    // Auth Register
    if (url === '/auth/register' || url.endsWith('/auth/register')) {
      const { email, phone, password, fullName, username, termsAccepted } = data;
      
      // Check if email exists
      for (const user of db.users.values()) {
        if (user.email === email) {
          throw { response: { data: { success: false, message: 'Email already registered' } } };
        }
        if (user.username === username) {
          throw { response: { data: { success: false, message: 'Username already taken' } } };
        }
      }
      
      const userId = generateId();
      const user = {
        id: userId,
        email,
        phone: phone || null,
        fullName,
        username,
        passwordHash: password, // In real app, hashed
        role: 'USER',
        kycStatus: 'NOT_SUBMITTED',
        isBanned: false,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        termsAccepted: true,
        createdAt: new Date().toISOString(),
      };
      
      db.users.set(userId, user);
      
      // Create wallets
      const usdWallet = { id: generateId(), userId, type: 'USD', balance: 0, frozenBalance: 0 };
      const usdtWallet = { id: generateId(), userId, type: 'USDT', balance: 0, frozenBalance: 0 };
      db.wallets.set(usdWallet.id, usdWallet);
      db.wallets.set(usdtWallet.id, usdtWallet);
      
      // Generate OTP
      const otpCode = generateOTP();
      db.otpCodes.set(`${email || phone}_verify`, {
        code: otpCode,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });
      
      console.log('[MockAPI] Registration OTP:', otpCode);
      
      return {
        data: {
          success: true,
          message: 'Registration successful. Please verify your account.',
          data: {
            userId,
            requiresVerification: true,
            identifier: email || phone,
          }
        }
      };
    }
    
    // Auth Login
    if (url === '/auth/login' || url.endsWith('/auth/login')) {
      const { email, password, twoFactorCode } = data;
      
      let user = null;
      for (const u of db.users.values()) {
        if (u.email === email) {
          user = u;
          break;
        }
      }
      
      if (!user || user.passwordHash !== password) {
        throw { response: { data: { success: false, message: 'Invalid credentials' } } };
      }
      
      if (user.isBanned) {
        throw { response: { data: { success: false, message: 'Account has been suspended', code: 'ACCOUNT_BANNED' } } };
      }
      
      // Check 2FA
      if (user.twoFactorEnabled && !twoFactorCode) {
        return {
          data: {
            success: true,
            requiresTwoFactor: true,
            userId: user.id,
          }
        };
      }
      
      const tokens = generateTokens(user.id);
      
      // Update last login
      user.lastLoginAt = new Date().toISOString();
      db.users.set(user.id, user);
      
      return {
        data: {
          success: true,
          message: 'Login successful',
          data: {
            user: {
              id: user.id,
              email: user.email,
              phone: user.phone,
              fullName: user.fullName,
              username: user.username,
              role: user.role,
              kycStatus: user.kycStatus,
              twoFactorEnabled: user.twoFactorEnabled,
            },
            ...tokens,
          }
        }
      };
    }
    
    // Verify OTP
    if (url === '/auth/verify-otp' || url.endsWith('/auth/verify-otp')) {
      const { identifier, code } = data;
      
      const otpRecord = db.otpCodes.get(`${identifier}_verify`);
      
      if (!otpRecord || otpRecord.code !== code) {
        throw { response: { data: { success: false, message: 'Invalid or expired code' } } };
      }
      
      // Find user
      let user = null;
      for (const u of db.users.values()) {
        if (u.email === identifier || u.phone === identifier) {
          user = u;
          break;
        }
      }
      
      if (!user) {
        throw { response: { data: { success: false, message: 'User not found' } } };
      }
      
      const tokens = generateTokens(user.id);
      
      return {
        data: {
          success: true,
          message: 'Account verified successfully',
          data: {
            user: {
              id: user.id,
              email: user.email,
              phone: user.phone,
              fullName: user.fullName,
              username: user.username,
              role: user.role,
              kycStatus: user.kycStatus,
            },
            ...tokens,
          }
        }
      };
    }
    
    // Admin Login
    if (url === '/admin/login' || url.endsWith('/admin/login')) {
      const { email, password, adminCode } = data;
      
      if (adminCode !== '1122') {
        throw { response: { data: { success: false, message: 'Invalid admin access code' } } };
      }
      
      let user = null;
      for (const u of db.users.values()) {
        if (u.email === email && (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN')) {
          user = u;
          break;
        }
      }
      
      if (!user || user.passwordHash !== password) {
        throw { response: { data: { success: false, message: 'Invalid credentials' } } };
      }
      
      const tokens = generateTokens(user.id);
      
      return {
        data: {
          success: true,
          message: 'Admin login successful',
          data: {
            admin: {
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              role: user.role,
              twoFactorEnabled: user.twoFactorEnabled,
            },
            token: tokens.accessToken,
          }
        }
      };
    }
    
    // Default - not found
    throw { response: { status: 404, data: { success: false, message: 'Route not found' } } };
  },
  
  // GET requests
  async get(url: string) {
    console.log('[MockAPI] GET', url);
    
    // Dashboard stats
    if (url.includes('/admin/dashboard/stats')) {
      return {
        data: {
          success: true,
          data: {
            stats: {
              totalUsers: db.users.size,
              activeUsers: Math.floor(db.users.size * 0.7),
              totalTransactions: db.transactions.size,
              pendingTransactions: Math.floor(Math.random() * 10),
              totalGiftCards: db.giftCards.size,
              pendingGiftCards: Math.floor(Math.random() * 5),
              totalDeposits: 150000 + Math.random() * 50000,
              totalWithdrawals: 80000 + Math.random() * 30000,
              adminBalance: 15000,
            },
            recentActivity: Array.from({ length: 5 }, (_, i) => ({
              id: generateId(),
              action: ['CREATE', 'UPDATE', 'VIEW'][Math.floor(Math.random() * 3)],
              entityType: ['USER', 'TRANSACTION', 'GIFT_CARD'][Math.floor(Math.random() * 3)],
              entityId: generateId(),
              createdAt: new Date(Date.now() - i * 3600000).toISOString(),
              user: { fullName: 'Admin User', email: 'admin@giftcardpro.com' },
            })),
          }
        }
      };
    }
    
    // Users list
    if (url.includes('/admin/users')) {
      const users = Array.from(db.users.values()).map(u => ({
        id: u.id,
        email: u.email,
        phone: u.phone,
        fullName: u.fullName,
        username: u.username,
        role: u.role,
        kycStatus: u.kycStatus,
        isBanned: u.isBanned,
        twoFactorEnabled: u.twoFactorEnabled,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        _count: { transactions: 0, giftCards: 0 },
      }));
      
      return {
        data: {
          success: true,
          data: {
            users,
            pagination: { page: 1, limit: 20, total: users.length, pages: 1 },
          }
        }
      };
    }
    
    // Transactions list
    if (url.includes('/admin/transactions')) {
      const transactions = Array.from(db.transactions.values()).map(t => ({
        ...t,
        user: { fullName: 'Test User', email: 'user@example.com', username: 'testuser' },
        wallet: { type: t.walletType },
      }));
      
      return {
        data: {
          success: true,
          data: {
            transactions: transactions.length > 0 ? transactions : [
              {
                id: generateId(),
                userId: 'user-1',
                walletId: 'wallet-1',
                type: 'DEPOSIT',
                status: 'PENDING',
                amount: 1000,
                fee: 10,
                netAmount: 990,
                walletType: 'USD',
                fraudScore: 0,
                createdAt: new Date().toISOString(),
                user: { fullName: 'John Doe', email: 'john@example.com', username: 'johndoe' },
                wallet: { type: 'USD' },
              }
            ],
            pagination: { page: 1, limit: 20, total: transactions.length || 1, pages: 1 },
          }
        }
      };
    }
    
    // Gift cards list
    if (url.includes('/admin/giftcards')) {
      const giftCards = Array.from(db.giftCards.values()).map(g => ({
        ...g,
        user: { 
          fullName: 'Test User', 
          email: 'user@example.com', 
          username: 'testuser',
          lastLoginIp: '192.168.1.1',
          deviceFingerprint: 'fp-123',
        },
      }));
      
      return {
        data: {
          success: true,
          data: {
            giftCards: giftCards.length > 0 ? giftCards : [
              {
                id: generateId(),
                userId: 'user-1',
                brand: 'Amazon',
                country: 'US',
                cardValue: 100,
                currency: 'USD',
                pinCode: '123456789012',
                ocrResult: '123456789012',
                ocrConfidence: 0.95,
                fraudScore: 15,
                reviewCategory: null,
                status: 'PENDING',
                imageFront: '/uploads/sample-front.jpg',
                imageBack: '/uploads/sample-back.jpg',
                imageScratched: '/uploads/sample-scratched.jpg',
                rate: 0.85,
                payoutAmount: 85,
                adminNotes: null,
                createdAt: new Date().toISOString(),
                processedAt: null,
                user: { 
                  fullName: 'John Doe', 
                  email: 'john@example.com', 
                  username: 'johndoe',
                  lastLoginIp: '192.168.1.100',
                  deviceFingerprint: 'device-abc-123',
                },
              }
            ],
            pagination: { page: 1, limit: 20, total: giftCards.length || 1, pages: 1 },
          }
        }
      };
    }
    
    // Current user
    if (url === '/auth/me' || url.endsWith('/auth/me')) {
      const token = localStorage.getItem('gcp_token');
      if (!token) {
        throw { response: { status: 401, data: { success: false, message: 'Not authenticated' } } };
      }
      
      // Find user from token (simplified)
      const users = Array.from(db.users.values());
      const user = users[0];
      
      if (!user) {
        throw { response: { status: 404, data: { success: false, message: 'User not found' } } };
      }
      
      const wallets = Array.from(db.wallets.values()).filter(w => w.userId === user.id);
      
      return {
        data: {
          success: true,
          data: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            fullName: user.fullName,
            username: user.username,
            role: user.role,
            kycStatus: user.kycStatus,
            twoFactorEnabled: user.twoFactorEnabled,
            termsAccepted: user.termsAccepted,
            wallets: wallets.map(w => ({
              id: w.id,
              type: w.type,
              balance: w.balance,
              frozenBalance: w.frozenBalance,
              address: w.address || null,
            })),
            createdAt: user.createdAt,
          }
        }
      };
    }
    
    // Default - not found
    throw { response: { status: 404, data: { success: false, message: 'Route not found' } } };
  },
};

// Axios adapter that routes to mock API
export const mockAxiosAdapter = (config: any) => {
  return new Promise((resolve, reject) => {
    const { method, url, data } = config;
    
    setTimeout(async () => {
      try {
        let response;
        if (method === 'get' || method === 'GET') {
          response = await mockApi.get(url);
        } else if (method === 'post' || method === 'POST') {
          response = await mockApi.post(url, JSON.parse(data || '{}'));
        } else {
          throw { response: { status: 405, data: { success: false, message: 'Method not allowed' } } };
        }
        resolve(response);
      } catch (error) {
        reject(error);
      }
    }, 300); // Simulate network delay
  });
};

export default mockApi;
