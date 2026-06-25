import { LostStatus } from '@prisma/client';
import { Response } from 'express';
import { prisma } from '../../config/database.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { sendResponse } from '../../utils/response.js';

export const createReport = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id as string;
  const {
    phoneModel,
    imei,
    brand,
    location,
    description,
    contactNumber,
    rewardAmount,
    status,
  } = req.body;

  const match = await prisma.foundPhone.findFirst({
    where: {
      imei,
      isDeleted: false,
    },
  });

  const isMatched = !!match;

  const report = await prisma.lostPhone.create({
    data: {
      phoneModel,
      imei,
      brand,
      location,
      description,
      contactNumber,
      rewardAmount,
      status: (status as LostStatus) || 'LOST',
      isMatched,
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (match) {
    await prisma.foundPhone.update({
      where: { id: match.id },
      data: { isMatched: true },
    });
  }

  return sendResponse(
    res,
    201,
    true,
    'Lost phone report created successfully',
    report
  );
};

export const updateReport = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id as string;
  const { id } = req.params;
  const {
    phoneModel,
    imei,
    brand,
    location,
    description,
    contactNumber,
    rewardAmount,
    status,
  } = req.body;

  const existingReport = await prisma.lostPhone.findUnique({
    where: { id },
  });

  if (!existingReport || existingReport.isDeleted) {
    return sendResponse(res, 404, false, 'Lost phone report not found');
  }

  if (existingReport.userId !== userId && req.user?.role !== 'ADMIN') {
    return sendResponse(
      res,
      403,
      false,
      'Forbidden - You do not own this report'
    );
  }

  let isMatched = existingReport.isMatched;

  if (imei && imei !== existingReport.imei) {
    const newMatch = await prisma.foundPhone.findFirst({
      where: { imei, isDeleted: false },
    });
    isMatched = !!newMatch;

    if (newMatch) {
      await prisma.foundPhone.update({
        where: { id: newMatch.id },
        data: { isMatched: true },
      });
    }

    const remainingLost = await prisma.lostPhone.findFirst({
      where: { imei: existingReport.imei, id: { not: id }, isDeleted: false },
    });
    if (!remainingLost) {
      await prisma.foundPhone.updateMany({
        where: { imei: existingReport.imei, isDeleted: false },
        data: { isMatched: false },
      });
    }
  }

  const updatedReport = await prisma.lostPhone.update({
    where: { id },
    data: {
      ...(phoneModel && { phoneModel }),
      ...(imei && { imei }),
      ...(brand && { brand }),
      ...(location && { location }),
      ...(description && { description }),
      ...(contactNumber !== undefined && { contactNumber }),
      ...(rewardAmount !== undefined && { rewardAmount }),
      ...(status && { status: status as LostStatus }),
      isMatched,
    },
  });

  return sendResponse(
    res,
    200,
    true,
    'Lost phone report updated successfully',
    updatedReport
  );
};

export const deleteReport = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id as string;
  const { id } = req.params;

  const existingReport = await prisma.lostPhone.findUnique({
    where: { id },
  });

  if (!existingReport || existingReport.isDeleted) {
    return sendResponse(res, 404, false, 'Lost phone report not found');
  }

  if (existingReport.userId !== userId && req.user?.role !== 'ADMIN') {
    return sendResponse(
      res,
      403,
      false,
      'Forbidden - You do not own this report'
    );
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
    where: { imei: existingReport.imei, id: { not: id }, isDeleted: false },
  });
  if (!remainingLost) {
    await prisma.foundPhone.updateMany({
      where: { imei: existingReport.imei, isDeleted: false },
      data: { isMatched: false },
    });
  }

  return sendResponse(res, 200, true, 'Lost phone report deleted successfully');
};

export const getSingleReport = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;

  const report = await prisma.lostPhone.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!report || report.isDeleted) {
    return sendResponse(res, 404, false, 'Lost phone report not found');
  }

  return sendResponse(
    res,
    200,
    true,
    'Lost phone report retrieved successfully',
    report
  );
};

export const getAllReports = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { imei, phoneModel, brand, location, status, page, limit } =
    req.query as any;

  const where: any = {
    isDeleted: false,
  };

  if (imei) {
    where.imei = { contains: imei, mode: 'insensitive' };
  }
  if (phoneModel) {
    where.phoneModel = { contains: phoneModel, mode: 'insensitive' };
  }
  if (brand) {
    where.brand = { contains: brand, mode: 'insensitive' };
  }
  if (location) {
    where.location = { contains: location, mode: 'insensitive' };
  }
  if (status) {
    where.status = status as LostStatus;
  }

  const pageNum = page ? parseInt(page as string) : 1;
  const limitNum = limit ? parseInt(limit as string) : 10;
  const skip = (pageNum - 1) * limitNum;

  const [reports, total] = await Promise.all([
    prisma.lostPhone.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    }),
    prisma.lostPhone.count({ where }),
  ]);

  return res.status(200).json({
    success: true,
    message: 'Lost phone reports retrieved successfully',
    data: reports,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};
