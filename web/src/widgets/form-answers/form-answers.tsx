'use client';

import { useGetFormResponses } from '@/src/api/getAnswers';
import { useMemo, memo, useState, useCallback, Fragment, FC } from 'react';
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
  Table as ReactTable,
  HeaderGroup,
  Cell,
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
import { FormErrorDisplay } from '../form-view/form-view';

// --- Types ---

type FormAnswersProps = {
  formId: string;
};

// Explicitly define the row data structure used by the table
type FormResponseRowData = Pick<FormResponse, 'id' | 'createdAt'> & {
  answers: Answer[]; // Keep answers readily available for expansion
};

const DEFAULT_PAGE_SIZE = 25;
const LONG_TEXT_THRESHOLD = 50;

/**
 * Formats a date string into a readable format.
 * Includes basic error handling for invalid dates.
 */
const formatDateTime = (dateString: string): string => {
  try {
    // Attempt to format standard ISO strings or similar
    return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: ru });
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    // Fallback to the original string if formatting fails
    return dateString;
  }
};

/**
 * Formats a date string, attempting to show only the date if time is midnight.
 */
const formatDateValue = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        // Check if the time part is exactly midnight UTC
        if (date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0) {
            return format(date, 'dd MMMM yyyy', { locale: ru });
        }
        return format(date, 'dd MMMM yyyy, HH:mm', { locale: ru });
    } catch (e) {
        console.error("Error formatting date value:", dateString, e);
        return dateString; // Fallback
    }
};



const FormAnswersHeader: FC<{ totalResponses: number }> = memo(({ totalResponses }) => (
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

const EmptyState: FC = memo(() => (
  <div className="p-4 text-center text-muted-foreground">
    Пока нет ответов на эту форму
  </div>
));
EmptyState.displayName = 'EmptyState';

const LoadingState: FC = memo(() => (
  <div className="flex flex-col gap-4 p-8">
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
));
LoadingState.displayName = 'LoadingState';

const ErrorState: FC<{ message: string }> = memo(({ message }) => (
  <div className="p-4 text-red-500">
    <p>Ошибка загрузки данных:</p>
    <p className="text-sm opacity-80">{message}</p>
  </div>
));
ErrorState.displayName = 'ErrorState';

/**
 * Renders the visual representation of a single answer based on its type.
 */
const AnswerValueRenderer: FC<{ answer: Answer; questionType?: QuestionType | string }> = memo(({ answer, questionType }) => {
  if (answer.selectedOptions?.length) {
    return (
      <div className="flex flex-col gap-1">
        {answer.selectedOptions.map((option) => (
          <Badge key={option.id} variant="outline" className="justify-start text-sm my-0.5 whitespace-normal h-auto">
            {option.text}
          </Badge>
        ))}
      </div>
    );
  }

  if (answer.boolValue !== null && answer.boolValue !== undefined) {
    return answer.boolValue ?
      <Check className="h-5 w-5 text-green-500" aria-label="Да" /> :
      <X className="h-5 w-5 text-red-500" aria-label="Нет" />;
  }

  if (answer.numberValue !== null && answer.numberValue !== undefined) {
    return <span>{answer.numberValue}</span>;
  }

  if (answer.dateValue) {
     return <span>{formatDateValue(answer.dateValue)}</span>;
  }

  if (answer.textValue) {
    const isLongText = questionType === QuestionType.Paragraph || answer.textValue.length > LONG_TEXT_THRESHOLD;
    if (isLongText) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[300px] cursor-help">
                <p className="truncate">{answer.textValue}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start" className="max-w-[400px] z-50">
              <p className="whitespace-pre-wrap break-words">{answer.textValue}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return <span>{answer.textValue}</span>;
  }

  // Fallback for empty or unrecognized answers
  return <span className="text-muted-foreground">-</span>;
});
AnswerValueRenderer.displayName = 'AnswerValueRenderer';


/**
 * Renders the expanded details section for a table row.
 */
const ExpandedRowDetails: FC<{ row: Row<FormResponseRowData> }> = memo(({ row }) => {
  const answers = row.original.answers ?? [];

  if (answers.length === 0) {
      return (
          <div className="p-4 bg-muted/20 border-t text-sm text-muted-foreground">
              Нет подробных данных для этого ответа.
          </div>
      );
  }

  return (
    <div className="p-4 bg-muted/20 border-t">
      <h4 className="font-medium mb-3 text-base">Подробная информация об ответе</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {answers.map((answer: Answer) => (
          <div key={answer.questionId || answer.id} className="space-y-1 p-3 rounded-md border bg-card shadow-sm">
            <div className="text-sm font-medium text-muted-foreground break-words">
              {answer.question?.text || 'Вопрос без названия'}
            </div>
            <div className="text-sm break-words">
                <AnswerValueRenderer answer={answer} questionType={answer.question?.type} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
ExpandedRowDetails.displayName = 'ExpandedRowDetails';


/**
 * Renders the pagination controls for the table.
 */
const DataTablePagination: FC<{ table: ReactTable<FormResponseRowData> }> = memo(({ table }) => {
    const pageIndex = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();
    const canPreviousPage = table.getCanPreviousPage();
    const canNextPage = table.getCanNextPage();

    return (
        <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
                Показано {table.getRowModel().rows.length} из {table.getFilteredRowModel().rows.length} ответов
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!canPreviousPage}
                    aria-label="Перейти на первую страницу"
                    title="Первая страница"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!canPreviousPage}
                    aria-label="Перейти на предыдущую страницу"
                    title="Предыдущая страница"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-2">
                    Стр. {pageIndex + 1} / {pageCount > 0 ? pageCount : 1}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!canNextPage}
                    aria-label="Перейти на следующую страницу"
                    title="Следующая страница"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.setPageIndex(pageCount - 1)}
                    disabled={!canNextPage}
                    aria-label="Перейти на последнюю страницу"
                    title="Последняя страница"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
});
DataTablePagination.displayName = 'DataTablePagination';

export function FormAnswers({ formId }: FormAnswersProps) {
  const { data, loading, error } = useGetFormResponses(formId);
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRowExpanded = useCallback((rowId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId] 
    }));
  }, []);

  const responsesData = useMemo((): FormResponseRowData[] => {
    return (data?.formResponses ?? []).map(response => ({
      id: response.id,
      createdAt: response.createdAt,
      answers: response.answers ?? [], 
    }));
  }, [data]);

  const columns = useMemo<ColumnDef<FormResponseRowData>[]>(() => [
    {
      accessorKey: "createdAt",
      header: "Дата ответа",
      cell: ({ row }) => {
        const isExpanded = expandedRows[row.id];
        return (
          <div
            className="flex items-center whitespace-nowrap font-medium cursor-pointer py-2 px-2"
            onClick={() => toggleRowExpanded(row.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleRowExpanded(row.id)}
            aria-expanded={isExpanded} 
            aria-controls={`details-${row.id}`}
          >
            <span>{formatDateTime(row.getValue("createdAt"))}</span>
            <ChevronDown
              className={`ml-2 h-4 w-4 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </div>
        );
      },
      enableSorting: true,
      enableColumnFilter: false,
    },
  ], [expandedRows, toggleRowExpanded]);


  const table = useReactTable({
    data: responsesData,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
    getRowId: (row) => row.id,
    initialState: {
      pagination: {
        pageSize: DEFAULT_PAGE_SIZE,
        pageIndex: 0,
      },
    },
  });


  if (loading) return <LoadingState />;
  if (error) return <FormErrorDisplay error={error} />;

  return (
    <div className="w-full">
      <FormAnswersHeader totalResponses={table.getCoreRowModel().rows.length} />
      <CardContent>
        {responsesData.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup: HeaderGroup<FormResponseRowData>) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          className="whitespace-nowrap"
                          style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }} // Set width if defined
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              {...{
                                className: header.column.getCanSort()
                                  ? 'cursor-pointer select-none flex items-center gap-1'
                                  : 'flex items-center gap-1',
                                onClick: header.column.getToggleSortingHandler(),
                              }}
                              title={header.column.getCanSort() ? (header.column.getNextSortingOrder() === 'asc' ? 'Сортировать по возрастанию' : header.column.getNextSortingOrder() === 'desc' ? 'Сортировать по убыванию' : 'Убрать сортировку') : undefined}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {{
                                asc: <span className="text-muted-foreground">↑</span>,
                                desc: <span className="text-muted-foreground">↓</span>,
                              }[header.column.getIsSorted() as string] ?? null}
                            </div>
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row: Row<FormResponseRowData>) => (
                      <Fragment key={row.id}>
                        <TableRow
                          data-state={row.getIsSelected() ? "selected" : undefined}
                          className="hover:bg-muted/50"
                        >
                          {row.getVisibleCells().map((cell: Cell<FormResponseRowData, unknown>) => (
                            <TableCell
                              key={cell.id}
                              style={{ width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined }}
                              className={cell.column.id === "createdAt" ? "p-0" : ""}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                        {expandedRows[row.id] && (
                          <TableRow>
                            <TableCell colSpan={columns.length} className="p-0 border-none">
                               <div id={`details-${row.id}`}>
                                  <ExpandedRowDetails row={row} />
                               </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        Нет результатов, соответствующих вашим фильтрам.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <DataTablePagination table={table} />
          </>
        )}
      </CardContent>
    </div>
  );
}
FormAnswers.displayName = 'FormAnswers';

// Use memo on the default export if FormAnswers itself is likely to re-render
// due to parent changes but its props (formId) remain the same.
export default memo(FormAnswers);
