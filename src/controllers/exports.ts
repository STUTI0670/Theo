import { Request, Response } from "express";
import { stringify } from "csv-stringify/sync";
import { prisma } from "../config/prisma";

export const exportCompanyApplicationsCsv = async (
  req: Request,
  res: Response
) => {
  const companyId = req.params.companyId;
  const [fields, applications] = await Promise.all([
    prisma.dynamicField.findMany({
      where: { companyId, isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.application.findMany({
      where: { companyId },
      include: {
        student: { include: { studentProfile: true } },
        responses: true,
      },
    }),
  ]);

  const headers = [
    "Student Name",
    "Roll Number",
    "Branch",
    "CGPA",
    "Email",
    ...fields.map((field) => field.label),
  ];

  const records = applications.map((application) => {
    const profile = application.student.studentProfile;
    const row: Record<string, string> = {
      "Student Name": profile?.name ?? "",
      "Roll Number": profile?.rollNumber ?? "",
      Branch: profile?.branch ?? "",
      CGPA: profile?.cgpa?.toString() ?? "",
      Email: application.student.email,
    };

    for (const field of fields) {
      const response = application.responses.find(
        (item) => item.fieldId === field.id
      );
      row[field.label] = response?.fileUrl ?? JSON.stringify(response?.value ?? "");
    }

    return row;
  });

  const csv = stringify(records, { header: true, columns: headers });
  res.header("Content-Type", "text/csv");
  res.attachment(`company-${companyId}-applications.csv`);
  return res.send(csv);
};

export const exportCompanyApplicationsSheetPayload = async (
  req: Request,
  res: Response
) => {
  const companyId = req.params.companyId;
  const [fields, applications] = await Promise.all([
    prisma.dynamicField.findMany({
      where: { companyId, isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.application.findMany({
      where: { companyId },
      include: {
        student: { include: { studentProfile: true } },
        responses: true,
      },
    }),
  ]);

  const headers = [
    "Student Name",
    "Roll Number",
    "Branch",
    "CGPA",
    "Email",
    ...fields.map((field) => field.label),
  ];

  const rows = applications.map((application) => {
    const profile = application.student.studentProfile;
    const baseRow = [
      profile?.name ?? "",
      profile?.rollNumber ?? "",
      profile?.branch ?? "",
      profile?.cgpa?.toString() ?? "",
      application.student.email,
    ];

    const dynamicValues = fields.map((field) => {
      const response = application.responses.find(
        (item) => item.fieldId === field.id
      );
      return response?.fileUrl ?? JSON.stringify(response?.value ?? "");
    });

    return [...baseRow, ...dynamicValues];
  });

  // Payload aligns with Google Sheets API "values" input.
  return res.status(200).json({ headers, rows });
};
