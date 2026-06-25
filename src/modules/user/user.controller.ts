import { Response } from "express";
import { prisma } from "../../config/database.js";
import { AuthenticatedRequest } from "../../types/index.js";
import { sendResponse } from "../../utils/response.js";

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  if (!user) {
    return sendResponse(res, 404, false, "User not found");
  }

  return sendResponse(res, 200, true, "Profile retrieved successfully", user);
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { name, image } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(image !== undefined && { image }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return sendResponse(res, 200, true, "Profile updated successfully", updatedUser);
};
