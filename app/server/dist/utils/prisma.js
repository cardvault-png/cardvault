"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.getUserById = getUserById;
exports.getUserByEmail = getUserByEmail;
exports.getUserByUsername = getUserByUsername;
exports.getUserWallet = getUserWallet;
exports.createWallet = createWallet;
exports.updateWalletBalance = updateWalletBalance;
exports.createTransaction = createTransaction;
exports.createLedgerEntry = createLedgerEntry;
exports.logAdminAction = logAdminAction;
exports.logAudit = logAudit;
exports.createNotification = createNotification;
exports.getSystemSetting = getSystemSetting;
exports.setSystemSetting = setSystemSetting;
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ?? new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
// Helper functions for common operations
async function getUserById(id) {
    return exports.prisma.user.findUnique({
        where: { id },
        include: {
            wallets: true,
        },
    });
}
async function getUserByEmail(email) {
    return exports.prisma.user.findUnique({
        where: { email },
    });
}
async function getUserByUsername(username) {
    return exports.prisma.user.findUnique({
        where: { username },
    });
}
async function getUserWallet(userId, type) {
    return exports.prisma.wallet.findFirst({
        where: { userId, type: type },
    });
}
async function createWallet(userId, type, address) {
    return exports.prisma.wallet.create({
        data: {
            userId,
            type: type,
            address,
            balance: 0,
            frozenBalance: 0,
        },
    });
}
async function updateWalletBalance(walletId, amount, isCredit) {
    const wallet = await exports.prisma.wallet.findUnique({
        where: { id: walletId },
    });
    if (!wallet)
        throw new Error('Wallet not found');
    const currentBalance = parseFloat(wallet.balance.toString());
    const newBalance = isCredit ? currentBalance + amount : currentBalance - amount;
    if (!isCredit && newBalance < 0) {
        throw new Error('Insufficient balance');
    }
    return exports.prisma.wallet.update({
        where: { id: walletId },
        data: { balance: newBalance },
    });
}
async function createTransaction(data) {
    return exports.prisma.transaction.create({
        data: {
            ...data,
            type: data.type,
            status: data.status,
            walletType: data.walletType,
        },
    });
}
async function createLedgerEntry(data) {
    return exports.prisma.ledger.create({
        data: data,
    });
}
async function logAdminAction(data) {
    return exports.prisma.adminAction.create({
        data: data,
    });
}
async function logAudit(data) {
    return exports.prisma.auditLog.create({
        data: data,
    });
}
async function createNotification(data) {
    return exports.prisma.notification.create({
        data: {
            ...data,
            type: data.type,
        },
    });
}
async function getSystemSetting(key) {
    const setting = await exports.prisma.systemSetting.findUnique({
        where: { key },
    });
    return setting?.value;
}
async function setSystemSetting(key, value, updatedBy) {
    return exports.prisma.systemSetting.upsert({
        where: { key },
        update: { value, updatedBy },
        create: { key, value, updatedBy },
    });
}
exports.default = exports.prisma;
//# sourceMappingURL=prisma.js.map