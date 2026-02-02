import { prisma } from "../config/prisma";

export const getActiveFieldsForCompany = (companyId: string) => {
  return prisma.dynamicField.findMany({
    where: { companyId, isActive: true },
    orderBy: { displayOrder: "asc" },
  });
};
