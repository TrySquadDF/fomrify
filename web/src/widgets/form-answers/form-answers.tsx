'use client';

import { useGetFormResponses } from '@/src/api/getAnswers';
import { useMemo, memo, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { Answer, FormResponse, QuestionType } from '@/src/gql/graphql';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type FormAnswersProps = {
  formId: string;
};

type FormResponseRow = FormResponse & {
  answers: Answer[];
};

// Helper components
const FormAnswersHeader = memo(({ totalResponses }: { totalResponses: number }) => (
  <CardHeader className='mb-2.5'>
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>Ответы на форму</CardTitle>
        <CardDescription>Всего получено: {totalResponses}</CardDescription>
      </div>
    </div>
  </CardHeader>
));
FormAnswersHeader.displayName = 'FormAnswersHeader';

const EmptyState = memo(() => (
  <div className="p-4 text-center text-muted-foreground">
    Пока нет ответов на эту форму
  </div>
));
EmptyState.displayName = 'EmptyState';

const LoadingState = memo(() => (
  <div className="flex flex-col gap-4 p-8">
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
));
LoadingState.displayName = 'LoadingState';

const ErrorState = memo(({ message }: { message: string }) => (
  <div className="p-4 text-red-500">
    <p>Ошибка загрузки данных:</p>
    <p className="text-sm opacity-80">{message}</p>
  </div>
));
ErrorState.displayName = 'ErrorState';

// Date formatter helper
const formatDateTime = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: ru });
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return dateString;
  }
};

// Cell renderers for different answer types
const renderAnswerValue = (answer: Answer, questionType?: string) => {
  // Для вопросов с множественным выбором
  if (answer.selectedOptions?.length) {
    return (
      <div className="flex flex-col gap-1">
        {answer.selectedOptions.map((option) => (
          <Badge key={option.id} variant="outline" className="justify-start text-sm my-0.5">
            {option.text}
          </Badge>
        ))}
      </div>
    );
  } 
  
  // Для булевых значений (да/нет)
  if (answer.boolValue !== null) {
    return answer.boolValue ? 
      <Check className="h-5 w-5 text-green-500" aria-label="Да" /> : 
      <X className="h-5 w-5 text-red-500" aria-label="Нет" />;
  } 
  
  // Для числовых значений
  if (answer.numberValue !== null) {
    return <span>{answer.numberValue}</span>;
  } 
  
  // Для дат
  if (answer.dateValue) {
    try {
      // Убираем время из даты, если оно есть, но не значимо
      const dateOnly = answer.dateValue.includes('T00:00:00') 
        ? format(new Date(answer.dateValue), 'dd MMMM yyyy', { locale: ru })
        : format(new Date(answer.dateValue), 'dd MMMM yyyy, HH:mm', { locale: ru });
      return <span>{dateOnly}</span>;
    } catch (e) {
      console.error("Error formatting date value:", e);
      return <span>{answer.dateValue}</span>;
    }
  }
  
  // Для текстовых значений
  if (answer.textValue) {
    // Для длинных текстов (PARAGRAPH) используем особую стилизацию с подсказкой
    if (questionType === QuestionType.Paragraph || answer.textValue.length > 50) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[300px] cursor-help">
                <p className="truncate">{answer.textValue}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start" className="max-w-[400px]">
              <p className="whitespace-pre-wrap break-words">{answer.textValue}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // Для коротких текстов
    return <span>{answer.textValue}</span>;
  }
  
  // Если нет значений
  return <span className="text-muted-foreground">-</span>;
};

// New component for expanded row details
const ExpandedRowDetails = memo(({ row }: { row: Row<FormResponseRow> }) => {
  const answers = row.original.answers || [];
  
  return (
    <div className="p-4 bg-muted/20 border-t">
      <h4 className="font-medium mb-3">Подробная информация об ответе</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {answers.map((answer: Answer) => (
          <div key={answer.questionId} className="space-y-1 p-2 rounded-md border bg-white">
            <div className="text-sm text-gray-500">{answer.question?.text || 'Без названия'}</div>
            <div>{renderAnswerValue(answer, answer.question?.type)}</div>
          </div>
        ))}
      </div>
    </div>
  );
});
ExpandedRowDetails.displayName = 'ExpandedRowDetails';

// Main component using DataTable
export function FormAnswers({ formId }: FormAnswersProps) {
  const { data, loading, error } = useGetFormResponses(formId);
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]); // Default sort by date desc
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  // Toggle row expansion
  const toggleRowExpanded = useCallback((rowId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  }, []);
  
  
  // Extract responses from data
  const responses = useMemo(() => {
    return data?.formResponses ?? [];
  }, [data]);

  // Define columns for the DataTable
  const columns = useMemo<ColumnDef<FormResponseRow>[]>(() => {
    // Always start with the date column
    const baseColumns: ColumnDef<FormResponseRow>[] = [
      {
        accessorKey: "createdAt",
        header: "Дата ответа",
        cell: ({ row }) => (
          <div className="whitespace-nowrap font-medium flex items-center cursor-pointer">
            <span>{formatDateTime(row.getValue("createdAt"))}</span>
            <ChevronDown 
              className={`ml-2 h-4 w-4 transition-transform ${expandedRows[row.id] ? "rotate-180" : ""}`} 
            />
          </div>
        ),
        enableSorting: true,
      },
    ];
    
    return [...baseColumns];
  }, [expandedRows]);


  // Set up the table with React Table
  const table = useReactTable({
    data: responses,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

  // Handle loading, error and empty states
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (responses.length === 0) return <EmptyState />;

  return (
    <div className="w-full">
      <FormAnswersHeader totalResponses={responses.length} />
      <CardContent>
        {/* The DataTable */}
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead 
                      key={header.id} 
                      className="whitespace-nowrap"
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <>
                    {console.log(row)}
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell 
                          key={cell.id}
                          className={cell.column.id === "createdAt" ? "cursor-pointer hover:bg-muted" : ""}
                          onClick={cell.column.id === "createdAt" ? () => toggleRowExpanded(row.id) : undefined}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {expandedRows[row.id] && (
                      <TableRow key={`${row.id}-expanded`}>
                        <TableCell colSpan={columns.length} className="p-0">
                          <ExpandedRowDetails row={row} />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Нет результатов.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Improved pagination controls */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Показано {table.getRowModel().rows.length} из {table.getFilteredRowModel().rows.length} ответов
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              title="Первая страница"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              title="Предыдущая страница"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Страница <strong>{table.getState().pagination.pageIndex + 1}</strong> из{" "}
              <strong>{table.getPageCount()}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              title="Следующая страница"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              title="Последняя страница"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </div>
  );
}

export default memo(FormAnswers);