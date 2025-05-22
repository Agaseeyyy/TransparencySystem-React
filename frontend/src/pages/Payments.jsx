import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import DataTable from '../components/DataTable';
import ActionButton from '../components/ActionButton';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, CreditCard, AlertCircle, CheckCircle, BarChart2, List, UserX, FilterX } from "lucide-react";
import { paymentService, studentService, feeService, programService } from "../utils/apiService";
import { useLocation, useNavigate } from 'react-router-dom';

const Payments = () => {
    // State hooks
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Data states
    const [payments, setPayments] = useState([]);
    const [students, setStudents] = useState([]);
    const [fees, setFees] = useState([]);
    
    // UI states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editingPayments, setEditingPayments] = useState(null);
    const [formError, setFormError] = useState(''); // Error state for the form
    const [pageError, setPageError] = useState(''); // Added for page-level errors
    const [pageSuccess, setPageSuccess] = useState(''); // Added for page-level success messages
    const [viewMode, setViewMode] = useState('records'); // 'records' or 'listOfFees'
    const [activeSearchFilter, setActiveSearchFilter] = useState(null);
    
    // Selected fee for payment status view
    const [selectedFeeId, setSelectedFeeId] = useState(null);
    
    // Delete Confirmation Dialog states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Filter state
    const [filters, setFilters] = useState({
        feeType: 'all',
        status: 'all',
        program: 'all',
        yearLevel: 'all',
        section: 'all'
    });
    
    // Filter options
    const [filterOptions, setFilterOptions] = useState({
        feeType: [],
        status: ["Paid", "Pending", "Remitted"],
        program: [],
        yearLevel: ["1", "2", "3", "4"],
        section: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
    });
    
    // Pagination and sorting state
    const [currentPage, setCurrentPage] = useState(0); // Backend uses 0-based indexing
    const [pageSize, setPageSize] = useState(10);
    const [sortField, setSortField] = useState('paymentDate');
    const [sortDirection, setSortDirection] = useState('desc');
    const [loading, setLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    // Table column definitions
    const columns = [
        { key: 'paymentId', label: 'Payment ID', sortable: true },
        { 
            key: 'fullName', 
            label: 'Full Name',
            sortable: true,
            sortKey: 'student.lastName',
            render: (_, row) => (
                <span className="font-medium text-gray-900">
                    {`${row.lastName || 'N/A'}, ${row.firstName || 'N/A'} ${row.middleInitial ? row.middleInitial + '.' : ''}`.trim()}
                </span>
            )
        },
        { 
            key: 'feeType', 
            label: 'Fee Type', 
            sortable: true,
            sortKey: 'fee.feeType',
            render: (_, row) => <span>{row.feeType || '-'}</span>
        },
        { 
            key: 'program', 
            label: 'Program', 
            sortable: true,
            sortKey: 'student.program.programName',
            render: (_, row) => <span>{row.program || '-'}</span>
        },
        { 
            key: "yearSec", 
            label: 'Year and Section',
            render: (_, row)=> (
                <span>
                    {row.yearLevel && row.section ? `${row.yearLevel} - ${row.section}` : '-'}
                </span>
            )
        },
        { 
            key: 'amount', 
            label: 'Amount', 
            sortable: true,
            sortKey: 'fee.amount',
            render: (amount) => amount ? `₱${parseFloat(amount).toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}` : '-'
        },
        { 
            key: 'status', 
            label: 'Status', 
            sortable: true,
            render: (status) => {
                let statusClass = '';
                let displayStatus = status;
                
                // Handle different status formats/values
                if (status === true || status === 'Paid') {
                    statusClass = 'bg-green-100 text-green-700';
                    displayStatus = 'Paid';
                } else if (status === false || status === 'Pending') {
                    statusClass = 'bg-yellow-100 text-yellow-700';
                    displayStatus = 'Pending';
                } else if (status === 'Remitted') {
                    statusClass = 'bg-blue-100 text-blue-700';
                    displayStatus = 'Remitted';
                } else {
                    // Default for unknown status
                    statusClass = 'bg-gray-100 text-gray-700';
                    displayStatus = status || 'Unknown';
                }
                
                return (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClass}`}>
                        {displayStatus}
                    </span>
                );
            }
        },
        { 
            key: 'paymentDate', 
            label: 'Date', 
            sortable: true,
            render: (date) => {
                if (!date) return '-';
                const formattedDate = new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                return formattedDate;
            }
        },
        { 
            key: 'remarks', 
            label: 'Remarks',
            render: (_, row) => (
                <div className="max-w-xs truncate" title={row.remarks || ""}>
                    {row.remarks || "-"}
                </div>
            ) 
        },
        {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
                row.paymentId ? (
                    <ActionButton 
                        row={row} 
                        idField="paymentId" 
                        onEdit={() => handleEdit(row)} 
                        onDelete={() => handleDeleteRequest(row)}
                    />
                ) : (
                    <Button 
                        variant="ghost"
                        size="icon"
                        className="rounded-md text-rose-600 hover:text-rose-700"
                        onClick={() => handleAddPaymentForStudent(row)} 
                        title="Add Payment"
                    >
                        <CreditCard className="w-5 h-5" />
                    </Button>
                )
            ),
        },
    ];

    // Data fetching functions
    const fetchPayments = async () => {
        setLoading(true);
        setPageError('');
        
        const searchParams = new URLSearchParams(location.search);
        const studentIdFromUrl = searchParams.get('studentId');
        const studentNameFromUrl = searchParams.get('studentName');

        if (studentIdFromUrl && studentNameFromUrl) {
            setActiveSearchFilter({ id: studentIdFromUrl, name: studentNameFromUrl });
        } else {
            setActiveSearchFilter(null);
        }
        
        try {
            let response;
            
            if (viewMode === 'listOfFees' && filters.feeType !== 'all') {
                let apiStatus = filters.status;
                if (filters.status === 'Remitted') {
                    apiStatus = 'Remitted'; 
                }
                
                response = await paymentService.getPaymentStatusByFee(
                    filters.feeType, // This is feeId
                    filters.program,
                    filters.yearLevel,
                    filters.section,
                    apiStatus,
                    sortField,      
                    sortDirection,  
                    currentPage,    
                    pageSize         
                );
                setPayments(response.content);
                setTotalElements(response.totalElements || 0);
            } else if (viewMode === 'listOfFees' && filters.feeType === 'all') {
                setPayments([]);
                setTotalElements(0);
            } else { // Records view
                let params = {
                    pageNumber: currentPage,
                    pageSize: pageSize,
                    sortField: sortField,
                    sortDirection: sortDirection
                };

                if (studentIdFromUrl) {
                    params.studentId = studentIdFromUrl;
                    // When searching for a specific student via navbar, always use the getPayments endpoint that supports studentId.
                    // Other filters (like feeType, status etc.) can still be applied if the UI supports it while a student filter is active.
                    // For now, let's ensure studentId search works and can be combined with existing page filters.
                    if (filters.feeType !== 'all') params.feeId = filters.feeType; // Send as feeId
                    if (filters.status !== 'all') {
                        if (filters.status === 'Remitted') params.status = 'Remitted';
                        else params.status = filters.status;
                    }
                    if (filters.program !== 'all') params.program = filters.program;
                    if (filters.yearLevel !== 'all') params.yearLevel = filters.yearLevel;
                    if (filters.section !== 'all') params.section = filters.section;

                    response = await paymentService.getPayments(params);
                } else {
                    // No specific student search from navbar, apply role-based logic and regular filters
                    if (filters.feeType !== 'all') params.feeId = filters.feeType; // Send as feeId
                    if (filters.status !== 'all') {
                        if (filters.status === 'Remitted') params.status = 'Remitted';
                        else params.status = filters.status;
                    }
                    if (filters.program !== 'all') params.program = filters.program;
                    if (filters.yearLevel !== 'all') params.yearLevel = filters.yearLevel;
                    if (filters.section !== 'all') params.section = filters.section;
                    
                    if (user.role === 'Class\u00A0Treasurer') {
                        // For Class Treasurer's default view, get their class payments.
                        // This endpoint might not support all generic filters or pagination/sorting like the main getPayments.
                        // This might need further review if advanced filtering/sorting is needed for C.T. default view.
                        response = await paymentService.getClassPayments(
                            user.program,
                            user.yearLevel,
                            user.section
                            // Note: getClassPayments in apiService doesn't currently pass page/sort params
                        );
                    } else {
                        response = await paymentService.getPayments(params);
                    }
                }
                
                if (response.content) {
                    setPayments(response.content);
                    setTotalElements(response.totalElements || 0);
                } else {
                    // Handle cases where response might not be paginated (e.g., getClassPayments if it returns an array directly)
                    setPayments(Array.isArray(response) ? response : []);
                    setTotalElements(Array.isArray(response) ? response.length : 0);
                }
            }
        } catch (err) {
            console.error("API error:", err);
            setPayments([]);
            setTotalElements(0);
            
            let errorMessage = "Error loading payment data";
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setPageError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            let response;
            
            if (user.role === 'Class\u00A0Treasurer') {
                response = await studentService.getStudentsByClass(
                    user.program,
                    user.yearLevel,
                    user.section
                );
            } else {
                response = await studentService.getAllStudents();
            }
            
            setStudents(response);
        } catch (err) {
            console.error("API error:", err);
        }
    };

    const fetchFees = async () => {
        try {
            const response = await feeService.getFees();
            
            setFees(response.content);
            
            // Setup fee filter options
            const feeOptions = response.content.map(fee => ({
                id: fee.feeId.toString(),
                name: fee.feeType
            }));
            
            setFilterOptions(prev => ({
                ...prev,
                feeType: feeOptions
            }));
        } catch (err) {
            console.log(err);
        }
    };

    const fetchPrograms = async () => {
        try {
            const response = await programService.getPrograms();
            
            // Handle paginated response
            const programsArray = response.content || response; // Ensure we get the array of raw program objects
            
            // Setup program filter options for DataTable
            setFilterOptions(prev => ({
                ...prev,
                program: programsArray.map(prog => ({ id: prog.programId, name: prog.programName }))
            }));
        } catch (err) {
            console.log(err);
        }
    };

    // Handlers for pagination and sorting
    const handlePageChange = (page) => {
        setCurrentPage(page - 1); // DataTable uses 1-based indexing, backend uses 0-based
        setPageError('');
        setPageSuccess('');
    };

    const handleRowsPerPageChange = (value) => {
        setPageSize(parseInt(value));
        setCurrentPage(0); // Reset to first page when changing rows per page
        setPageError('');
        setPageSuccess('');
    };

    const handleSort = (field, direction) => {
        setSortField(field);
        setSortDirection(direction);
        setPageError('');
        setPageSuccess('');
    };

    // Handler for view mode toggle
    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        setCurrentPage(0); // Reset page
        setPageError('');
        setPageSuccess('');
        
        if (mode === 'listOfFees') {
            // Default sort for "List of Fees" view
            setSortField('student.lastName'); 
            setSortDirection('asc');
        } else { // mode === 'records'
            // Default sort for "Records" view
            setSortField('paymentDate');
            setSortDirection('desc');
            // Reset fee filter when switching to records view
            setFilters(prev => ({ 
                ...prev, 
                feeType: 'all', 
                status: 'all',
                program: 'all',
                yearLevel: 'all',
                section: 'all'
            })); 
            setSelectedFeeId(null);
        }
    };

    // Handler for filter changes
    const handleFilter = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPageError('');
        setPageSuccess('');
        
        if (name === 'feeType') {
            setSelectedFeeId(value === 'all' ? null : parseInt(value));
        }
    };

    // Modal action handlers
    const closeModal = () => {
        setIsModalOpen(false);
        setModalMode('add');
        setEditingPayments(null);
        setStudents([]);
        setFees([]);
        setFormError(''); // Clear any errors when closing modal
    };

    const handleAdd = () => {
        fetchStudents();
        fetchFees();
        setModalMode('add');
        setIsModalOpen(true);
        setEditingPayments(null);
        setFormError('');
        setPageError('');
        setPageSuccess('');
    };

    const handleEdit = (payment) => { 
        fetchStudents();
        fetchFees();
        setEditingPayments({
            id: payment.paymentId,
            studentId: payment.studentId,
            feeType: payment.feeId,
            paymentDate: payment.paymentDate?.split('T')[0], // Format date for input
            status: payment.status === true ? 'Paid' : (payment.status === false ? 'Pending' : payment.status), // Handle boolean status
            remarks: payment.remarks || "",
            createdAt: payment.createdAt,
        });
        setModalMode('edit');
        setIsModalOpen(true);
        setFormError('');
        setPageError('');
        setPageSuccess('');
    };

    // Handler for adding payment for a student who hasn't paid yet
    const handleAddPaymentForStudent = (student) => {
        fetchStudents();
        fetchFees();
        setEditingPayments({
            studentId: student.studentId,
            feeType: selectedFeeId ? selectedFeeId.toString() : null, // Ensure feeType is set if selectedFeeId exists
            paymentDate: new Date().toISOString().split('T')[0],
            status: 'Paid',
            remarks: ""
        });
        setModalMode('add');
        setIsModalOpen(true);
        setFormError('');
        setPageError('');
        setPageSuccess('');
    };

    // Delete payment request (opens dialog)
    const handleDeleteRequest = (payment) => {
        setPaymentToDelete(payment);
        setDeleteDialogOpen(true);
        setPageError('');
        setPageSuccess('');
    };

    // Confirm delete payment
    const confirmDelete = async () => {
        if (!paymentToDelete) return;
        
        setIsDeleting(true);
        setPageError('');
        setPageSuccess('');

        // Construct student name for messages
        let studentNameToDisplay = `Payment ID ${paymentToDelete.paymentId}`;
        if (paymentToDelete.lastName || paymentToDelete.firstName) {
            const lastName = paymentToDelete.lastName || '';
            const firstName = paymentToDelete.firstName || '';
            const middleInitial = paymentToDelete.middleInitial ? ` ${paymentToDelete.middleInitial}.` : '';
            studentNameToDisplay = `${lastName}, ${firstName}${middleInitial}`.replace(/^, | ,$/, '').trim();
            if (studentNameToDisplay === "," || studentNameToDisplay === "") studentNameToDisplay = `Payment ID ${paymentToDelete.paymentId}`; // Fallback if name parts are empty
        } else {
            // Fallback if lastName and firstName are not present in paymentToDelete (e.g. from payment status view where names might be top-level)
            studentNameToDisplay = `Payment for Student ID ${paymentToDelete.studentId || paymentToDelete.paymentId}`
        }

        try {
            await paymentService.deletePayment(paymentToDelete.paymentId);
            fetchPayments(); // Refresh the list
            setPageSuccess(`Payment for ${studentNameToDisplay} (ID: ${paymentToDelete.paymentId}) deleted successfully.`);
        } catch (err) {
            console.error("Error deleting payment:", err);
            let errorMessage = `Failed to delete payment for ${studentNameToDisplay} (ID: ${paymentToDelete.paymentId}).`;
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            setPageError(errorMessage);
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setPaymentToDelete(null);
        }
    };

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const saveFormData = Object.fromEntries(formData.entries());
        
        setFormError('');
        setPageError('');
        setPageSuccess('');

        // Basic client-side validation
        if (!saveFormData.studentId || !saveFormData.feeType || !saveFormData.paymentDate || !saveFormData.status) {
            setFormError("Student, Payment Type, Payment Date, and Status are required fields.");
            return;
        }

        try {
            let successMsg = '';
            // Find student details for the success message
            const student = students.find(s => String(s.studentId) === String(saveFormData.studentId));
            let studentNameToDisplay = `Student ID ${saveFormData.studentId}`; // Fallback
            if (student) {
                const lastName = student.lastName || '';
                const firstName = student.firstName || '';
                const middleInitial = student.middleInitial ? ` ${student.middleInitial}.` : '';
                studentNameToDisplay = `${lastName}, ${firstName}${middleInitial}`.replace(/^, | ,$/, '').trim(); // Clean up if parts are missing
                if (studentNameToDisplay === "," || studentNameToDisplay === "") studentNameToDisplay = `Student ID ${saveFormData.studentId}`; // Final fallback
            }

            if (modalMode === 'edit') {
                await paymentService.updatePayment(
                    editingPayments.id,
                    saveFormData.feeType,
                    saveFormData.studentId,
                    saveFormData
                );
                successMsg = `Payment for ${studentNameToDisplay} updated successfully.`;
            } else {
                await paymentService.addPayment(
                    saveFormData.feeType,
                    saveFormData.studentId,
                    saveFormData
                );
                successMsg = `Payment for ${studentNameToDisplay} added successfully.`;
            }
            
            fetchPayments();
            closeModal();
            setPageSuccess(successMsg);
        } catch (err) {
            console.error(`Error ${modalMode === 'edit' ? 'updating' : 'adding'} payment:`, err);
            
            let errorMessage = "Unable to save payment";
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.status === 409) {
                errorMessage = "This student already has a payment record for this fee";
            } else if (err.response?.status === 404) {
                errorMessage = "Student or fee information not found";
            } else if (err.message) {
                errorMessage = err.message;
            }            
            setFormError(errorMessage);
        }
    };

    // Auto-select first fee in 'listOfFees' mode
    useEffect(() => {
        if (viewMode === 'listOfFees' && filters.feeType === 'all' && fees.length > 0) {
            const firstFeeId = String(fees[0].feeId);
            setFilters(prev => ({ ...prev, feeType: firstFeeId }));
            setSelectedFeeId(fees[0].feeId);
        }
    }, [fees, viewMode, filters.feeType]);

    // Side effects
    useEffect(() => {
        // Fetch payments when relevant state changes, including location.search for URL params
        fetchPayments();
    }, [currentPage, pageSize, sortField, sortDirection, filters, selectedFeeId, viewMode, location.search]);
    
    useEffect(() => {
        fetchFees();
        fetchPrograms();
    }, []);

    // Component render
    return (
        <>
            {/* Page Level Error Message */}
            {pageError && (
                <div className="p-3 mb-4 text-sm border rounded-md bg-rose-50 border-rose-200 text-rose-600">
                    <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {pageError}
                    </div>
                </div>
            )}
            {/* Page Level Success Message */}
            {pageSuccess && (
                <div className="p-3 mb-4 text-sm text-green-700 border border-green-200 rounded-md bg-green-50">
                    <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {pageSuccess}
                    </div>
                </div>
            )}

            {/* Active Search Filter Display */}
            {activeSearchFilter && (
                <div className="p-3 mb-4 text-sm text-indigo-700 border border-indigo-200 rounded-md bg-indigo-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <FilterX className="w-4 h-4 mr-2" />
                            <span>Showing payment records for student: <strong>{activeSearchFilter.name} (ID: {activeSearchFilter.id})</strong></span>
                        </div>
                        <Button 
                            variant="ghost"
                            size="sm"
                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100"
                            onClick={() => {
                                navigate(location.pathname, { replace: true }); // Remove query params
                                setActiveSearchFilter(null);
                                // Optionally, reset other filters or refetch
                                // fetchPayments(); // fetchPayments will be called due to location.search change
                            }}
                        >
                            Clear Filter
                        </Button>
                    </div>
                </div>
            )}

            {/* View Mode Selector */}
            <div className="flex mb-4 space-x-2">
                <Button 
                    variant={viewMode === 'records' ? 'default' : 'outline'} 
                    className={viewMode === 'records' ? 'bg-rose-600 hover:bg-rose-500' : ''}
                    onClick={() => handleViewModeChange('records')}
                >
                    <BarChart2 className="w-4 h-4 mr-2" />
                    Payment Records
                </Button>
                <Button 
                    variant={viewMode === 'listOfFees' ? 'default' : 'outline'}
                    className={viewMode === 'listOfFees' ? 'bg-rose-600 hover:bg-rose-500' : ''}
                    onClick={() => handleViewModeChange('listOfFees')}
                >
                    <List className="w-4 h-4 mr-2" />
                    List of Fees
                </Button>
            </div>

            {/* Fee Filter Note (for List of Fees view) */}
            {viewMode === 'listOfFees' && (
                <div className="p-3 mb-4 text-sm text-blue-700 bg-blue-100 border border-blue-200 rounded-md">
                    <p className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Select a Fee Type from the filter above to see all students and their payment status.
                    </p>
                </div>
            )}

            {/* Data Table */}
            <DataTable 
                columns={columns} 
                data={payments}
                title={'payment'}
                showAdd={handleAdd} 
                user={user}
                loading={loading}
                // Pagination props
                currentPage={currentPage + 1} // Convert 0-based to 1-based for the UI
                totalElements={totalElements}
                rowsPerPage={pageSize}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                // Sorting props
                onSort={handleSort}
                sortBy={sortField}
                sortDir={sortDirection}
                // Filtering props
                onFilter={handleFilter}
                filters={filters}
                filterOptions={filterOptions}
            />

            {/* Payment Form Dialog */}
            <Dialog 
                open={isModalOpen} 
                onOpenChange={(open) => {
                    if (!open) closeModal();
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {modalMode === "add" ? (
                                <div className="flex items-center text-rose-600">
                                    <CreditCard className="w-5 h-5 mr-2 text-rose-600" />
                                    Add Payment
                                </div>
                            ) : (
                                <div className="flex items-center text-rose-600">
                                    <Pencil className="w-5 h-5 mr-2 text-rose-600" />
                                    Edit Payment
                                </div>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {modalMode === "add" 
                                ? "Fill in the details to record a new payment."
                                : "Make changes to update the payment record."
                            }
                        </DialogDescription>
                    </DialogHeader>
                    
                    {/* Payment Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Error message */}
                        {formError && (
                            <div className="p-3 text-sm border rounded-md bg-rose-50 border-rose-200 text-rose-600">
                                <div className="flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {formError}
                                </div>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                            {/* Student Selection */}
                            <div className="col-span-2">
                                <Label htmlFor="studentId">Students <span className="text-rose-600">*</span></Label>
                                <Select
                                    name="studentId"
                                    value={editingPayments?.studentId ? String(editingPayments.studentId) : undefined}
                                    onValueChange={(value) => {
                                        setEditingPayments(prev => ({
                                            ...prev || {}, 
                                            studentId: value
                                        }));
                                    }}
                                    required
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select student" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map(student => (
                                            <SelectItem key={student.studentId} value={String(student.studentId)}>
                                                {student.lastName}, {student.firstName} {student.middleInitial || ''}.  ({student.studentId})               
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {/* Fee Type Selection */}
                            <div className="w-full col-span-1">
                                <Label htmlFor="feeType">Payment Type <span className="text-rose-600">*</span></Label>
                                <Select 
                                    name="feeType" 
                                    value={editingPayments?.feeType ? String(editingPayments.feeType) : undefined}
                                    onValueChange={(value) => {
                                        setEditingPayments(prev => ({
                                            ...prev || {},
                                            feeType: value
                                        }));
                                    }}
                                    required
                                >
                                    <SelectTrigger className="w-full mt-1">
                                        <SelectValue placeholder="Select payment type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {fees.map(fee => (
                                            <SelectItem key={fee.feeId} value={String(fee.feeId)}>
                                                {fee.feeType} - ₱{fee.amount}       
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {/* Payment Date */}
                            <div className="col-span-1">
                                <Label htmlFor="paymentDate">Payment Date <span className="text-rose-600">*</span></Label>
                                <Input
                                    id="paymentDate"
                                    name="paymentDate"
                                    type="date"
                                    defaultValue={editingPayments?.paymentDate || new Date().toISOString().split('T')[0]}
                                    className="mt-1"
                                    required
                                />
                            </div>
                            
                            {/* Payment Status */}
                            <div className="w-full col-span-1">
                                <Label htmlFor="status">Status <span className="text-rose-600">*</span></Label>
                                <Select 
                                    name="status" 
                                    defaultValue={editingPayments?.status || 'Paid'}
                                    required
                                >
                                    <SelectTrigger className="w-full mt-1">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Paid">Paid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {/* Remarks */}
                            <div className="col-span-2">
                                <Label htmlFor="remarks">Remarks</Label>
                                <Input
                                    id="remarks"
                                    name="remarks"
                                    defaultValue={editingPayments?.remarks || ""}
                                    placeholder="Additional notes about the payment"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        
                        {/* Form Actions */}
                        <DialogFooter className="flex justify-end gap-2 mt-6">
                            <Button type="button" className="cursor-pointer" variant="outline" onClick={closeModal}>
                                Cancel
                            </Button>
                            <Button type="submit" className="cursor-pointer bg-rose-600 hover:bg-rose-600/90">
                                {modalMode === "add" ? "Record Payment" : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog 
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                title="Delete Payment"
                description={
                    paymentToDelete ? 
                    `Are you sure you want to delete the payment for ${paymentToDelete.lastName || ''}, ${paymentToDelete.firstName || ''}${paymentToDelete.middleInitial ? ` ${paymentToDelete.middleInitial}.` : ''} (Payment ID: ${paymentToDelete.paymentId || 'N/A'})? This action cannot be undone.`
                    : "Are you sure you want to delete this payment? This action cannot be undone."
                }
                loading={isDeleting}
                confirmButtonText="Delete Payment"
            />
        </>
    );
};

export default Payments;