'use client'

import { useState } from "react";  
import { SelectCategory } from "@/db/schema"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HiDotsVertical } from "react-icons/hi";
import { categoryIconMap, categoryStyleMap } from "@/lib/categoryIcons";
import { FaEllipsisH, FaTrash } from "react-icons/fa";
import { FaFilePen } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RxCross2 } from "react-icons/rx";
import { toast } from "sonner";
import { updateTransaction, deleteTransaction } from "@/app/actions/transactions";

export interface Category {
  id: number;
  name: string;
}

export interface TransactionWithCategory {
  id: number;
  date: Date;
  description: string;
  type: "income" | "expense";
  amount: number;
  categoryId: number | null;
  categoryName: string | null;
  categoryIcon: string | null;
}

interface TransactionsTableProps {
  transactions: TransactionWithCategory[];
  category: SelectCategory[];
  itemsPerPage: number;
  disablePagination?: boolean;
}

export default function TransactionsTable({
  transactions,
  category,
  itemsPerPage,
  disablePagination,
}: TransactionsTableProps){
    const [isHoveredM, setIsHoveredM] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const sortedTransactions = [...(transactions || [])].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.id - a.id;
    });

    // Pagination Logic
    const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = sortedTransactions.slice(startIndex, startIndex + itemsPerPage);

    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const handleDelete = async (id: number) => {
      setIsDeleting(id);
      const toastId = toast.loading("Deleting transaction...");
      const res = await deleteTransaction(id);
      if (res.success) {
        toast.success("Transaction deleted!", { id: toastId });
      } else {
        toast.error("Failed to delete transaction.", { id: toastId });
      }
      setIsDeleting(null);
    };

    const [isOpen, setIsOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithCategory | null>(null);
    const [transactionDate, setTransactionDate] = useState("");

    const handleUpdate = async (formData: FormData) => {
      if (!selectedTransaction) return;

      formData.append("id", selectedTransaction.id.toString());

      const rawDate = formData.get("date") as string;
      if (rawDate && rawDate.includes("T")) {
        formData.set("date", rawDate.split("T")[0]);
      }

      const toastId = toast.loading("Updating transaction...");
      try {
        const res = await updateTransaction(formData);
        if (res?.success) {
          toast.success("Transaction updated!", { id: toastId });
          setIsOpen(false);
        } else {
          toast.error(res?.error || "Failed to update transaction.", { id: toastId });
        }
      } catch (e) {
        toast.error("An error occurred.", { id: toastId });
      }
    };

    return(
        <>
            {/* MOBILE TABLE VIEW */}
            <div className="md:hidden">
                <table className="w-full table-fixed border-collapse text-sm">
                    <tbody className="divide-y divide-gray-100">
                        {currentData.length === 0 ? (
                            <tr>
                                <td className="h-30 flex items-center justify-center text-center text-muted-foreground">
                                    <p className="bg-card h-2/3 w-1/2 flex items-center justify-center rounded-xl shadow-sm transition-all">
                                        No Transactions found.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            currentData.map((t) => {
                                const Icon = t.categoryIcon
                                  ? (categoryIconMap[t.categoryIcon as keyof typeof categoryIconMap] ?? categoryIconMap.Other)
                                  : FaEllipsisH;
                                
                                const specificStyle = t.categoryIcon
                                  ? (categoryStyleMap[t.categoryIcon as keyof typeof categoryStyleMap] ?? categoryStyleMap.Other)
                                  : categoryStyleMap.Other;
                                
                                const isIncome = t.type === "income";

                                return(
                                    <tr key={t.id} className="h-20 hover:bg-card transition-colors">
                                        <td className="p-2">
                                            {t.description.length > 30 ? (
                                                <Popover open={isHoveredM} onOpenChange={setIsHoveredM}>
                                                    <PopoverTrigger>
                                                        <p 
                                                            className="capitalize font-semibold text-base cursor-pointer hover:text-primary transition-colors"
                                                            onMouseEnter={() => setIsHoveredM(true)}
                                                            onMouseLeave={() => setIsHoveredM(false)}
                                                        >
                                                            {t.description.slice(0, 20)}...
                                                        </p>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        side="top"
                                                        className="w-fit max-w-70 p-2 text-sm bg-card border border-border shadow-md rounded-md normal-case break-words"
                                                    >
                                                        {t.description}
                                                    </PopoverContent>
                                                </Popover>
                                            ) : (
                                                <p className="font-semibold text-base capitalize">
                                                    {t.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(t.date).toLocaleDateString("en-US", {
                                                      timeZone: "UTC",
                                                      day: "2-digit",
                                                      month: "short",
                                                      year: "numeric",
                                                    })}
                                                </span>
                                                <div className="flex items-center text-xs text-muted-foreground gap-1.5">
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-primary-foreground text-[10px] shrink-0 ${specificStyle}`}>
                                                        <Icon/>
                                                    </div>
                                                    {t.categoryName || 'Uncategorized'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="w-1/3 p-2">
                                            <div className="flex items-center justify-end gap-3">
                                                <div className="flex flex-col items-end">
                                                    <p className={`font-semibold text-xs capitalize ${isIncome ? "text-emerald-600" : "text-destructive"}`}>
                                                        {t.type}
                                                    </p>
                                                    <p className={`font-bold text-sm ${isIncome ? "text-emerald-600" : "text-destructive"}`}>
                                                        {isIncome ? "+" : "-"}$
                                                        {Math.abs(t.amount).toLocaleString(undefined, {
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        })}
                                                    </p>
                                                </div>
                                                <DropdownMenu>
                                                    {/* FIXED: Removed internal raw button & asChild. DropdownMenuTrigger renders the single button layout cleanly */}
                                                    <DropdownMenuTrigger className="p-1 h-8 w-8 rounded-full active:bg-card hover:bg-muted transition-colors flex items-center justify-center shrink-0 outline-none cursor-pointer">
                                                        <HiDotsVertical size={16}/>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-32 bg-card border border-border rounded-lg shadow-md p-1">
                                                        <DropdownMenuItem 
                                                            onClick={() => {
                                                              setSelectedTransaction(t);
                                                              setTransactionDate(new Date(t.date).toISOString().split("T")[0]);
                                                              setIsOpen(true);
                                                            }}
                                                            className="flex items-center gap-2 px-2.5 py-2 text-sm cursor-pointer rounded-md hover:bg-muted"
                                                        >
                                                            <FaFilePen className="w-4 h-4 text-primary" />
                                                            <span>Edit</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDelete(t.id)}
                                                            disabled={isDeleting === t.id}
                                                            className="flex items-center gap-2 px-2.5 py-2 text-sm cursor-pointer rounded-md text-destructive hover:bg-destructive/10"
                                                        >
                                                            <FaTrash className="w-4 h-4" />
                                                            <span>Delete</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block w-full overflow-x-auto no-scrollbar">
                <table className="w-full table-fixed border-collapse text-sm">
                    <thead>
                        <tr className="bg-card border-b text-primary font-bold text-left">
                            <th className="py-3 px-4 rounded-l-xl text-center">Date</th>
                            <th className="py-3 px-4">Description</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4 text-center">Type</th>
                            <th className="py-3 px-4 text-right">Amount</th>
                            <th className="py-3 px-4 text-center rounded-r-xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {currentData.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="h-32 text-center text-muted-foreground py-8">
                                    No transactions found.
                              </td>
                            </tr>
                        ) : (
                            currentData.map((t) => {
                                const Icon = t.categoryIcon
                                  ? (categoryIconMap[t.categoryIcon as keyof typeof categoryIconMap] ?? categoryIconMap.Other)
                                  : FaEllipsisH;
                                
                                const specificStyle = t.categoryIcon
                                  ? (categoryStyleMap[t.categoryIcon as keyof typeof categoryStyleMap] ?? categoryStyleMap.Other)
                                  : categoryStyleMap.Other;
                                
                                const isIncome = t.type === "income";

                                return(
                                    <tr key={t.id} className="hover:bg-card/50 transition-colors">
                                        <td className="text-center py-3 px-4">
                                            {new Date(t.date).toLocaleDateString("en-US", {
                                              timeZone: "UTC",
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric",
                                            })}
                                        </td>
                                        <td className="py-3 px-4 font-medium max-w-[200px] truncate">
                                            {t.description.length > 20 ? (
                                                <Popover open={isHovered} onOpenChange={setIsHovered}>
                                                    <PopoverTrigger>
                                                        <span 
                                                            className="cursor-pointer hover:text-primary transition-colors underline decoration-dotted"
                                                            onMouseEnter={() => setIsHovered(true)}
                                                            onMouseLeave={() => setIsHovered(false)}
                                                        >
                                                            {t.description.slice(0, 20)}...
                                                        </span>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        side="top"
                                                        className="w-fit max-w-70 p-2 text-sm bg-card border border-border shadow-md rounded-md"
                                                    >
                                                        {t.description}
                                                    </PopoverContent>
                                                </Popover>
                                            ) : (
                                                <span>{t.description}</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-primary-foreground text-xs shrink-0 ${specificStyle}`}>
                                                    <Icon className="w-3 h-3" />
                                                </div>
                                                <span className="truncate">{t.categoryName || 'Uncategorized'}</span>
                                            </div>
                                        </td>
                                        <td className={`text-center py-3 px-4 font-semibold capitalize ${isIncome ? "text-emerald-600" : "text-destructive"}`}>
                                            {t.type}
                                        </td>
                                        <td className={`text-right py-3 px-4 font-bold ${isIncome ? "text-emerald-600" : "text-destructive"}`}>
                                            {isIncome ? "+" : "-"}$
                                            {Math.abs(t.amount).toLocaleString(undefined, {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-primary hover:bg-primary/10"
                                                    onClick={() => {
                                                      setSelectedTransaction(t);
                                                      setTransactionDate(new Date(t.date).toISOString().split("T")[0]);
                                                      setIsOpen(true);
                                                    }}
                                                >
                                                    <FaFilePen className="h-4 w-4"/>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(t.id)}
                                                    disabled={isDeleting === t.id}
                                                >
                                                    <FaTrash className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!disablePagination && totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage((p) => p - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i} className="hidden sm:inline-block">
                      <PaginationLink
                        href="#"
                        isActive={currentPage === i + 1}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(i + 1);
                        }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage((p) => p + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}

            {/* MODAL DRAWER OVERLAY */}
            {isOpen && selectedTransaction && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <form
                action={handleUpdate}
                className="w-full max-w-md flex flex-col bg-card border border-border shadow-2xl rounded-2xl p-6 gap-4"
              >
                <div className="flex items-center justify-between">
                  <h1 className="text-foreground text-xl font-bold">
                    Update Transaction
                  </h1>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <RxCross2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="type" className="text-muted-foreground text-sm">
                    Type
                  </Label>
                  <select
                    name="type"
                    title="type"
                    id="type"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    defaultValue={selectedTransaction.type}
                    required
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="amount" className="text-muted-foreground text-sm">
                    Amount ($)
                  </Label>
                  <Input 
                    type="number" 
                    id="amount" 
                    name="amount" 
                    step="0.01"
                    min="0.01"
                    defaultValue={Math.abs(selectedTransaction.amount)} 
                    className="h-10" 
                    required 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="description" className="text-muted-foreground text-sm">
                    Description
                  </Label>
                  <Input
                    type="text"
                    id="description"
                    name="description"
                    defaultValue={selectedTransaction.description}
                    className="h-10"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="categoryId" className="text-muted-foreground text-sm">
                    Category
                  </Label>
                  <select
                    name="categoryId"
                    title="categoryId"
                    id="categoryId"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    defaultValue={selectedTransaction.categoryId || ""}
                  >
                    <option value="">Uncategorized</option>
                    {category?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="date" className="text-muted-foreground text-sm">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    name="date"
                    className="h-10 bg-background"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    required
                  />
                </div>
                  
                <Button
                    type="submit"
                    className="h-10 w-full mt-2 font-semibold shadow-sm"
                >
                    Update Transaction
                </Button>
              </form>
            </div>
        )}
        </>
    );
}