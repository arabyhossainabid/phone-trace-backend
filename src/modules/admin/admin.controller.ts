import { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { sendResponse } from "../../utils/response.js";

export const verifyReport = async (req: Request, res: Response) => {
  const { type, id } = req.params;

  if (type === "lost") {
    const existing = await prisma.lostPhone.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) {
      return sendResponse(res, 404, false, "Lost phone report not found");
    }
    const updated = await prisma.lostPhone.update({
      where: { id },
      data: { isVerified: true },
    });
    return sendResponse(res, 200, true, "Lost phone report verified successfully", updated);
  } else {
    const existing = await prisma.foundPhone.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) {
      return sendResponse(res, 404, false, "Found phone report not found");
    }
    const updated = await prisma.foundPhone.update({
      where: { id },
      data: { isVerified: true },
    });
    return sendResponse(res, 200, true, "Found phone report verified successfully", updated);
  }
};

export const deleteFakeReport = async (req: Request, res: Response) => {
  const { type, id } = req.params;

  if (type === "lost") {
    const existing = await prisma.lostPhone.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) {
      return sendResponse(res, 404, false, "Lost phone report not found");
    }
    await prisma.lostPhone.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isMatched: false,
      },
    });

    const remainingLost = await prisma.lostPhone.findFirst({
      where: { imei: existing.imei, id: { not: id }, isDeleted: false },
    });
    if (!remainingLost) {
      await prisma.foundPhone.updateMany({
        where: { imei: existing.imei, isDeleted: false },
        data: { isMatched: false },
      });
    }

    return sendResponse(res, 200, true, "Lost phone report deleted successfully");
  } else {
    const existing = await prisma.foundPhone.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) {
      return sendResponse(res, 404, false, "Found phone report not found");
    }
    await prisma.foundPhone.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isMatched: false,
      },
    });

    const remainingFound = await prisma.foundPhone.findFirst({
      where: { imei: existing.imei, id: { not: id }, isDeleted: false },
    });
    if (!remainingFound) {
      await prisma.lostPhone.updateMany({
        where: { imei: existing.imei, isDeleted: false },
        data: { isMatched: false },
      });
    }

    return sendResponse(res, 200, true, "Found phone report deleted successfully");
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return sendResponse(res, 200, true, "Users retrieved successfully", users);
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return sendResponse(res, 200, true, "User role updated successfully", updatedUser);
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.user.delete({ where: { id } });
  return sendResponse(res, 200, true, "User deleted successfully");
};

export const getDashboardStats = async (req: Request, res: Response) => {
  const [
    totalUsers,
    totalLost,
    totalFound,
    verifiedLost,
    verifiedFound,
    recoveredLost,
    recoveredFound,
    recentLost,
    recentFound,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.lostPhone.count({ where: { isDeleted: false } }),
    prisma.foundPhone.count({ where: { isDeleted: false } }),
    prisma.lostPhone.count({ where: { isVerified: true, isDeleted: false } }),
    prisma.foundPhone.count({ where: { isVerified: true, isDeleted: false } }),
    prisma.lostPhone.count({ where: { status: "RECOVERED", isDeleted: false } }),
    prisma.foundPhone.count({ where: { status: "RETURNED", isDeleted: false } }),
    prisma.lostPhone.findMany({
      where: { isDeleted: false },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    prisma.foundPhone.findMany({
      where: { isDeleted: false },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
  ]);

  const combinedRecent = [
    ...recentLost.map((r) => ({ ...r, type: "LOST" })),
    ...recentFound.map((r) => ({ ...r, type: "FOUND" })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return sendResponse(res, 200, true, "Dashboard statistics retrieved successfully", {
    stats: {
      totalUsers,
      totalLostReports: totalLost,
      totalFoundReports: totalFound,
      totalReports: totalLost + totalFound,
      verifiedReports: verifiedLost + verifiedFound,
      recoveredDevices: recoveredLost + recoveredFound,
    },
    recentReports: combinedRecent,
  });
};
