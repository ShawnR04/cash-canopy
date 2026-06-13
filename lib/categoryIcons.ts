// lib/categoryIcons.tsx
import {
  FaUtensils,
  FaHome,
  FaCar,
  FaShoppingBag,
  FaHeartbeat,
  FaFilm,
  FaGraduationCap,
  FaWallet,
  FaPiggyBank,
  FaEllipsisH,
} from "react-icons/fa";

export const categoryIconMap = {
  Food: FaUtensils, // Capitalized to match <option value="Food">
  Housing: FaHome,
  Transportation: FaCar,
  Shopping: FaShoppingBag,
  Health: FaHeartbeat,
  Entertainment: FaFilm,
  Education: FaGraduationCap,
  Income: FaWallet,
  Savings: FaPiggyBank,
  Other: FaEllipsisH,
};

export const categoryStyleMap = {
  Food: "bg-[#FF6384] dark:bg-[#E05373]",            // Slightly deeper, muted rose
  Housing: "bg-[#FFCE56] dark:bg-[#E6B94D]",         // Warm, less harsh mustard gold
  Transportation: "bg-[#36A2EB] dark:bg-[#2B8BC9]",  // Richer, less glaring sky blue
  Shopping: "bg-[#FF9F40] dark:bg-[#E08630]",        // Soft burnt orange
  Health: "bg-[#FF9F40] dark:bg-[#E08630]",          // Soft burnt orange
  Entertainment: "bg-[#4BC0C0] dark:bg-[#3AA1A1]",   // Deep, soothing teal
  Education: "bg-[#9966FF] dark:bg-[#8052DE]",       // Muted royal purple
  Income: "bg-[#00CC99] dark:bg-[#00B386]",          // Emerald green with toned-down brightness
  Savings: "bg-[#22EBB8] dark:bg-[#1BC79B]",         // Clean, readable mint
  Other: "bg-[#36A2EB] dark:bg-[#2B8BC9]",           // Richer, less glaring sky blue
};

export const categoryStyleMap2 = {
  Food: "text-[#FF6384] dark:text-[#FF809B]",         // Brightened slightly for text contrast on dark
  Housing: "text-[#FFCE56] dark:text-[#FFE082]",      // Soft pastel yellow for readability
  Transportation: "text-[#36A2EB] dark:text-[#63BFFF]", // Vibrant but soft text blue
  Shopping: "text-[#FF9F40] dark:text-[#FFAE5C]",     // Light pastel orange
  Health: "text-[#FF9F40] dark:text-[#FFAE5C]",       // Light pastel orange
  Entertainment: "text-[#4BC0C0] dark:text-[#66D4D4]",// Crisp, readable aqua/teal
  Education: "text-[#9966FF] dark:text-[#B388FF]",    // Lighter, luminous lavender
  Income: "text-[#00CC99] dark:text-[#33FFCC]",       // High-visibility emerald text
  Savings: "text-[#22EBB8] dark:text-[#52FFD2]",      // High-visibility mint text
  Other: "text-[#36A2EB] dark:text-[#63BFFF]",        // Vibrant but soft text blue
};
