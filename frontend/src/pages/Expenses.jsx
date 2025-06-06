import React, { useEffect, useState } from 'react';
import { expenseService, departmentService, feeService, accountService, fileUtils } from '../utils/apiService';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from '../components/ui/pagination';
import { AlertCircle, Receipt, Pencil, CheckCircle, Ban, FileText, Grid, List, ArrowUpDown, Filter, ChevronDown, Search, CreditCard, Download } from 'lucide-react';
import DataTable from '../components/DataTable';
import ActionButton from '../components/ActionButton';
import { ExpenseCard } from '../components/ExpenseComponents';
import { formatCurrency, formatDate } from '../utils/formatUtils';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import { useAuth } from '../context/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';

const EXPENSE_CATEGORIES = [
  'OFFICE_SUPPLIES', 'UTILITIES', 'MAINTENANCE', 'TRANSPORTATION', 'COMMUNICATION', 'EVENTS', 'TRAINING', 'EQUIPMENT', 'SOFTWARE_LICENSES', 'PRINTING', 'CATERING', 'SECURITY', 'CLEANING', 'RENT', 'INSURANCE', 'LEGAL_FEES', 'CONSULTING', 'MARKETING', 'STUDENT_ACTIVITIES', 'EMERGENCY_FUND', 'MISCELLANEOUS'
];
const PAYMENT_METHODS = [
  'CASH', 'CHECK', 'BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'ONLINE_PAYMENT', 'PETTY_CASH'
];
const EXPENSE_STATUSES = ['PENDING', 'PAID'];
const APPROVAL_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];
const RECURRING_FREQUENCIES = [
  'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMESTERLY', 'ANNUALLY'
];
const SEMESTERS = ['1st', '2nd'];
const ACADEMIC_YEARS = Array.from({length: 5}, (_, i) => `${2020 + i}-${2021 + i}`);

const defaultExpense = {
  // Only include fields that are part of ExpenseInputDTO
  expenseTitle: '',
  expenseCategory: '',
  amount: '',
  expenseDescription: '',
  vendorSupplier: '',
  receiptInvoiceNumber: '',
  expenseDate: '',
  paymentDate: '',
  paymentMethod: 'CASH',
  departmentId: null,
  relatedFeeId: null,
  budgetAllocation: '',
  isRecurring: false,
  recurringFrequency: null,
  academicYear: ACADEMIC_YEARS.length > 0 ? ACADEMIC_YEARS[ACADEMIC_YEARS.length - 1] : null,
  semester: SEMESTERS.length > 0 ? SEMESTERS[0] : null,
  documentationPath: '',
  taxAmount: '',
  isTaxInclusive: false,
  remarks: '',
};

const Expenses = () => {
  const { can } = useAuth();
  
  // Basic UI states
  const [viewMode, setViewMode] = useState('cards');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Pagination states
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(viewMode === 'cards' ? 6 : 10);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting states
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('DESC');

  // Filter states
  const [filters, setFilters] = useState({});
  const [showCardFilters, setShowCardFilters] = useState(false);
  const [cardFilters, setCardFilters] = useState({
    search: '',
    category: '',
    department: '',
    status: ''
  });

  // Data states
  const [expenses, setExpenses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [fees, setFees] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [form, setForm] = useState(defaultExpense);

  // Page-level messages
  const [pageError, setPageError] = useState('');
  const [pageSuccess, setPageSuccess] = useState('');

  // Delete Confirmation Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Card expansion state - only one card can be expanded at a time
  const [expandedCardId, setExpandedCardId] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    hover: {
      scale: 1.02,
      transition: { type: "spring", stiffness: 400, damping: 17 }
    }
  };

  // Reset page when switching tabs or changing filters
  useEffect(() => {
    setPage(0);
    setPageError('');
    setPageSuccess('');
    setExpandedCardId(null); // Collapse all cards when switching tabs or filters
  }, [activeTab, cardFilters, viewMode]);

  // Fetch selectors
  useEffect(() => {
    departmentService.getDepartments(0, 100).then(res => setDepartments(res.content || []));
    feeService.getFees(0, 100).then(res => setFees(res.content || []));
    accountService.getAccounts(0, 100).then(res => setAccounts(res.content || []));
  }, []);

  // Fetch expenses with filters, pagination, sorting
  const fetchExpenses = async () => {
    setLoading(true);
    setError(''); // Clear form error
    setPageError(''); // Clear page error
    // Do not clear pageSuccess here, let it persist until next action

    try {
      // Start with pagination and sorting params
      const params = {
        page,
        size,
        sortBy,
        sortDirection
      };

      // Add approval status filter based on active tab
      if (activeTab === 'pending') {
        params.approvalStatus = 'PENDING';
      } else if (activeTab === 'approved') {
        params.approvalStatus = 'APPROVED';
      } else if (activeTab === 'rejected') {
        params.approvalStatus = 'REJECTED';
      }

      // Add card filters when in card view
      if (viewMode === 'cards') {
        if (cardFilters.search?.trim()) {
          params.searchTerm = cardFilters.search.trim();
        }
        if (cardFilters.category && cardFilters.category !== 'all' && cardFilters.category !== '') {
          params.category = cardFilters.category;
        }
        if (cardFilters.department && cardFilters.department !== 'all' && cardFilters.department !== '') {
          params.departmentId = cardFilters.department;
        }
        if (cardFilters.status && cardFilters.status !== 'all' && cardFilters.status !== '') {
          params.expenseStatus = cardFilters.status;
        }
      } else {
        // Add table filters, only including non-empty values
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== 'all' && value !== '') {
            params[key] = value;
          }
        });
      }

      console.log('Fetching expenses with params:', params); // Debug log

      const data = await expenseService.getExpenses(params);
      setExpenses(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load expenses:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load expenses';
      setPageError(errorMessage);
      setError(errorMessage); // Also set form error for visibility if dialog was open
      setExpenses([]); // Clear expenses on error
      setTotalPages(1);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, [filters, page, size, sortBy, sortDirection, activeTab, viewMode]);

  // Reset page when switching views or changing tab
  useEffect(() => {
    setPage(0);
    setSize(viewMode === 'cards' ? 6 : 10);
    setExpandedCardId(null); // Collapse all cards when switching view modes
  }, [viewMode, activeTab]);

  // Reset card filters when switching away from cards view
  useEffect(() => {
    if (viewMode !== 'cards') {
      setCardFilters({
        search: '',
        category: '',
        department: '',
        status: ''
      });
      setPageError(''); // Clear errors when view mode changes
      setPageSuccess('');
    }
  }, [viewMode]);

  // Card filters with debouncing - separate useEffect for card view only
  useEffect(() => {
    if (viewMode === 'cards') {
      const timeoutId = setTimeout(() => {
        fetchExpenses();
      }, cardFilters.search ? 500 : 0); // 500ms debounce for search, immediate for other filters

      return () => clearTimeout(timeoutId);
    }
  }, [cardFilters, activeTab, page, size, sortBy, sortDirection]); // Only for card filters

  const openForm = (mode, expense = null) => {
    setDialogMode(mode);
    setSelectedExpense(expense);

    if (mode === 'create') {
      const newExpenseForm = { ...defaultExpense };

      if (departments.length > 0 && departments[0].departmentId !== undefined) {
        newExpenseForm.departmentId = departments[0].departmentId.toString();
      } else {
        newExpenseForm.departmentId = null;
      }
      
      if (fees.length > 0 && fees[0].feeId !== undefined) {
        newExpenseForm.relatedFeeId = fees[0].feeId.toString();
      } else {
        newExpenseForm.relatedFeeId = null; 
      }
      
      // Always set semester to first option
      if (SEMESTERS.length > 0) {
        newExpenseForm.semester = SEMESTERS[0];
      }

      // Always set academic year to current or most recent
      if (ACADEMIC_YEARS.length > 0) {
        newExpenseForm.academicYear = ACADEMIC_YEARS[ACADEMIC_YEARS.length - 1];
      }

      setForm(newExpenseForm);
    } else if (expense) {
      // For edit mode, ensure IDs are strings if they exist
      const editForm = { ...defaultExpense, ...expense };
      if (editForm.departmentId !== null && editForm.departmentId !== undefined) {
        editForm.departmentId = editForm.departmentId.toString();
      }
      if (editForm.relatedFeeId !== null && editForm.relatedFeeId !== undefined) {
        editForm.relatedFeeId = editForm.relatedFeeId.toString();
      }
      setForm(editForm);
    } else {
      setForm({ ...defaultExpense });
    }
    
    setOpenDialog(true);
    setError(''); // Clear form-specific error
    setPageError(''); // Clear page-level error when opening dialog
    setPageSuccess(''); // Clear page-level success when opening dialog
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else if (type === 'file') {
      // Store the actual file object for upload
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear form error for new submission attempt
    setPageError('');
    setPageSuccess('');

    try {
      let payload = { ...form };
      
      // Remove expenseReference from payload when creating a new expense
      // The backend will generate this automatically
      if (dialogMode === 'create' && payload.expenseReference) {
        delete payload.expenseReference;
      }
      
      // Handle 'none' values from select components that still have a "None" option
      const fieldsWithNoneOption = ['departmentId']; 
      fieldsWithNoneOption.forEach(field => {
        if (payload[field] === 'none') {
          payload[field] = null;
        }
      });

      // Validate required fields that are selects
      if (!payload.semester) {
        throw new Error("Semester is required.");
      }
      if (!payload.relatedFeeId) {
        throw new Error("Related Fee is required.");
      }
      if (!payload.paymentMethod) { // paymentMethod defaults to CASH, but user could try to clear it if UI allowed
        throw new Error("Payment Method is required.");
      }
      if (!payload.budgetAllocation?.trim()) {
        throw new Error("Budget Allocation is required.");
      }
      if (!payload.departmentId) {
        throw new Error("Department is required.");
      }
      if (!payload.academicYear) {
        throw new Error("Academic Year is required.");
      }

      // Special handling for recurringFrequency
      if (!payload.isRecurring) {
        // If not recurring, always set frequency to null
        payload.recurringFrequency = null;
      } else if (payload.isRecurring && (!payload.recurringFrequency || payload.recurringFrequency === 'none' || payload.recurringFrequency === '')) {
        // If recurring is checked but no frequency is selected, set a validation error
        throw new Error("Please select a recurring frequency");
      }
      
      // Handle empty strings for enum fields - convert to null to avoid parse errors
      const enumFields = ['expenseCategory', 'paymentMethod', 'recurringFrequency'];
      enumFields.forEach(field => {
        if (payload[field] === '') {
          payload[field] = null;
        }
      });
      
      // Handle file upload
      const documentationFile = form.documentationPath instanceof File ? form.documentationPath : null;
      
      // Remove documentationPath from payload if it's a File object
      if (payload.documentationPath instanceof File) {
        delete payload.documentationPath;
      }
      
      // Only include fields that are part of ExpenseInputDTO
      const allowedFields = [
        'expenseReference', 'expenseTitle', 'expenseCategory', 'amount', 'expenseDescription',
        'vendorSupplier', 'receiptInvoiceNumber', 'expenseDate', 'paymentDate', 'paymentMethod',
        'budgetAllocation', 'isRecurring', 'recurringFrequency', 'academicYear', 'semester',
        'taxAmount', 'isTaxInclusive', 'remarks', 'departmentId', 'relatedFeeId', 'documentationPath'
      ];
      
      // Create a clean payload with only allowed fields
      const cleanPayload = {};
      allowedFields.forEach(field => {
        if (payload.hasOwnProperty(field)) {
          cleanPayload[field] = payload[field];
        }
      });
      
      payload = cleanPayload;
      
      let successMsg = '';
      if (dialogMode === 'create') {
        let created;
        if (documentationFile) {
          created = await expenseService.createExpenseWithFile(payload, documentationFile);
        } else {
          created = await expenseService.createExpense(payload);
        }
        successMsg = `Expense '${created.expenseTitle}' created successfully.`;
      } else if (dialogMode === 'edit' && selectedExpense) {
        let updated;
        if (documentationFile) {
          updated = await expenseService.updateExpenseWithFile(selectedExpense.expenseId, payload, documentationFile);
        } else {
          updated = await expenseService.updateExpense(selectedExpense.expenseId, payload);
        }
        successMsg = `Expense '${updated.expenseTitle}' updated successfully.`;
      } else if (dialogMode === 'approve' && selectedExpense) {
        const approved = await expenseService.approveExpense(selectedExpense.expenseId, form.approvalRemarks || '');
        successMsg = `Expense '${approved.expenseTitle}' approved.`;
      } else if (dialogMode === 'reject' && selectedExpense) {
        const rejected = await expenseService.rejectExpense(selectedExpense.expenseId, form.approvalRemarks || '');
        successMsg = `Expense '${rejected.expenseTitle}' rejected.`;
      } else if (dialogMode === 'pay' && selectedExpense) {
        const paid = await expenseService.markAsPaid(selectedExpense.expenseId, form.paymentDate || null);
        successMsg = `Expense '${paid.expenseTitle}' marked as paid.`;
      }
      setOpenDialog(false);
      setSelectedExpense(null);
      setForm({ ...defaultExpense });
      fetchExpenses(); // This will clear pageError set by fetch if any, and then list expenses
      setPageSuccess(successMsg);
    } catch (err) {
      console.error("Error submitting form:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Operation failed. Please check all fields and try again.';
      setError(errorMessage); // Set form-specific error for display in dialog
      // setPageError(errorMessage); // Optionally set page error too, but form error is more direct for dialog context
    }
    setLoading(false);
  };

  const handleDeleteRequest = (expense) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
    setPageError(''); // Clear previous page errors
    setPageSuccess(''); // Clear previous page successes
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;

    setIsDeleting(true);
    setPageError('');
    setPageSuccess('');

    const expenseTitle = expenseToDelete.expenseTitle || `ID ${expenseToDelete.expenseId}`;

    try {
      await expenseService.deleteExpense(expenseToDelete.expenseId);
      fetchExpenses(); // Refresh list
      setPageSuccess(`Expense '${expenseTitle}' deleted successfully.`);
    } catch (err) {
      console.error("Error deleting expense:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Delete failed';
      setPageError(errorMessage);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  // Filter options for DataTable - use category consistently
  const filterOptions = {
    category: EXPENSE_CATEGORIES.map(cat => ({ value: cat, label: cat.replace(/_/g, ' ') })),
    departmentId: departments.map(dep => ({ value: dep.departmentId, label: dep.departmentName })),
    approvalStatus: APPROVAL_STATUSES.map(status => ({ value: status, label: status.replace(/_/g, ' ') })),
    academicYear: ACADEMIC_YEARS.map(year => ({ value: year, label: year })),
    semester: SEMESTERS.map(sem => ({ value: sem, label: sem })),
    expenseStatus: EXPENSE_STATUSES.map(status => ({ value: status, label: status.replace(/_/g, ' ') }))
  };

  // Filtering handler for DataTable
  const handleTableFilter = (filterName, value) => {
    setFilters({ ...filters, [filterName]: value });
    setPage(0);
  };

  // Sorting handler for DataTable
  const handleTableSort = (field, dir) => {
    setSortBy(field);
    setSortDirection(dir);
  };

  // Table columns with improved organization
  const columns = [
    // Group 1: Core expense info
    { key: 'expenseReference', label: 'Reference', sortable: true, width: '100px' },
    { key: 'expenseTitle', label: 'Title', sortable: true },
    { key: 'expenseCategory', label: 'Category', sortable: true, render: (cat) => cat ? cat.replace(/_/g, ' ') : '-' },
    { key: 'amount', label: 'Amount', sortable: true, width: '120px', render: (amt) => amt ? formatCurrency(amt) : '-' },
    { key: 'documentationPath', label: 'Documentation', width: '120px', render: (path) => {
      if (!fileUtils.hasFile(path)) return <span className="text-gray-400">No file</span>;
      const fileName = fileUtils.getFileName(path);
      return (
        <div className="flex flex-col gap-1">
          <a 
            href={fileUtils.getFileViewUrl(path)}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-xs underline truncate max-w-[100px]"
            title={fileName}
          >
            📎 {fileName}
          </a>
        </div>
      );
    }},
    
    // Group 2: Status indicators - important for quick visual filtering
    { key: 'expenseStatus', label: 'Status', sortable: true, width: '110px', render: (status) => {
      let statusClass = '';
      if (status === 'PAID') statusClass = 'bg-green-100 text-green-700';
      else if (status === 'PENDING') statusClass = 'bg-yellow-100 text-yellow-700';
      else if (status === 'CANCELLED') statusClass = 'bg-gray-100 text-gray-700';
      else if (status === 'REFUNDED') statusClass = 'bg-blue-100 text-blue-700';
      else if (status === 'DISPUTED') statusClass = 'bg-rose-100 text-rose-700';
      else statusClass = 'bg-gray-100 text-gray-700';
      return <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClass}`}>{status ? status.replace(/_/g, ' ') : '-'}</span>;
    }},
    { key: 'approvalStatus', label: 'Approval', sortable: true, width: '110px', render: (status) => {
      let statusClass = '';
      if (status === 'APPROVED') statusClass = 'bg-green-100 text-green-700';
      else if (status === 'PENDING') statusClass = 'bg-yellow-100 text-yellow-700';
      else if (status === 'REJECTED') statusClass = 'bg-rose-100 text-rose-700';
      else statusClass = 'bg-gray-100 text-gray-700';
      return <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClass}`}>{status ? status.replace(/_/g, ' ') : '-'}</span>;
    }},
    
    // Group 3: Vendor and receipt info
    { key: 'vendorSupplier', label: 'Vendor', render: (v) => v || '-' },
    { key: 'expenseDate', label: 'Date', sortable: true, width: '120px', render: (date) => date ? formatDate(date) : '-' },
    { key: 'paymentMethod', label: 'Payment', render: (v) => v ? v.replace(/_/g, ' ') : '-' },
    
    // Group 4: Department and budget info
    { key: 'departmentName', label: 'Department', render: (v) => v || '-' },
    { key: 'budgetAllocation', label: 'Budget', render: (v) => v || '-' },
    
    // Group 5: Actions column (always last)
    {
      key: 'actions',
      label: 'Actions',
      width: '150px',
      render: (_, row) => {
        const extraActions = [
          {
            label: 'Mark as Paid',
            onClick: () => openForm('pay', row),
            disabled: row.approvalStatus !== 'APPROVED' || row.expenseStatus === 'PAID',
          },
        ];

        // Only show approve/reject actions for admin users
        if (can.manageSystem()) {
          extraActions.unshift(
            {
              label: 'Approve',
              onClick: () => openForm('approve', row),
              disabled: row.approvalStatus === 'APPROVED',
            },
            {
              label: 'Reject',
              onClick: () => openForm('reject', row),
              disabled: row.approvalStatus === 'REJECTED',
            }
          );
        }

        return (
          <ActionButton
            row={row}
            idField="expenseId"
            onEdit={() => openForm('edit', row)}
            onDelete={() => handleDeleteRequest(row)}
            extraActions={extraActions}
          />
        );
      },
    },
  ];

  return (
    <motion.div 
      className="min-h-screen p-4 sm:p-6 bg-gray-50/30"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page header with actions - only show in cards view */}
      {viewMode === 'cards' && (
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-bold text-gray-800">Expenses Management</h2>
          <div className="flex gap-2">
            <Button 
              onClick={() => openForm('create')}
              className="flex items-center gap-2 px-4 py-2 shadow-sm bg-rose-600 hover:bg-rose-700"
            >
              <Receipt className="w-4 h-4" />
              Add Expense
            </Button>
          </div>
        </div>
      )}
      
      {/* Page Level Error Message */}
      {pageError && (
        <div className="flex items-center p-3 mb-4 border rounded-lg shadow-sm border-rose-200 bg-rose-50 text-rose-600">
          <AlertCircle className="flex-shrink-0 w-4 h-4 mr-2" />
          {pageError}
        </div>
      )}
      {/* Page Level Success Message */}
      {pageSuccess && (
        <div className="flex items-center p-3 mb-4 text-green-700 border border-green-200 rounded-md shadow-sm bg-green-50">
          <CheckCircle className="flex-shrink-0 w-4 h-4 mr-2" />
          {pageSuccess}
        </div>
      )}
      
      {/* View mode and tab filters */}
      <div className="mb-6">
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 sm:grid-cols-3 lg:grid-cols-5 lg:w-auto lg:max-w-2xl">
                <TabsTrigger value="all" className="flex items-center gap-1 text-xs sm:text-sm data-[state=active]:bg-rose-600 data-[state=active]:text-white">
                  <FileText className="w-3 h-3" /> 
                  <span className="hidden sm:inline">All</span>
                  <Badge variant="secondary" className="ml-1 bg-gray-200 text-gray-700 px-1.5 py-0 text-xs">
                    {expenses.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex items-center gap-1 text-xs sm:text-sm data-[state=active]:bg-rose-600 data-[state=active]:text-white">
                  <AlertCircle className="w-3 h-3" /> 
                  <span className="hidden sm:inline">Pending</span>
                  <Badge variant="secondary" className="ml-1 bg-rose-100 text-rose-700 px-1.5 py-0 text-xs">
                    {expenses.filter(exp => exp.approvalStatus === 'PENDING').length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="approved" className="flex items-center gap-1 text-xs sm:text-sm data-[state=active]:bg-rose-600 data-[state=active]:text-white">
                  <CheckCircle className="w-3 h-3" /> 
                  <span className="hidden sm:inline">Approved</span>
                  <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700 px-1.5 py-0 text-xs">
                    {expenses.filter(exp => exp.approvalStatus === 'APPROVED').length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="rejected" className="flex items-center gap-1 text-xs sm:text-sm data-[state=active]:bg-rose-600 data-[state=active]:text-white">
                  <Ban className="w-3 h-3" /> 
                  <span className="hidden sm:inline">Rejected</span>
                  <Badge variant="secondary" className="ml-1 bg-gray-100 text-gray-700 px-1.5 py-0 text-xs">
                    {expenses.filter(exp => exp.approvalStatus === 'REJECTED').length}
                  </Badge>
                </TabsTrigger>
                
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant={viewMode === 'cards' ? 'default' : 'outline'} 
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-2 px-3 py-2 ${viewMode === 'cards' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'border-rose-200 text-rose-600 hover:bg-rose-50'}`}
                  size="sm"
                >
                  <Grid className="w-4 h-4" />
                  <span className="hidden sm:inline">Cards</span>
                </Button>
                <Button 
                  variant={viewMode === 'table' ? 'default' : 'outline'} 
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-2 px-3 py-2 ${viewMode === 'table' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'border-rose-200 text-rose-600 hover:bg-rose-50'}`}
                  size="sm"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">Table</span>
                </Button>
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Card view */}
      {viewMode === 'cards' ? (
        <div className="space-y-6">
          {/* Card filters */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                onClick={() => setShowCardFilters(!showCardFilters)}
                className="flex items-center gap-2 border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showCardFilters ? 'rotate-180' : ''}`} />
              </Button>
              
              <div className="flex items-center w-full gap-2 sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    placeholder="Search expenses..."
                    value={cardFilters.search}
                    onChange={(e) => setCardFilters({...cardFilters, search: e.target.value})}
                    className="pl-10 border-gray-200 focus:border-rose-300 focus:ring-rose-200"
                  />
                </div>
              </div>
            </div>
            
            {showCardFilters && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Category</Label>
                    <Select value={cardFilters.category} onValueChange={(value) => setCardFilters({...cardFilters, category: value === 'all' ? '' : value})}>
                      <SelectTrigger className="mt-1 border-gray-200 focus:border-rose-300">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {EXPENSE_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Department</Label>
                    <Select value={cardFilters.department} onValueChange={(value) => setCardFilters({...cardFilters, department: value === 'all' ? '' : value})}>
                      <SelectTrigger className="mt-1 border-gray-200 focus:border-rose-300">
                        <SelectValue placeholder="All departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All departments</SelectItem>
                        {departments.map(dep => (
                          <SelectItem key={dep.departmentId} value={dep.departmentId.toString()}>
                            {dep.departmentName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <Select value={cardFilters.status} onValueChange={(value) => setCardFilters({...cardFilters, status: value === 'all' ? '' : value})}>
                      <SelectTrigger className="mt-1 border-gray-200 focus:border-rose-300">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        {EXPENSE_STATUSES.map(status => (
                          <SelectItem key={status} value={status}>
                            {status.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => setCardFilters({search: '', category: '', department: '', status: ''})}
                      className="w-full text-gray-600 border-gray-200 hover:bg-gray-50"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results info */}
          <div className="flex items-center justify-between px-1 text-sm text-gray-600">
            <span>
              Showing {expenses.length} expenses
            </span>
            {totalPages > 1 && (
              <span>
                Page {page + 1} of {totalPages}
              </span>
            )}
          </div>

          {/* Card grid */}
          <div className="grid items-start grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
            {expenses.length > 0 ? (
              expenses.map(expense => (
                <ExpenseCard 
                  key={expense.expenseId} 
                  expense={expense} 
                  openForm={openForm}
                  handleDelete={() => handleDeleteRequest(expense)}
                  expandedCardId={expandedCardId}
                  setExpandedCardId={setExpandedCardId}
                  variants={cardVariants}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-gray-500 bg-white border border-gray-200 rounded-lg col-span-full">
                <FileText className="w-12 h-12 mb-4 text-gray-300" />
                <h3 className="mb-2 text-lg font-medium text-gray-700">No expenses found</h3>
                <p className="text-sm text-center">
                  {Object.values(cardFilters).some(f => f) 
                    ? "Try adjusting your filters to see more results." 
                    : "Get started by adding your first expense."
                  }
                </p>
                {!Object.values(cardFilters).some(f => f) && (
                  <Button 
                    onClick={() => openForm('create')}
                    className="mt-4 bg-rose-600 hover:bg-rose-700"
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Add First Expense
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Rows per page selector - only in card view */}
          {viewMode === 'cards' && (
            <div className="flex items-center justify-between mt-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <Select 
                  value={size.toString()} 
                  onValueChange={(value) => {
                    setSize(parseInt(value));
                    setPage(0);
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={size} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="36">36</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {totalPages > 1 && (
                <span className="text-sm text-gray-600">
                  Page {page + 1} of {totalPages}
                </span>
              )}
            </div>
          )}

          {/* Pagination for cards */}
          {viewMode === 'cards' && totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPage(Math.max(0, page - 1))}
                      className={page === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-rose-50 hover:text-rose-600'}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    // Show first page, last page, and current page ±1
                    if (
                      index === 0 || 
                      index === totalPages - 1 || 
                      (index >= page - 1 && index <= page + 1)
                    ) {
                      return (
                        <PaginationItem key={index}>
                          <PaginationLink
                            onClick={() => setPage(index)}
                            isActive={index === page}
                            className={`cursor-pointer ${
                              index === page 
                                ? 'bg-rose-600 text-white hover:bg-rose-700' 
                                : 'hover:bg-rose-50 hover:text-rose-600'
                            }`}
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (index === page - 2 || index === page + 2) {
                      return (
                        <PaginationItem key={index}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      className={
                        page === totalPages - 1 
                          ? 'pointer-events-none opacity-50' 
                          : 'cursor-pointer hover:bg-rose-50 hover:text-rose-600'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      ) : (
        // Table view with DataTable
        viewMode === 'table' && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <DataTable
              columns={columns}
              data={expenses}
              loading={loading}
              currentPage={page + 1} // Convert to 1-based for display
              rowsPerPage={size}
              onPageChange={p => setPage(p - 1)} // Convert back to 0-based for internal use
              onRowsPerPageChange={newSize => {
                setSize(newSize);
                setPage(0); // Reset to first page when changing size
              }}
              totalElements={totalPages * size}
              onSort={handleTableSort}
              sortBy={sortBy}
              sortDir={sortDirection}
              filters={filters}
              filterOptions={filterOptions}
              onFilter={handleTableFilter}
              showAdd={() => openForm('create')}
              title="expense"
              emptyStateMessage={`No ${activeTab !== 'all' ? activeTab : ''} expenses found.`}
              tableClassName="w-full border-collapse"
            />
          </div>
        )
      )}
      
      <Dialog 
        open={openDialog} 
        onOpenChange={(open) => {
          if (!open) {
            setOpenDialog(false);
            setSelectedExpense(null);
            setForm(defaultExpense);
            setError('');
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' && (
                <div className="flex items-center text-rose-600">
                  <Receipt className="w-5 h-5 mr-2 text-rose-600" />
                  Add Expense
                </div>
              )}
              {dialogMode === 'edit' && (
                <div className="flex items-center text-rose-600">
                  <Pencil className="w-5 h-5 mr-2 text-rose-600" />
                  Edit Expense
                </div>
              )}
              {dialogMode === 'approve' && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Approve Expense
                </div>
              )}
              {dialogMode === 'reject' && (
                <div className="flex items-center text-rose-600">
                  <Ban className="w-5 h-5 mr-2 text-rose-600" />
                  Reject Expense
                </div>
              )}
              {dialogMode === 'pay' && (
                <div className="flex items-center text-blue-600">
                  <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                  Mark as Paid
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'create' && 'Fill in the details to record a new expense.'}
              {dialogMode === 'edit' && 'Make changes to update the expense record.'}
              {dialogMode === 'approve' && 'Approve this expense and provide any comments.'}
              {dialogMode === 'reject' && 'Reject this expense and provide a reason.'}
              {dialogMode === 'pay' && 'Mark this expense as paid and optionally specify a payment date.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error message for dialog */}
            {error && (
              <div className="p-3 text-sm border rounded-md bg-rose-50 border-rose-200 text-rose-600">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              </div>
            )}

            {/* Approval/Rejection Form */}
            {(dialogMode === 'approve' || dialogMode === 'reject') && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="approvalRemarks">
                    {dialogMode === 'approve' ? 'Approval Comments' : 'Rejection Reason'}
                    <span className="text-rose-600">*</span>
                  </Label>
                  <Input 
                    id="approvalRemarks"
                    name="approvalRemarks" 
                    value={form.approvalRemarks || ''} 
                    onChange={handleFormChange} 
                    placeholder={dialogMode === 'approve' ? "Comments (optional)" : "Reason for rejection"} 
                    required={dialogMode === 'reject'}
                    className="mt-1"
                  />
                </div>

                <DialogFooter className="flex justify-end gap-2 mt-6">
                  <Button 
                    type="button" 
                    className="cursor-pointer" 
                    variant="outline" 
                    onClick={() => {
                      setOpenDialog(false);
                      setSelectedExpense(null);
                      setForm({ ...defaultExpense });
                      setError('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className={`cursor-pointer ${dialogMode === 'approve' ? 'bg-green-600 hover:bg-green-600/90' : 'bg-rose-600 hover:bg-rose-600/90'}`}
                  >
                    {dialogMode === 'approve' ? 'Approve Expense' : 'Reject Expense'}
                  </Button>
                </DialogFooter>
              </div>
            )}

            {/* Payment Form */}
            {dialogMode === 'pay' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="paymentDate">Payment Date (Optional)</Label>
                  <Input 
                    id="paymentDate"
                    name="paymentDate" 
                    type="date"
                    value={form.paymentDate || ''} 
                    onChange={handleFormChange} 
                    placeholder="Select payment date" 
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave blank to use today's date
                  </p>
                </div>

                <div className="p-3 border border-blue-200 rounded-md bg-blue-50">
                  <div className="flex items-start">
                    <AlertCircle className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Marking as Paid</p>
                      <p>This expense will be marked as PAID and cannot be undone. Make sure the payment has been processed.</p>
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex justify-end gap-2 mt-6">
                  <Button 
                    type="button" 
                    className="cursor-pointer" 
                    variant="outline" 
                    onClick={() => {
                      setOpenDialog(false);
                      setSelectedExpense(null);
                      setForm({ ...defaultExpense });
                      setError('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-blue-600 cursor-pointer hover:bg-blue-600/90"
                  >
                    Mark as Paid
                  </Button>
                </DialogFooter>
              </div>
            )}

            {/* Create/Edit Form */}
            {(dialogMode === 'create' || dialogMode === 'edit') && (
              <>
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="expenseTitle">Title <span className="text-rose-600">*</span></Label>
                      <Input 
                        id="expenseTitle"
                        name="expenseTitle" 
                        value={form.expenseTitle} 
                        onChange={handleFormChange} 
                        placeholder="Expense title" 
                        required 
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <Label htmlFor="expenseCategory">Category <span className="text-rose-600">*</span></Label>
                      <Select
                        name="expenseCategory" 
                        value={form.expenseCategory || ''} 
                        onValueChange={(value) => {
                          // Never allow empty string for enum values
                          const newValue = value === '' ? null : value;
                          setForm({...form, expenseCategory: newValue});
                        }}
                        required
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPENSE_CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>
                              {cat.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-1">
                      <Label htmlFor="amount">Amount <span className="text-rose-600">*</span></Label>
                      <Input 
                        id="amount"
                        name="amount" 
                        value={form.amount} 
                        onChange={handleFormChange} 
                        placeholder="0.00" 
                        type="number" 
                        step="0.01" 
                        required 
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="expenseDescription">Description</Label>
                      <Input 
                        id="expenseDescription"
                        name="expenseDescription" 
                        value={form.expenseDescription} 
                        onChange={handleFormChange} 
                        placeholder="Detailed description" 
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Vendor and Receipt Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Vendor & Receipt Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <Label htmlFor="vendorSupplier">Vendor/Supplier</Label>
                      <Input 
                        id="vendorSupplier"
                        name="vendorSupplier" 
                        value={form.vendorSupplier} 
                        onChange={handleFormChange} 
                        placeholder="Vendor name" 
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <Label htmlFor="receiptInvoiceNumber">Receipt/Invoice #</Label>
                      <Input 
                        id="receiptInvoiceNumber"
                        name="receiptInvoiceNumber" 
                        value={form.receiptInvoiceNumber} 
                        onChange={handleFormChange} 
                        placeholder="Receipt number" 
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <Label htmlFor="expenseDate">Expense Date <span className="text-rose-600">*</span></Label>
                      <Input 
                        id="expenseDate"
                        name="expenseDate" 
                        value={form.expenseDate} 
                        onChange={handleFormChange} 
                        type="date" 
                        required 
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <Label htmlFor="paymentDate">Payment Date</Label>
                      <Input 
                        id="paymentDate"
                        name="paymentDate" 
                        value={form.paymentDate} 
                        onChange={handleFormChange} 
                        type="date" 
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select
                        name="paymentMethod" 
                        value={form.paymentMethod || ''}
                        onValueChange={(value) => {
                          // Never allow empty string for enum values
                          const newValue = value === 'none' || value === '' ? null : value;
                          setForm({...form, paymentMethod: newValue});
                        }}
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {PAYMENT_METHODS.map(method => (
                            <SelectItem key={method} value={method}>
                              {method.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-1">
                      <Label htmlFor="documentationPath">Documentation</Label>
                      <Input 
                        id="documentationPath"
                        name="documentationPath" 
                        type="file" 
                        onChange={handleFormChange} 
                        className="w-full mt-1"
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                      />
                      {form.documentationPath && typeof form.documentationPath === 'string' && (
                        <div className="mt-1">
                          <p className="text-sm text-gray-600">
                            Current file: {form.documentationPath.split('/').pop()}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <a 
                              href={fileUtils.getFileViewUrl(form.documentationPath)}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 underline hover:text-blue-800"
                            >
                                                           View File
                            </a>
                            <a 
                              href={fileUtils.getFileDownloadUrl(form.documentationPath)}
                              download
                              className="text-sm text-green-600 underline hover:text-green-800"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      )}
                      {form.documentationPath instanceof File && (
                        <p className="mt-1 text-sm text-green-600">
                          Selected: {form.documentationPath.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Organization Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Organization Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <Label htmlFor="departmentId">Department <span className="text-rose-600">*</span></Label>
                      <Select
                        name="departmentId" 
                        value={form.departmentId ? form.departmentId.toString() : ''}
                        onValueChange={(value) => setForm({...form, departmentId: value})}
                        required
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map(dep => (
                            <SelectItem key={dep.departmentId} value={dep.departmentId.toString()}>
                              {dep.departmentName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-1">
                      <Label htmlFor="relatedFeeId">Related Fee <span className="text-rose-600">*</span></Label>
                      <Select
                        name="relatedFeeId" 
                        value={form.relatedFeeId ? form.relatedFeeId.toString() : ''}
                        onValueChange={(value) => setForm({...form, relatedFeeId: value})} // value is already string ID
                        required
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Select fee" />
                        </SelectTrigger>
                        <SelectContent>
                          {fees.map(fee => (
                            <SelectItem key={fee.feeId} value={fee.feeId.toString()}>
                              {fee.feeType}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-1">
                      <Label htmlFor="academicYear">Academic Year <span className="text-rose-600">*</span></Label>
                      <Select
                        name="academicYear" 
                        value={form.academicYear || ''}
                        onValueChange={(value) => setForm({...form, academicYear: value})}
                        required
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACADEMIC_YEARS.map(yr => (
                            <SelectItem key={yr} value={yr}>{yr}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-1">
                      <Label htmlFor="semester">Semester <span className="text-rose-600">*</span></Label>
                      <Select
                        name="semester" 
                        value={form.semester || ''}
                        onValueChange={(value) => setForm({...form, semester: value})}
                        required
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {SEMESTERS.map(sem => (
                            <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="budgetAllocation">Budget Allocation <span className="text-rose-600">*</span></Label>
                      <Input 
                        id="budgetAllocation"
                        name="budgetAllocation" 
                        value={form.budgetAllocation} 
                        onChange={handleFormChange} 
                        placeholder="Budget line item" 
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Additional Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Additional Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="isRecurring"
                          name="isRecurring" 
                          checked={form.isRecurring} 
                          onCheckedChange={(checked) => {
                            // If checking the box, set a default frequency
                            if (checked && (!form.recurringFrequency || form.recurringFrequency === 'none')) {
                              setForm({...form, isRecurring: checked, recurringFrequency: 'MONTHLY'}); // Default to MONTHLY
                            } else {
                              setForm({...form, isRecurring: checked});
                            }
                          }}
                        />
                        <Label htmlFor="isRecurring">Recurring Expense</Label>
                      </div>
                    </div>
                    
                    {form.isRecurring && (
                      <div className="col-span-1">
                        <Label htmlFor="recurringFrequency">Frequency <span className="text-rose-600">*</span></Label>
                        <Select
                          name="recurringFrequency" 
                          value={form.recurringFrequency || 'none'} // Keep none option here if user unchecks then rechecks recurring
                          onValueChange={(value) => {
                            const newValue = value === 'none' || value === '' ? null : value;
                            setForm({...form, recurringFrequency: newValue});
                          }}
                          required
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {RECURRING_FREQUENCIES.map(freq => (
                              <SelectItem key={freq} value={freq}>
                                {freq.replace(/_/g, ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="col-span-1">
                      <Label htmlFor="taxAmount">Tax Amount</Label>
                      <Input 
                        id="taxAmount"
                        name="taxAmount" 
                        value={form.taxAmount} 
                        onChange={handleFormChange} 
                        placeholder="0.00" 
                        type="number" 
                        step="0.01" 
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="isTaxInclusive"
                          name="isTaxInclusive" 
                          checked={form.isTaxInclusive} 
                          onCheckedChange={(checked) => setForm({...form, isTaxInclusive: checked})}
                        />
                        <Label htmlFor="isTaxInclusive">Tax Inclusive</Label>
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="remarks">Remarks</Label>
                      <Input 
                        id="remarks"
                        name="remarks" 
                        value={form.remarks} 
                        onChange={handleFormChange} 
                        placeholder="Additional notes" 
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Form Actions */}
                <DialogFooter className="flex justify-end gap-2 mt-6">
                  <Button 
                    type="button" 
                    className="cursor-pointer" 
                    variant="outline" 
                    onClick={() => {
                      setOpenDialog(false);
                      setSelectedExpense(null);
                      setForm({ ...defaultExpense });
                      setError('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="cursor-pointer bg-rose-600 hover:bg-rose-600/90"
                  >
                    {dialogMode === 'create' ? 'Create Expense' : 'Update Expense'}
                  </Button>
                </DialogFooter>
              </>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Expense"
        description={
          expenseToDelete ? 
          `Are you sure you want to delete the expense "${expenseToDelete.expenseTitle || expenseToDelete.expenseId}"? This action cannot be undone.`
          : "Are you sure you want to delete this expense? This action cannot be undone."
        }
        loading={isDeleting}
        confirmButtonText="Delete Expense"
      />
    </motion.div>
  );
};

export default Expenses;
