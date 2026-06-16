"use client";

import React from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getExportData } from "@/app/actions/export";

interface ExportDataProps {
  username: string;
}

export default function ExportData({ username }: ExportDataProps) {
  const handleExportPDF = async () => {
    const toastId = toast.loading("Generating your financial report...");

    try {
      const {
        transactions,
        goals,
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
      } = await getExportData();

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const BRAND_BLUE = { r: 0, g: 133, b: 255 };
      const TEXT_DARK = { r: 15, g: 23, b: 42 };
      const TEXT_MUTED = { r: 100, g: 116, b: 139 };

      try {
        const img = new window.Image();
        img.src = "/favicon.ico";

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        doc.addImage(img, "PNG", 40, 25, 30, 30);
      } catch {
        console.warn("Logo not found.");
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(BRAND_BLUE.r, BRAND_BLUE.g, BRAND_BLUE.b);
      doc.text(`${username}'s Dashboard`, 80, 46);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(TEXT_MUTED.r, TEXT_MUTED.g, TEXT_MUTED.b);
      doc.text("Personal Financial Statement Ledger", 80, 60);

      const rightAlignX = 555;
      doc.setFontSize(9);
      doc.setTextColor(TEXT_DARK.r, TEXT_DARK.g, TEXT_DARK.b);
      doc.text(
        `Statement Date: ${new Date().toLocaleDateString()}`,
        rightAlignX,
        42,
        { align: "right" }
      );
      doc.text(
        `Account User: ${username}`,
        rightAlignX,
        55,
        { align: "right" }
      );

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(1);
      doc.line(40, 75, 555, 75);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(40, 95, 515, 50, 6, 6, "FD");

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(TEXT_MUTED.r, TEXT_MUTED.g, TEXT_MUTED.b);
      doc.text("TOTAL BALANCE", 60, 113);
      doc.text("MONTHLY INCOME", 185, 113);
      doc.text("MONTHLY EXPENSES", 320, 113);
      doc.text("SAVINGS RATE", 460, 113);

      const savingsRate =
        monthlyIncome > 0
          ? (((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100).toFixed(1)
          : "0.0";

      doc.setFontSize(12);
      doc.setTextColor(TEXT_DARK.r, TEXT_DARK.g, TEXT_DARK.b);
      doc.text(`$${totalBalance.toFixed(2)}`, 60, 132);

      doc.setTextColor(16, 185, 129);
      doc.text(`+$${monthlyIncome.toFixed(2)}`, 185, 132);

      doc.setTextColor(239, 68, 68);
      doc.text(`-$${monthlyExpenses.toFixed(2)}`, 320, 132);

      doc.setTextColor(BRAND_BLUE.r, BRAND_BLUE.g, BRAND_BLUE.b);
      doc.text(`${savingsRate}%`, 460, 132);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(TEXT_DARK.r, TEXT_DARK.g, TEXT_DARK.b);
      doc.text("Full Account History Ledger", 40, 175);

      // Mapping table data safely
      const tableData = transactions.map((t) => [
        new Date(t.date).toLocaleDateString(),
        t.description,
        // Double check your server action properties: is it t.category?.name or t.categoryName?
        t.categoryName || "Uncategorized", 
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        `${t.type === "income" ? "+" : "-"}$${Math.abs(t.amount).toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: 185,
        margin: { left: 40, right: 40 },
        head: [["Date", "Description", "Category", "Type", "Amount"]],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [0, 133, 255],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [51, 65, 85],
        },
        columnStyles: {
          3: { fontStyle: "italic" },
          4: { halign: "right", fontStyle: "bold" },
        },
        didParseCell: (data) => {
          // Check that we are looking at the body cells of the final 'Amount' column
          if (data.section === "body" && data.column.index === 4) {
            const row = data.row.raw as string[];
            
            // Fix: Clean up row trimming values in case whitespace slipped into text formatting
            const transactionType = row[3]?.trim();

            if (transactionType === "Income") {
              data.cell.styles.textColor = [16, 185, 129];
            } else {
              data.cell.styles.textColor = [239, 68, 68];
            }
          }
        },
      });

      // Extract the Y coordinate of where the transactions table ended
      const finalY = (doc as any).lastAutoTable?.finalY || 200;

      // Only draw the Goals section if there are goals to show
      if (goals && goals.length > 0) {
        const goalsTitleY = finalY + 40;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(TEXT_DARK.r, TEXT_DARK.g, TEXT_DARK.b);
        doc.text("Financial Goals Progress", 40, goalsTitleY);

        const goalsTableData = goals.map((g: any) => {
          const progress = g.targetAmount > 0 
            ? ((g.savedAmount / g.targetAmount) * 100).toFixed(1) 
            : "0.0";
          
          return [
            g.name,
            g.targetDate ? new Date(g.targetDate).toLocaleDateString() : "N/A",
            `$${g.savedAmount.toFixed(2)}`,
            `$${g.targetAmount.toFixed(2)}`,
            `${progress}%`,
          ];
        });

        autoTable(doc, {
          startY: goalsTitleY + 15,
          margin: { left: 40, right: 40 },
          head: [["Goal Name", "Target Date", "Saved", "Target", "Progress"]],
          body: goalsTableData,
          theme: "striped",
          headStyles: {
            fillColor: [0, 133, 255],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 9,
          },
          bodyStyles: { fontSize: 9, textColor: [51, 65, 85] },
          columnStyles: {
            2: { halign: "right" },
            3: { halign: "right" },
            4: { halign: "right", fontStyle: "bold" },
          },
        });
      }

      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(TEXT_MUTED.r, TEXT_MUTED.g, TEXT_MUTED.b);
        doc.text(
          `Page ${i} of ${totalPages}`,
          doc.internal.pageSize.getWidth() - 40,
          doc.internal.pageSize.getHeight() - 20,
          { align: "right" }
        );
      }

      doc.save(
        `${username.toUpperCase()}'s financial report ${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`
      );

      toast.success("Financial report exported successfully!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to export financial report.", { id: toastId });
    }
  };

  return (
    <button
      onClick={handleExportPDF}
      className="bg-secondary text-secondary-foreground h-12 hover:scale-105 p-3 gap-2 font-semibold flex items-center rounded-md transition-all duration-300 cursor-pointer shadow-sm outline-none"
    >
      <Download className="w-5 h-5" />
      <span>Export Data</span>
    </button>
  );
}