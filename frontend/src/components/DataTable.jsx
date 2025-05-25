import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PlusIcon, Filter, ArrowUpDown, ChevronUp, ChevronDown, X, 
  ArrowDownAZ, ArrowDownZA, AlertCircle, FileText 
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { studentService, remittanceService, paymentService, expenseService } from "../utils/apiService";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { toast } from "sonner";

const DataTable = ({ 
  columns, 
  data = [], 
  title, 
  showAdd, 
  user,
  loading = false,
  onSort, // Function to handle sorting
  onFilter, // Function to handle filtering
  sortBy = null, // Current sort field
  sortDir = 'asc', // Current sort direction
  filters = {}, // Current filters
  filterOptions = {}, // Available filter options
  // Pagination props - fully controlled
  currentPage = 1,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  totalElements,
  disableReportGeneration
}) => {
  // State for report generation dialog
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportFormat, setReportFormat] = useState("pdf");
  const [reportFields, setReportFields] = useState({});
  const [reportFilters, setReportFilters] = useState({
    program: 'all',
    yearLevel: 'all',
    section: 'all',
    status: 'all',
    feeType: 'all',
    remittedBy: 'all'
  });

  // Calculate pagination values
  const totalRows = totalElements || data?.length || 0;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  // Initialize reportFields based on columns - only run once on mount and when columns change
  useEffect(() => {
    const initialFields = {};
    columns.forEach(col => {
      if (!col.hidden && col.key !== "actions") {
        initialFields[col.key] = true;
      }
    });
    // Only update if the values are actually different
    setReportFields(prev => {
      const hasChanges = Object.keys(initialFields).some(key => prev[key] !== initialFields[key]);
      return hasChanges ? initialFields : prev;
    });
  }, [columns]);

  // Initialize reportFilters based on current table filters and title
  useEffect(() => {
    // Skip if no filterOptions are available yet
    if (!filterOptions || Object.keys(filterOptions).length === 0) return;

    setReportFilters(prev => {
      const initialReportFilters = { ...filters }; // Start with main table filters
      let hasChanges = false;

      // Ensure specific filters required by report type are initialized if not present
      if (title === 'payment' || title === 'remittance') {
        if (!initialReportFilters.feeType || initialReportFilters.feeType === 'all') {
          const feeOptionsKey = title === 'payment' ? 'feeType' : 'fee';
          if (filterOptions[feeOptionsKey]?.length > 0) {
            initialReportFilters.feeType = filterOptions[feeOptionsKey][0].id;
            hasChanges = true;
          }
        }
      }

      // Ensure other common filters are present
      const defaultFilters = {
        program: 'all',
        yearLevel: 'all',
        section: 'all',
        status: 'all'
      };

      Object.entries(defaultFilters).forEach(([key, defaultValue]) => {
        if (!initialReportFilters[key]) {
          initialReportFilters[key] = defaultValue;
          hasChanges = true;
        }
      });

      if (title === 'remittance' && !initialReportFilters.remittedBy) {
        initialReportFilters.remittedBy = 'all';
        hasChanges = true;
      }

      // Only update state if there are actual changes
      return hasChanges ? initialReportFilters : prev;
    });
  }, [filters, filterOptions, title]);

  const getPaginationInfo = () => {
    const start = totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, totalRows);
    return `${start}-${end} of ${totalRows}`;
  };

  // We don't need to slice the data if pagination is handled by the server
  // But keep this for client-side pagination fallback
  const paginatedData = data;
  
  // Handle sorting when a column is selected from the dropdown
  const handleSort = (field, direction) => {
    if (!onSort) return;
    onSort(field, direction);
  };
  
  // Handle filter changes
  const handleFilter = (filterName, value) => {
    if (!onFilter) return;
    onFilter(filterName, value);
  };
  
  // Clear all filters
  const clearFilters = () => {
    if (!onFilter) return;
    
    // Reset each filter to 'all'
    Object.keys(filters).forEach(key => {
      onFilter(key, 'all');
    });
  };
  
  // Check if any filters are applied
  const hasActiveFilters = () => {
    return Object.entries(filters).some(([key, value]) => value !== 'all');
  };
  
  // Count how many filters are active
  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value !== 'all').length;
  };
  
  // Get the currently sorted column name for display
  const getSortedColumnLabel = () => {
    if (!sortBy) return "Select column";
    
    const column = columns.find(col => {
      const field = col.sortKey || col.key;
      return field === sortBy;
    });
    
    return column ? column.label : "Select column";
  };

  // Get the sort icon based on current direction
  const getSortIcon = () => {
    if (!sortBy) return <ArrowUpDown className="w-4 h-4" />;
    
    if (sortDir === 'asc') {
      return <ArrowDownAZ className="w-4 h-4" />;
    } else {
      return <ArrowDownZA className="w-4 h-4" />;
    }
  };

  // Toggle field selection for report
  const toggleReportField = (field) => {
    setReportFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleReportFilterChange = (filterName, value) => {
    setReportFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Handle report generation
  const handleGenerateReport = async () => {
    const reportAPIParams = {
      ...reportFilters,
      fields: Object.keys(reportFields).filter(field => reportFields[field]),
      sortField: sortBy,
      sortDirection: sortDir,
    };

    // Critical: For payment and remittance reports, feeId (derived from reportFilters.feeType) MUST be set.
    if ((title === 'payment' || title === 'remittance') && (!reportAPIParams.feeType || reportAPIParams.feeType === 'all')) {
      toast.error("Fee Type Required", {
        description: `Please select a specific Fee Type in the report filters to generate a ${title} report.`,
      });
      return; // Stop if no fee type is selected for these reports
    }

    // Standardize feeType to feeId for the API
    if (reportAPIParams.feeType && reportAPIParams.feeType !== 'all') {
        reportAPIParams.feeId = reportAPIParams.feeType;
        delete reportAPIParams.feeType;
    }

    // Standardize remittedBy to accountId for remittance reports
    if (title === 'remittance' && reportAPIParams.remittedBy && reportAPIParams.remittedBy !== 'all') {
        reportAPIParams.accountId = reportAPIParams.remittedBy;
        delete reportAPIParams.remittedBy;
    }

    // Remove 'all' values before sending to backend
    for (const key in reportAPIParams) {
      if (reportAPIParams[key] === 'all') {
        delete reportAPIParams[key];
      }
    }

    console.log(`Generating ${title} report with API params:`, reportAPIParams);
    setReportDialogOpen(false); 

    const loadingToastId = toast.loading(`Generating ${title} report...`);

    try {
      let reportData;
      if (title === 'student') {
        reportData = await studentService.generateStudentReport(reportAPIParams);
      } else if (title === 'remittance') {
        reportData = await remittanceService.generateRemittanceReport(reportAPIParams);
      } else if (title === 'payment') {
        reportData = await paymentService.generatePaymentReport(reportAPIParams);
      } else if (title === 'expense') {
        reportData = await expenseService.generateExpenseReport(reportAPIParams);
      } else {
        console.error("Unknown report title for API call:", title);
        toast.error(`Unknown report type: ${title}`, { id: loadingToastId });
        return;
      }
      console.log("Report data received:", reportData);

      if (!reportData || reportData.length === 0) {
        toast.error(`No data available for report`, {
          id: loadingToastId,
          description: "Try adjusting your filters or ensure the selected filters have associated data."
        });
        return;
      }

      let success = false;
      // Use the main 'columns' prop for defining report structure
      const reportableColumns = columns.filter(col => !col.hidden && col.key !== 'actions');
      
      if (reportFormat === 'csv') {
        success = generateCSV(reportData, title, reportFields, reportableColumns);
      } else if (reportFormat === 'pdf') {
        success = generatePDF(reportData, title, reportFields, reportableColumns);
      } else if (reportFormat === 'excel') {
        success = generateXLSX(reportData, title, reportFields, reportableColumns);
      }
      
      if (success) {
        toast.success(`${reportFormat.toUpperCase()} Report Generated`, { 
            id: loadingToastId, 
            description: `Your ${title} report has been downloaded.` 
        });
      } else {
        toast.error(`Failed to Generate ${reportFormat.toUpperCase()} Report`, { 
            id: loadingToastId, 
            description: "An issue occurred during file creation. Check console for details." 
        });
      }

    } catch (error) {
      console.error(`Error generating ${title} report:`, error);
      toast.error(`Failed to Generate Report`, {
        id: loadingToastId,
        description: error.response?.data?.message || error.message || `An error occurred.`
      });
    }
  };

  // Modified to accept 'reportableColumns' which are the filtered main columns
  const generateCSV = (data, reportTitle, selectedFields, reportableColumns) => {
    if (!data || data.length === 0) return false;

    const summaryStats = calculateSummaryStats(data, reportTitle);
    const headers = reportableColumns
      .filter(col => selectedFields[col.key])
      .map(col => col.label);

    const csvRows = data.map(row => {
      return reportableColumns
        .filter(col => selectedFields[col.key])
        .map(col => {
          let cellValue = row[col.key]; // Default to direct key access
          // Handle specific report types and DTO structures
          if (reportTitle === 'payment') { // Data is PaymentDTO
            if (col.key === 'fullName') cellValue = `${row.lastName || ''}, ${row.firstName || ''} ${row.middleInitial || ''}`.trim();
            else if (col.key === 'program') cellValue = row.program;
            else if (col.key === 'yearSec') cellValue = row.yearLevel && row.section ? `${row.yearLevel} - ${row.section}` : (row.yearLevel || row.section || '-');
            else if (col.key === 'status') cellValue = row.status; // Direct status from PaymentDTO
            else if (col.key === 'amount') cellValue = row.amount; // Direct amount from PaymentDTO
          } else if (reportTitle === 'remittance') { // Data is a Remittances object
            if (col.key === 'fullName' || col.key === 'treasurer' || col.key === 'user') cellValue = `${row.lastName || ''}, ${row.firstName || ''} ${row.middleInitial ? row.middleInitial + '.' : ''}`.trim();
            else if (col.key === 'program') cellValue = row.programCode || row.programId; // from Remittances object
            else if (col.key === 'yearSec' || col.key === 'yearAndSection') cellValue = row.yearLevel && row.section ? `${row.yearLevel}-${row.section}` : (row.yearLevel || row.section || '-');
            else if (col.key === 'status') cellValue = row.status; 
            else if (col.key === 'amountRemitted') cellValue = row.amountRemitted; 
            else if (col.key === 'feeType') cellValue = row.feeType;
            // Ensure other direct fields from Remittances object are accessed if selected
            else if (row.hasOwnProperty(col.key)) {
              cellValue = row[col.key];
            }
          } else if (reportTitle === 'expense') { // Data is ExpenseDTO
            if (col.key === 'expenseCategory') cellValue = row.expenseCategory ? row.expenseCategory.replace(/_/g, ' ') : '';
            else if (col.key === 'amount') cellValue = row.amount;
            else if (col.key === 'expenseStatus') cellValue = row.expenseStatus;
            else if (col.key === 'approvalStatus') cellValue = row.approvalStatus;
            else if (col.key === 'departmentName') cellValue = row.departmentName;
            else if (col.key === 'expenseDate') cellValue = row.expenseDate;
            else if (col.key === 'paymentMethod') cellValue = row.paymentMethod ? row.paymentMethod.replace(/_/g, ' ') : '';
            else if (col.key === 'isRecurring') cellValue = row.isRecurring ? 'Yes' : 'No';
            else if (col.key === 'isTaxInclusive') cellValue = row.isTaxInclusive ? 'Yes' : 'No';
            else if (col.key === 'totalAmount') cellValue = row.totalAmount || row.amount;
            else if (col.key === 'netAmount') cellValue = row.netAmount || row.amount;
            else if (row.hasOwnProperty(col.key)) {
              cellValue = row[col.key];
            }
          } else { // Student report or other - use existing render logic if available
            if (col.render) {
                const rendered = col.render(row[col.key], row);
                if (typeof rendered === 'object') cellValue = row[col.key]; // Fallback for complex JSX
                else cellValue = rendered;
            }
          }
          return `"${String(cellValue == null ? '' : cellValue).replace(/"/g, '""')}"`;
        })
        .join(',');
    });
    // ... (rest of CSV generation with summaryStats) ...
    const summaryRows = [];
    if (summaryStats) {
      summaryRows.push(''); 
      summaryRows.push('Summary Statistics');
      Object.entries(summaryStats).forEach(([key, value]) => {
        summaryRows.push(`${key},${value}`);
      });
    }

    const csvString = [headers.join(','), ...csvRows, ...summaryRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportTitle}_report.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  };

  // Modified to accept 'reportableColumns'
  const generatePDF = (data, reportTitle, selectedFields, reportableColumns) => {
    if (!data || data.length === 0) return false;
    const summaryStats = calculateSummaryStats(data, reportTitle);
    // ... (PDF setup: doc, pageWidth, etc.) ...
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const roseColor = [224, 49, 70];
    const grayText = [75, 85, 99];
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const head = [reportableColumns
      .filter(col => selectedFields[col.key])
      .map(col => col.label)];

    const body = data.map(row => {
      return reportableColumns
        .filter(col => selectedFields[col.key])
        .map(col => {
          let cellValue = row[col.key];
          if (reportTitle === 'payment') { // PaymentDTO
            if (col.key === 'fullName') cellValue = `${row.lastName || ''}, ${row.firstName || ''} ${row.middleInitial || ''}`.trim();
            else if (col.key === 'program') cellValue = row.program;
            else if (col.key === 'yearSec') cellValue = row.yearLevel && row.section ? `${row.yearLevel} - ${row.section}` : '-';
            else if (col.key === 'status') cellValue = row.status;
            else if (col.key === 'amount') cellValue = row.amount ? parseFloat(row.amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';
          } else if (reportTitle === 'remittance') { // Data is a Remittances object
            if (col.key === 'fullName' || col.key === 'treasurer' || col.key === 'user') cellValue = `${row.lastName || ''}, ${row.firstName || ''} ${row.middleInitial ? row.middleInitial + '.' : ''}`.trim();
            else if (col.key === 'program') cellValue = row.programCode;
            else if (col.key === 'yearSec' || col.key === 'yearAndSection') cellValue = row.yearLevel && row.section ? `${row.yearLevel}-${row.section}` : (row.yearLevel || row.section || '-');
            else if (col.key === 'status') cellValue = row.status;
            else if (col.key === 'amountRemitted') cellValue = row.amountRemitted ? parseFloat(row.amountRemitted).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';
            else if (col.key === 'feeType') cellValue = row.feeType;
            // Ensure other direct fields from Remittances object are accessed if selected
            else if (row.hasOwnProperty(col.key)) {
              cellValue = row[col.key];
            }
          } else if (reportTitle === 'expense') { // Data is ExpenseDTO
            if (col.key === 'expenseCategory') cellValue = row.expenseCategory ? row.expenseCategory.replace(/_/g, ' ') : '';
            else if (col.key === 'amount') cellValue = row.amount ? parseFloat(row.amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';
            else if (col.key === 'expenseStatus') cellValue = row.expenseStatus;
            else if (col.key === 'approvalStatus') cellValue = row.approvalStatus;
            else if (col.key === 'departmentName') cellValue = row.departmentName;
            else if (col.key === 'expenseDate') cellValue = row.expenseDate;
            else if (col.key === 'paymentMethod') cellValue = row.paymentMethod ? row.paymentMethod.replace(/_/g, ' ') : '';
            else if (col.key === 'isRecurring') cellValue = row.isRecurring ? 'Yes' : 'No';
            else if (col.key === 'isTaxInclusive') cellValue = row.isTaxInclusive ? 'Yes' : 'No';
            else if (col.key === 'totalAmount') cellValue = row.totalAmount ? parseFloat(row.totalAmount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';
            else if (col.key === 'netAmount') cellValue = row.netAmount ? parseFloat(row.netAmount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';
            else if (row.hasOwnProperty(col.key)) {
              cellValue = row[col.key];
            }
          } else {
            if (col.render) {
                const rendered = col.render(row[col.key], row);
                if (typeof rendered === 'object') cellValue = row[col.key];
                else cellValue = rendered;
            }
          }
          return String(cellValue == null ? '-' : cellValue);
        });
    });
    // ... (rest of PDF generation with header, summary, autoTable) ...
    const headerY = 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(roseColor[0], roseColor[1], roseColor[2]);
    doc.text("Transparency System", pageWidth / 2, headerY, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    const reportName = reportTitle.charAt(0).toUpperCase() + reportTitle.slice(1) + " Report";
    doc.text(reportName, pageWidth / 2, headerY + 8, { align: 'center' });
    doc.setDrawColor(roseColor[0], roseColor[1], roseColor[2]);
    doc.setLineWidth(0.5);
    doc.line(15, headerY + 12, pageWidth - 15, headerY + 12);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated on: ${date} at ${time}`, pageWidth - 15, headerY + 18, { align: 'right' });

    let startY = headerY + 25;
    if (summaryStats) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(roseColor[0], roseColor[1], roseColor[2]);
      doc.text("Summary Statistics", 15, startY);
      startY += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      Object.entries(summaryStats).forEach(([key, value]) => {
        // Replace Peso sign with PHP for PDF to avoid rendering issues
        const pdfValue = typeof value === 'string' ? value.replace(/₱/g, 'PHP ') : value;
        doc.text(`${key}: ${pdfValue}`, 15, startY);
        startY += 6;
      });
      startY += 5; // Spacing before table
    }

    autoTable(doc, {
      head: head,
      body: body,
      startY: startY,
      // ... (autoTable styles and hooks) ...
        headStyles: { fillColor: roseColor, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'left', fontSize: 10, cellPadding: 4 },
        bodyStyles: { textColor: [50, 50, 50], fontSize: 9, cellPadding: 4, lineColor: [230, 230, 230] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: headerY + 12, right: 15, bottom: 20, left: 15 },
        didDrawPage: function (data) {
          doc.setFontSize(8);
          doc.setTextColor(120, 120, 120);
          doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
        },
    });
    doc.save(`${reportTitle}_report.pdf`);
    return true;
  };

  // Modified to accept 'reportableColumns'
  const generateXLSX = (data, reportTitle, selectedFields, reportableColumns) => {
    if (!data || data.length === 0) return false;
    const summaryStats = calculateSummaryStats(data, reportTitle);
    // ... (XLSX headers and rows setup) ...
    const headers = reportableColumns
      .filter(col => selectedFields[col.key])
      .map(col => col.label);

    const rows = data.map(row => {
      const rowData = {};
      reportableColumns
        .filter(col => selectedFields[col.key])
        .forEach(col => {
          let cellValue = row[col.key];
           if (reportTitle === 'payment') { // PaymentDTO
            if (col.key === 'fullName') cellValue = `${row.lastName || ''}, ${row.firstName || ''} ${row.middleInitial || ''}`.trim();
            else if (col.key === 'program') cellValue = row.program;
            else if (col.key === 'yearSec') cellValue = row.yearLevel && row.section ? `${row.yearLevel} - ${row.section}` : '-';
            else if (col.key === 'status') cellValue = row.status;
            else if (col.key === 'amount') cellValue = row.amount; // Store as number for Excel sum if possible
          } else if (reportTitle === 'remittance') { // Data is a Remittances object
            if (col.key === 'fullName' || col.key === 'treasurer' || col.key === 'user') cellValue = `${row.lastName || ''}, ${row.firstName || ''} ${row.middleInitial ? row.middleInitial + '.' : ''}`.trim();
            else if (col.key === 'program') cellValue = row.programCode;
            else if (col.key === 'yearSec' || col.key === 'yearAndSection') cellValue = row.yearLevel && row.section ? `${row.yearLevel}-${row.section}` : (row.yearLevel || row.section || '-');
            else if (col.key === 'status') cellValue = row.status;
            else if (col.key === 'amountRemitted') cellValue = row.amountRemitted; // Store as number
            else if (col.key === 'feeType') cellValue = row.feeType;
            // Ensure other direct fields from Remittances object are accessed if selected
            else if (row.hasOwnProperty(col.key)) {
              cellValue = row[col.key];
            }
          } else if (reportTitle === 'expense') { // Data is ExpenseDTO
            if (col.key === 'expenseCategory') cellValue = row.expenseCategory ? row.expenseCategory.replace(/_/g, ' ') : '';
            else if (col.key === 'amount') cellValue = row.amount; // Store as number
            else if (col.key === 'expenseStatus') cellValue = row.expenseStatus;
            else if (col.key === 'approvalStatus') cellValue = row.approvalStatus;
            else if (col.key === 'departmentName') cellValue = row.departmentName;
            else if (col.key === 'expenseDate') cellValue = row.expenseDate;
            else if (col.key === 'paymentMethod') cellValue = row.paymentMethod ? row.paymentMethod.replace(/_/g, ' ') : '';
            else if (col.key === 'isRecurring') cellValue = row.isRecurring ? 'Yes' : 'No';
            else if (col.key === 'isTaxInclusive') cellValue = row.isTaxInclusive ? 'Yes' : 'No';
            else if (col.key === 'totalAmount') cellValue = row.totalAmount || row.amount; // Store as number
            else if (col.key === 'netAmount') cellValue = row.netAmount || row.amount; // Store as number
            else if (row.hasOwnProperty(col.key)) {
              cellValue = row[col.key];
            }
          } else {
            if (col.render) {
                const rendered = col.render(row[col.key], row);
                if (typeof rendered === 'object') cellValue = row[col.key];
                else cellValue = rendered;
            }
          }
          // For Excel, try to keep numbers as numbers if they are amounts for easier sum
          if ((col.key === 'amount' || col.key === 'amountRemitted' || col.key === 'totalAmount' || col.key === 'netAmount' || col.key === 'taxAmount') && typeof cellValue === 'string') {
            const num = parseFloat(cellValue.replace(/[^\d.-]/g, ''));
            if (!isNaN(num)) cellValue = num;
          }
          rowData[col.label] = (cellValue == null ? '' : cellValue);
        });
      return rowData;
    });
    
    // ... (XLSX workbook creation, summary sheet, colWidths, and download) ...
    const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
    // Column widths (basic implementation)
    const colWidths = headers.map(header => ({ wch: Math.max(header.length, 15) }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ReportData");

    if (summaryStats) {
      const summaryData = Object.entries(summaryStats).map(([key, value]) => ({ Statistic: key, Value: value }));
      const summaryWS = XLSX.utils.json_to_sheet(summaryData);
      summaryWS['!cols'] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, summaryWS, "Summary");
    }

    XLSX.writeFile(wb, `${reportTitle}_report.xlsx`);
    return true;
  };

  const calculateSummaryStats = (data, reportTitle) => {
    if (!data || data.length === 0) return null;
    const stats = { 'Total Records': data.length };

    if (reportTitle === 'payment') { // PaymentDTO based
      const totalAmount = data.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
      const paidCount = data.filter(row => String(row.status).toUpperCase() === 'PAID').length;
      const pendingCount = data.filter(row => String(row.status).toUpperCase() === 'PENDING').length;
      const remittedCount = data.filter(row => String(row.status).toUpperCase() === 'REMITTED').length;

      stats['Total Amount (Paid, Pending, Remitted)'] = `PHP ${totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      stats['Paid Payments'] = paidCount;
      stats['Pending Payments'] = pendingCount;
      stats['Remitted Payments'] = remittedCount;
    
    } else if (reportTitle === 'remittance') { // Remittances object based
      const totalRemitted = data.reduce((sum, row) => sum + (parseFloat(row.amountRemitted) || 0), 0);
      const completedCount = data.filter(row => String(row.status).toUpperCase() === 'COMPLETED').length;
      const partialCount = data.filter(row => String(row.status).toUpperCase() === 'PARTIAL').length;
      const notRemittedCount = data.filter(row => String(row.status).toUpperCase() === 'NOT_REMITTED').length;

      stats['Total Amount Remitted'] = `₱${totalRemitted.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      stats['Completed Remittances'] = completedCount;
      stats['Partial Remittances'] = partialCount;
      if (notRemittedCount > 0) stats['Not Remitted (by Treasurers in this list)'] = notRemittedCount;
    
    } else if (reportTitle === 'expense') { // ExpenseDTO based
      const totalAmount = data.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
      const paidCount = data.filter(row => String(row.expenseStatus).toUpperCase() === 'PAID').length;
      const pendingCount = data.filter(row => String(row.expenseStatus).toUpperCase() === 'PENDING').length;
      const approvedCount = data.filter(row => String(row.approvalStatus).toUpperCase() === 'APPROVED').length;
      const rejectedCount = data.filter(row => String(row.approvalStatus).toUpperCase() === 'REJECTED').length;
      const categoryCounts = data.reduce((acc, row) => {
        const category = row.expenseCategory || 'Unspecified';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      stats['Total Amount'] = `₱${totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      stats['Paid Expenses'] = paidCount;
      stats['Pending Expenses'] = pendingCount;
      stats['Approved Expenses'] = approvedCount;
      stats['Rejected Expenses'] = rejectedCount;
      stats['Expenses by Category'] = Object.entries(categoryCounts)
        .map(([category, count]) => `${category.replace(/_/g, ' ')}: ${count}`)
        .join(', ');
        
    } else if (reportTitle === 'student') { // Existing student logic
      const activeCount = data.filter(row => String(row.status).toUpperCase() === 'ACTIVE').length;
      const inactiveCount = data.filter(row => String(row.status).toUpperCase() === 'INACTIVE').length;
      const graduatedCount = data.filter(row => String(row.status).toUpperCase() === 'GRADUATED').length;
      const programCounts = data.reduce((acc, row) => {
        const program = row.program || 'Unspecified';
        acc[program] = (acc[program] || 0) + 1;
        return acc;
      }, {});
      stats['Active Students'] = activeCount;
      stats['Inactive Students'] = inactiveCount;
      stats['Graduated Students'] = graduatedCount;
      stats['Students by Program'] = Object.entries(programCounts)
        .map(([program, count]) => `${program}: ${count}`)
        .join(', ');
    }
    return stats;
  };

  // Animation variants
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  
  // Format filter option labels for display
  const getFilterOptionLabel = (option, filterKey) => {
    if (typeof option === 'object') {
      return option.name || option.label || option.programName || option.title || option.id || option.value || 'Unknown';
    }
    return option;
  };
  
  // Get a user-friendly display value for a filter
  const getFilterDisplayValue = (filterKey, value) => {
    if (value === 'all') return "All";
    
    if (filterOptions[filterKey]) {
      const option = filterOptions[filterKey].find(opt => 
        (typeof opt === 'object' ? 
          opt.id === value || opt.value === value : 
          opt === value)
      );
      
      if (option) {
        return typeof option === 'object' ? 
          getFilterOptionLabel(option, filterKey) : 
          option;
      }
    }
    
    return value;
  };

  return (
    <div className="container py-2 mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border-none shadow-lg">
          <CardHeader className="flex flex-col space-y-3 bg-white border-b sm:space-y-0 sm:flex-row sm:items-center sm:justify-between dark:bg-gray-950">
            <CardTitle className="text-xl font-semibold">
              {title ? title.charAt(0).toUpperCase() + title.slice(1) + "s" : "Data"}
              <span className="ml-2 text-sm font-normal text-muted-foreground">({totalRows})</span>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Generate Report Button */}
              {['student', 'remittance', 'payment', 'expense'].includes(title) && !disableReportGeneration && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setReportDialogOpen(true)}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Generate Report</span>
                  <span className="sm:hidden">Report</span>
                </Button>
              )}

              {/* Sort Dropdown */}
              {onSort && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      {getSortIcon()}
                      <span className="hidden ml-1 sm:inline">Sort: {getSortedColumnLabel()}</span>
                      <span className="ml-1 sm:hidden">Sort</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      {columns
                        .filter(col => col.sortable)
                        .map(col => {
                          const field = col.sortKey || col.key;
                          const isCurrentSort = field === sortBy;
                          
                          return (
                            <DropdownMenuItem key={col.key} className="flex justify-between">
                              <span>{col.label}</span>
                              <div className="flex gap-2">
                                <Button
                                  variant={isCurrentSort && sortDir === 'asc' ? "default" : "ghost"}
                                  size="icon"
                                  className={`h-6 w-6 ${isCurrentSort && sortDir === 'asc' ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSort(field, 'asc');
                                  }}
                                >
                                  <ArrowDownAZ className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant={isCurrentSort && sortDir === 'desc' ? "default" : "ghost"}
                                  size="icon"
                                  className={`h-6 w-6 ${isCurrentSort && sortDir === 'desc' ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSort(field, 'desc');
                                  }}
                                >
                                  <ArrowDownZA className="w-4 h-4" />
                                </Button>
                              </div>
                            </DropdownMenuItem>
                          );
                        })}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* Filter Dropdown Menu */}
              {onFilter && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Filter</span>
                      {hasActiveFilters() && (
                        <Badge variant="secondary" className="ml-1">
                          {getActiveFilterCount()}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel className="flex items-center justify-between">
                      <span>Filters</span>
                      {hasActiveFilters() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1 text-xs"
                          onClick={clearFilters}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Clear all
                        </Button>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {/* No filters configured message */}
                    {Object.keys(filterOptions).length === 0 && (
                      <div className="flex items-center px-2 py-4 text-sm text-muted-foreground">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        No filters available
                      </div>
                    )}
                    
                    {/* Filter options */}
                    {Object.entries(filterOptions).map(([filterKey, options]) => (
                      <DropdownMenuSub key={filterKey}>
                        <DropdownMenuSubTrigger>
                          <span className="flex items-center justify-between w-full">
                            <span>{filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}</span>
                            <span className="text-xs text-muted-foreground">
                              {getFilterDisplayValue(filterKey, filters[filterKey] || 'all')}
                            </span>
                          </span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className="overflow-y-auto max-h-60">
                            <DropdownMenuItem 
                              className={filters[filterKey] === 'all' || !filters[filterKey] ? 'bg-muted' : ''}
                              onClick={() => handleFilter(filterKey, 'all')}
                            >
                              All {filterKey.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </DropdownMenuItem>
                            
                            {Array.isArray(options) && options.map((option) => {
                              const optionValue = typeof option === 'object' ? 
                                option.id || option.value || option.programId : 
                                option;
                              
                              const isSelected = filters[filterKey] === optionValue;
                              
                              return (
                                <DropdownMenuItem 
                                  key={optionValue} 
                                  className={isSelected ? 'bg-muted' : ''}
                                  onClick={() => handleFilter(filterKey, optionValue)}
                                >
                                  {getFilterOptionLabel(option, filterKey)}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    ))}
                    
                    {/* Active filters */}
                    {hasActiveFilters() && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Active filters</DropdownMenuLabel>
                        {Object.entries(filters).map(([filterKey, value]) => {
                          if (value === 'all') return null;
                          
                          return (
                            <DropdownMenuItem key={`${filterKey}-${value}`} className="flex items-center justify-between">
                              <span>
                                <span className="font-medium">{filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}:</span>
                                {' '}
                                <span className="text-muted-foreground">
                                  {getFilterDisplayValue(filterKey, value)}
                                </span>
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-5 h-5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFilter(filterKey, 'all');
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </DropdownMenuItem>
                          );
                        })}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* Add Button */}
              {showAdd && (
                <Button onClick={showAdd} className="transition-colors bg-rose-600 hover:bg-rose-700">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add new {title}
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto rounded-md">
              <motion.div variants={tableVariants} initial="hidden" animate="visible">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      {columns
                        .filter(column => !column.hidden)
                        .map((column, index) => (
                          <TableHead 
                            key={index} 
                            className="font-medium"
                            onClick={() => column.sortable && onSort && onSort(column.sortKey || column.key, sortDir === 'asc' ? 'desc' : 'asc')}
                            style={column.sortable ? { cursor: 'pointer' } : {}}
                          >
                            <div className="flex items-center">
                              {column.label}
                              {onSort && column.sortable && sortBy === (column.sortKey || column.key) && (
                                sortDir === 'asc' 
                                  ? <ChevronUp className="w-4 h-4 ml-1" /> 
                                  : <ChevronDown className="w-4 h-4 ml-1" />
                              )}
                            </div>
                          </TableHead>
                        ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={columns.filter(c => !c.hidden).length} className="h-32 text-center">
                          <div className="flex items-center justify-center">
                            <div className="w-6 h-6 border-4 rounded-full border-t-rose-600 animate-spin"></div>
                            <span className="ml-2">Loading...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : paginatedData && paginatedData.length > 0 ? (
                      paginatedData.map((row, rowIndex) => (
                        <motion.tr
                          key={rowIndex}
                          variants={rowVariants}
                          className="transition-colors border-b hover:bg-muted/50"
                        >
                          {columns
                            .filter(column => !column.hidden)
                            .map((column, colIndex) => (
                              <TableCell key={`${rowIndex}-${colIndex}`} className="h-12 py-2">
                                {column.render ? column.render(row[column.key], row) : row[column.key]}
                              </TableCell>
                            ))}
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.filter(c => !c.hidden).length} className="h-32 text-center text-muted-foreground">
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </motion.div>
            </div>

            <div className="flex flex-col p-4 space-y-4 border-t sm:flex-row sm:space-y-0 sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page:</span>
                <Select value={rowsPerPage.toString()} onValueChange={onRowsPerPageChange || (()=>{})}>
                  <SelectTrigger className="h-8 w-[70px] border-0">
                    <SelectValue placeholder={rowsPerPage} />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="ml-2 text-sm text-muted-foreground whitespace-nowrap">{getPaginationInfo()}</span>
              </div>

              <div className="flex items-center self-end max-sm:self-auto">
                <span className="mr-2 text-sm text-muted-foreground whitespace-nowrap">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-24 h-8 max-sm:w-8"
                    onClick={() => onPageChange && onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <PaginationPrevious className="w-4 h-4" />
                    <span className="sr-only">Previous page</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-24 h-8 max-sm:w-8"
                    onClick={() => onPageChange && onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalRows === 0}
                  >
                    <PaginationNext className="w-4 h-4" />
                    <span className="sr-only">Next page</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Report Generation Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-lg"> {/* Increased width for more filters */}
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center text-rose-600">
                <FileText className="w-5 h-5 mr-2 text-rose-600" />
                Generate Report
              </div>
            </DialogTitle>
            <DialogDescription>
              Select options to generate a {title} report. 
              {(title === 'payment' || title === 'remittance') && 
                <span className="block mt-1 text-sm text-amber-700">A specific 'Fee Type' is required for this report.</span>
              }
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <Label htmlFor="reportFormat">Report Format <span className="text-rose-600">*</span></Label>
              <RadioGroup 
                id="reportFormat"
                value={reportFormat} 
                onValueChange={setReportFormat}
                className="flex gap-4 mt-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" className="data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600 focus:ring-rose-500" />
                  <Label htmlFor="pdf">PDF</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excel" id="excel" className="data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600 focus:ring-rose-500" />
                  <Label htmlFor="excel">Excel</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" className="data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600 focus:ring-rose-500" />
                  <Label htmlFor="csv">CSV</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Include Columns <span className="text-rose-600">*</span></Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {columns
                  .filter(column => !column.hidden && column.key !== "actions")
                  .map((column) => (
                    <div key={column.key} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`field-${column.key}`}
                        checked={reportFields[column.key] || false}
                        onCheckedChange={() => toggleReportField(column.key)}
                        className="data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600 focus:ring-rose-500"
                      />
                      <Label htmlFor={`field-${column.key}`} className="text-sm">
                        {column.label}
                      </Label>
                    </div>
                  ))}
              </div>
            </div>
            
            <DropdownMenuSeparator />
            <Label className="mt-2 mb-1 text-sm font-medium text-gray-700">Report Filters</Label>
            
            {/* Common Filters for all report types */} 
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {/* Expense-specific filters */}
              {title === 'expense' && (
                <>
                  <div className="col-span-2">
                    <Label htmlFor="reportExpenseCategory" className="text-xs">
                      Expense Category
                    </Label>
                    <Select 
                      name="expenseCategory"
                      value={reportFilters.expenseCategory || 'all'}
                      onValueChange={(value) => handleReportFilterChange('expenseCategory', value)}
                    >
                      <SelectTrigger className="w-full mt-1 text-xs h-9">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {filterOptions.expenseCategory?.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="reportExpenseStatus" className="text-xs">Expense Status</Label>
                    <Select 
                      name="expenseStatus"
                      value={reportFilters.expenseStatus || 'all'}
                      onValueChange={(value) => handleReportFilterChange('expenseStatus', value)}
                    >
                      <SelectTrigger className="w-full mt-1 text-xs h-9">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {filterOptions.expenseStatus?.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="reportApprovalStatus" className="text-xs">Approval Status</Label>
                    <Select 
                      name="approvalStatus"
                      value={reportFilters.approvalStatus || 'all'}
                      onValueChange={(value) => handleReportFilterChange('approvalStatus', value)}
                    >
                      <SelectTrigger className="w-full mt-1 text-xs h-9">
                        <SelectValue placeholder="Select Approval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Approvals</SelectItem>
                        {filterOptions.approvalStatus?.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="reportDepartment" className="text-xs">Department</Label>
                    <Select 
                      name="departmentId"
                      value={reportFilters.departmentId || 'all'}
                      onValueChange={(value) => handleReportFilterChange('departmentId', value)}
                    >
                      <SelectTrigger className="w-full mt-1 text-xs h-9">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {filterOptions.departmentId?.map(dept => (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="reportAcademicYear" className="text-xs">Academic Year</Label>
                    <Select 
                      name="academicYear"
                      value={reportFilters.academicYear || 'all'}
                      onValueChange={(value) => handleReportFilterChange('academicYear', value)}
                    >
                      <SelectTrigger className="w-full mt-1 text-xs h-9">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {filterOptions.academicYear?.map(year => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="reportSemester" className="text-xs">Semester</Label>
                    <Select 
                      name="semester"
                      value={reportFilters.semester || 'all'}
                      onValueChange={(value) => handleReportFilterChange('semester', value)}
                    >
                      <SelectTrigger className="w-full mt-1 text-xs h-9">
                        <SelectValue placeholder="Select Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Semesters</SelectItem>
                        {filterOptions.semester?.map(sem => (
                          <SelectItem key={sem.value} value={sem.value}>
                            {sem.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Fee Type Filter - mandatory for payment/remittance */} 
              {(title === 'payment' || title === 'remittance') && (
                <div className="col-span-2"> {/* Make it full width for emphasis */}
                  <Label htmlFor="reportFeeType" className="text-xs">
                    Fee Type <span className="text-rose-600">* (Required for {title} report)</span>
                  </Label>
                  <Select 
                    name="feeType" // This will be mapped to feeId in handleGenerateReport
                    value={reportFilters.feeType} // Ensure reportFilters.feeType is managed
                    onValueChange={(value) => handleReportFilterChange('feeType', value)}
                  >
                    <SelectTrigger className="w-full mt-1 text-xs h-9">
                      <SelectValue placeholder="Select Fee Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Do NOT include 'All Fee Types' if it's mandatory */}
                      {/* <SelectItem value="all">All Fee Types</SelectItem> */}
                      {(title === 'payment' ? filterOptions.feeType : filterOptions.fee)?.map(fee => (
                        <SelectItem key={fee.id || fee.name} value={fee.id || fee.name}>
                          {fee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Program, Year, Section filters for payment/remittance/student reports */}
              {(title === 'payment' || title === 'remittance' || title === 'student') && (
                <>
                  <div>
                    <Label htmlFor="reportProgram" className="text-xs">Program</Label>
                    <Select 
                      name="program"
                      value={reportFilters.program}
                      onValueChange={(value) => handleReportFilterChange('program', value)}
                    >
                      <SelectTrigger className="w-full mt-1 text-xs h-9">
                        <SelectValue placeholder="Select Program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Programs</SelectItem>
                        {filterOptions.program?.map(prog => (
                          <SelectItem key={prog.id || prog.name} value={prog.id || prog.name}>
                            {prog.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reportYearLevel" className="text-xs">Year Level</Label>
                    <Select 
                      name="yearLevel"
                      value={reportFilters.yearLevel}
                      onValueChange={(value) => handleReportFilterChange('yearLevel', value)}
                    >
                      <SelectTrigger className="w-full mt-1 text-xs h-9">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Year Levels</SelectItem>
                        {filterOptions.yearLevel?.map(yl => (
                          <SelectItem key={yl} value={yl}>{yl}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reportSection" className="text-xs">Section</Label>
                    <Select 
                      name="section"
                      value={reportFilters.section}
                      onValueChange={(value) => handleReportFilterChange('section', value)}
                    >
                      <SelectTrigger className="w-full mt-1 text-xs h-9">
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sections</SelectItem>
                        {filterOptions.section?.map(sec => (
                          <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reportStatus" className="text-xs">Status</Label>
                    <Select 
                      name="status"
                      value={reportFilters.status}
                      onValueChange={(value) => handleReportFilterChange('status', value)}
                    >
                      <SelectTrigger className="w-full mt-1 text-xs h-9">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {filterOptions.status?.map(stat => (
                          <SelectItem key={stat} value={stat}>{stat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Remitted By Filter (Only for Remittance Report) */} 
              {title === 'remittance' && (
                <div>
                  <Label htmlFor="reportRemittedBy" className="text-xs">Remitted By (Treasurer)</Label>
                  <Select 
                    name="remittedBy" // This will be mapped to accountId
                    value={reportFilters.remittedBy}
                    onValueChange={(value) => handleReportFilterChange('remittedBy', value)}
                  >
                    <SelectTrigger className="w-full mt-1 text-xs h-9">
                      <SelectValue placeholder="Select Treasurer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Treasurers</SelectItem>
                      {filterOptions.remittedBy?.map(user => (
                        <SelectItem key={user.id || user.name} value={user.id || user.name}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 mt-6">
            <Button type="button" className="cursor-pointer" variant="outline" onClick={() => setReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              className="cursor-pointer bg-rose-600 hover:bg-rose-600/90"
              onClick={handleGenerateReport}
            >
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataTable;

