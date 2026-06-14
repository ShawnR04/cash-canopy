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
  PaginationEllipsis,
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
import { HiDotsVertical, HiChevronLeft, HiChevronRight } from "react-icons/hi";
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

      // Append noon time so timezone shifts don't push it to the previous day when saved
      const rawDate = formData.get("date") as string;
      if (rawDate && !rawDate.includes("T")) {
        formData.set("date", `${rawDate}T12:00:00`);
      }

      const toastId = toast.loading("Updating transaction...");
      try {
        const res = await updateTransaction(formData);
        if (res?.success) {
          toast.success("Transaction updated!", { id: toastId });
          setIsOpen(false);
        } else {
          toast.error("Failed to update transaction.", { id: toastId });
        }
      } catch (e) {
        toast.error("An error occurred.", { id: toastId });
      }
    };
    return(
        <>
            {/* MOBILE TABLE VIEW */}
            <div className="md:hidden">
                <table className="w-full table-fixed border-collapse text-sm md:hidden">
                    <tbody className="divide-y divide-gray-100">
                        {currentData.length === 0 ? (
                            <div className=" h-30 flex items-center justify-center col-span-3 text-center text-muted-foreground">
                                <p className="bg-card h-2/3 w-1/2 flex items-center justify-center rounded-xl shadow-sm transition-all">
                                    No Transactions found.
                                </p>
                            </div>
                        ) : (
                            currentData.map((t) => {
                                const Icon = t.categoryIcon
                                  ? (categoryIconMap[
                                      t.categoryIcon as keyof typeof categoryIconMap
                                    ] ?? categoryIconMap.Other)
                                  : FaEllipsisH;
                                
                                const specificStyle = t.categoryIcon
                                  ? (categoryStyleMap[
                                      t.categoryIcon as keyof typeof categoryStyleMap
                                    ] ?? categoryStyleMap.Other)
                                  : categoryStyleMap.Other;
                                
                                const isIncome = t.type === "income";

                                return(
                                    <tr key={t.id} className="h-20 hover:bg-card transition-colors">
                                        <td className="p-2">
                                            {t.description.length > 30 ? (
                                                <Popover open={isHoveredM} onOpenChange={setIsHoveredM}>
                                                    <PopoverTrigger className="">
                                                        <p className=" capitalize font-semibold text-base cursor-pointer hover:text-primary transition-colors"
                                                            onMouseEnter={() => setIsHoveredM(true)}
                                                            onMouseLeave={() => setIsHoveredM(false)}
                                                        >
                                                            {t.description.slice(0, 20)}...
                                                        </p>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        side="top"
                                                        className="w-fit max-w-70 p-2 text-sm bg-card border border-border shadow-md rounded-md normal-case wrap-break-word"
                                                    >
                                                        {t.description}
                                                    </PopoverContent>
                                                </Popover>
                                            ) : (
                                                <p className="font-semibold text-base capitalize">
                                                    {t.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(t.date).toLocaleDateString("en-US", {
                                                      timeZone: "UTC",
                                                      day: "2-digit",
                                                      month: "short",
                                                      year: "numeric",
                                                    })}
                                                </span>
                                                <div className="flex items-center text-xs text-muted-foreground gap-2">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground text-sm shrink-0 ${specificStyle}`}>
                                                        <Icon/>
                                                    </div>
                                                    {t.categoryName || 'Uncategorized'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className=" w-1/3 p-2">
                                            <div className="flex items-center justify-end gap-5">
                                                <div className="flex flex-col items-center">
                                                    <p className={`font-semibold text-base ${isIncome ? "text-emerald-600" : "text-destructive"}`}>
                                                        {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                                                    </p>
                                                    <p className={`font-semibold ${isIncome ? "text-emerald-600" : "text-destructive"}`}>
                                                        {isIncome ? "+" : "-"}$
                                                        {Math.abs(t.amount).toLocaleString(undefined, {
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        })}
                                                    </p>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                      className="p-1 h-9 w-9 rounded-full active:bg-card hover:bg-background transition-colors flex items-center justify-center shrink-0"
                                                    >
                                                        <HiDotsVertical size={20}/>
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

            <div className="hidden md:block w-full overflow-x-auto no-scrollbar">
                <table className="w-full table-fixed border-collapse text-sm">
                    <thead className="">
                        <tr className="bg-card border-b text-primary font-bold">
                            <th className="w-[25%] py-3 text-center rounded-l-xl">Date</th>
                            <th className="w-[25%] py-3 text-center">Description</th>
                            <th className="w-[25%] py-3 text-center">Category</th>
                            <th className="w-[25%] py-3 text-center">Type</th>
                            <th className="w-[25%] py-3 text-center">Amount</th>
                            <th className="w-[25%] py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {currentData.length === 0 ? (
                            <div className=" h-30 flex items-center justify-center col-span-3 text-center text-muted-foreground">
                                <p className="bg-card h-2/3 w-1/2 flex items-center justify-center rounded-xl shadow-sm transition-all">
                                    No Transactions found.
                                </p>
                            </div>
                        ) : (
                            currentData.map((t) => {
                                const Icon = t.categoryIcon
                                  ? (categoryIconMap[
                                      t.categoryIcon as keyof typeof categoryIconMap
                                    ] ?? categoryIconMap.Other)
                                  : FaEllipsisH;
                                
                                const specificStyle = t.categoryIcon
                                  ? (categoryStyleMap[
                                      t.categoryIcon as keyof typeof categoryStyleMap
                                    ] ?? categoryStyleMap.Other)
                                  : categoryStyleMap.Other;
                                
                                const isIncome = t.type === "income";

                                return(
                                    <tr key={t.id} className="hover:bg-card transition-colors">
                                        <td className="text-center md:text-[14px] lg:text-[16px] py-2">
                                            {new Date(t.date).toLocaleDateString("en-US", {
                                              timeZone: "UTC",
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric",
                                            })}
                                        </td>
                                        <td className="text-center md:text-[14px] lg:text-[16px] font-medium italic capitalize max-w-45 lg:max-w-60">
                                            {t.description.length > 20 ? (
                                                <Popover open={isHovered} onOpenChange={setIsHovered}>
                                                    <PopoverTrigger className="">
                                                        <span className="w-full h-full min-h-10 flex items-center justify-center px-4 cursor-pointer hover:text-primary transition-colors"
                                                            onMouseEnter={() => setIsHovered(true)}
                                                            onMouseLeave={() => setIsHovered(false)}
                                                        >
                                                            {t.description.slice(0, 20)}...
                                                        </span>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        side="top"
                                                        className="w-fit max-w-70 p-2 text-sm bg-card border border-border shadow-md rounded-md normal-case wrap-break-word"
                                                    >
                                                        {t.description}
                                                    </PopoverContent>
                                                </Popover>
                                            ) : (
                                                <span className="">
                                                    {t.description}
                                                </span>
                                            )}
                                        </td>
                                        <td className="">
                                            <div className="flex items-center justify-start gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground text-sm shrink-0 ${specificStyle}`}>
                                                    <Icon/>
                                                </div>
                                                {t.categoryName || 'Uncategorized'}
                                            </div>
                                        </td>
                                        <td className={`text-center md:text-[14px] lg:text-[16px] font-semibold ${isIncome ? "text-emerald-600" : "text-destructive"}`}>
                                            {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                                        </td>
                                        <td className={`text-center md:text-[14px] lg:text-[16px] font-bold ${isIncome ? "text-emerald-600" : "text-destructive"}`}>
                                            {isIncome ? "+" : "-"}$
                                            {Math.abs(t.amount).toLocaleString(undefined, {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td className="flex items-center justify-center gap-1 py-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-primary hover:bg-primary/10"
                                                onClick={() => {
                                                  setSelectedTransaction(t);
                                                  setTransactionDate(new Date(t.date).toISOString().split("T")[0]);
                                                  setIsOpen(true);
                                                }}
                                            >
                                                <FaFilePen/>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(t.id)}
                                                disabled={isDeleting === t.id}
                                            >
                                                <FaTrash size={16}/>
                                            </Button>
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
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage((p) => p - 1);
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
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
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}

            {isOpen && selectedTransaction && (
            <div className="fixed top-0 left-0 z-50 h-full w-full flex items-center justify-center bg-black/60">
              <form
                action={handleUpdate}
                className="w-120 flex flex-col bg-primary-foreground text-foreground rounded-xl px-5 py-5 gap-5"
              >
                <div className="h-10 flex items-center justify-between">
                  <h1 className="text-primary text-2xl font-bold">
                    Update Transaction
                  </h1>
                  <Button
                    type="button"
                    className="hover:text-destructive bg-transparent text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    <RxCross2 />
                  </Button>
                </div>
                
                <div className="flex flex-col gap-1">
                  <Label htmlFor="type" className="text-muted-foreground text-[16px]">
                    Type
                  </Label>
                  <select
                    name="type"
                    title="type"
                    id="type"
                    className="h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    defaultValue={selectedTransaction.type}
                    required
                  >
                    <option value="" disabled hidden>
                      Select Type
                    </option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="amount" className="text-muted-foreground text-[16px]">
                    Amount
                  </Label>
                  <Input type="number" id="amount" name="amount" defaultValue={selectedTransaction.amount} className="h-10" required />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="description" className="text-muted-foreground text-[16px]">
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
                <div className="flex flex-col gap-1">
                  <Label htmlFor="categoryId" className="text-muted-foreground text-[16px]">
                    Category
                  </Label>
                  <select
                    name="categoryId"
                    title="categoryId"
                    id="categoryId"
                    className="h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    defaultValue={selectedTransaction.categoryId || ""}
                    required
                  >
                    <option value="" disabled hidden>
                      Select Category
                    </option>
                    {category?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="date"
                    className="text-muted-foreground text-[16px]"
                  >
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    name="date"
                    className="h-10"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    required
                  />
                </div>
                  
                <div className="flex align-center justify-center">
                  <Button
                    type="submit"
                    className="h-10 cursor-pointer hover:scale-105"
                  >
                    Update Transaction
                  </Button>
                </div>
              </form>
            </div>
        )}
        </>
    );
}