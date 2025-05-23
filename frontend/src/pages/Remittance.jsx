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
import { Pencil, Banknote, Check, CreditCard, BarChart2, List, AlertCircle, CheckCircle, FilterX } from "lucide-react";
import { remittanceService, accountService, feeService, paymentService, programService } from "../utils/apiService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLocation, useNavigate } from 'react-router-dom';

const Remittance = () => {
    // State hooks
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editingRemittance, setEditingRemittance] = useState(null);
    const [remittances, setRemittances] = useState([]);
    const [unremittedTreasurers, setUnremittedTreasurers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [users, setUsers] = useState([]);
    const [fees, setFees] = useState([]);
    const [totalRemittance, setTotalRemittance] = useState(0);
    const [selectedFeeType, setSelectedFeeType] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewMode, setViewMode] = useState('records'); // 'records' or 'listOfFees'
    const [formError, setFormError] = useState(''); // Error state for the form
    const [pageError, setPageError] = useState(''); // Added for page-level errors
    const [pageSuccess, setPageSuccess] = useState(''); // Added for page-level success messages
    const [activeSearchFilter, setActiveSearchFilter] = useState(null);
    
    // Delete confirmation dialog states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [remittanceToDelete, setRemittanceToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Filter state
    const [filters, setFilters] = useState({
        fee: 'all',
        status: 'all',
        remittedBy: 'all',
        program: 'all',
        yearLevel: 'all',
        section: 'all'
    });
    
    // Filter options
    const [filterOptions, setFilterOptions] = useState({
        fee: [],
        status: ["COMPLETED", "PARTIAL", "NOT_REMITTED"],
        remittedBy: [],
        program: [],
        yearLevel: ["1", "2", "3", "4"],
        section: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
    });
    
    // Pagination and sorting state
    const [currentPage, setCurrentPage] = useState(0); // Backend uses 0-based indexing
    const [pageSize, setPageSize] = useState(10);
    const [sortField, setSortField] = useState('remittanceDate');
    const [sortDirection, setSortDirection] = useState('desc');
    const [loading, setLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    // Helper function for formatting dates
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) return '';
        
        const options = { month: 'short', day: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    // Table columns definition for Records view (remitted)
    const recordsColumns = [
        { key: 'remittanceId', label: 'Remittance ID', sortable: true },
        { 
            key: 'feeType', 
            label: 'Fee Type',
            sortable: true,
            sortKey: 'feeType',
            render: (_, row) => row.feeType || '-'
        },
        {
            key: 'user',
            label: 'Remitted By',
            sortable: true,
            sortKey: 'user',
            render: (_, row) => {
                if (!row.lastName) return '-';
                return (
                    <span className="font-medium text-gray-900">
                        {`${row.lastName}, ${row.firstName} ${row.middleInitial ? row.middleInitial + '.' : ""}`}
                    </span>
                );
            }
        },
        {
            key: 'program',
            label: 'Program',
            sortable: true,
            sortKey: 'program',
            render: (_, row) => row.programCode || '-'
        },
        {
            key: 'yearAndSection',
            label: 'Year & Section',
            sortable: true,
            sortKey: 'yearAndSection',
            render: (_, row) => (
                <span>
                    {row.yearLevel && row.section ? `${row.yearLevel}-${row.section}` : '-'}
                </span>
            )
        },
        { 
            key: 'amountRemitted', 
            label: 'Amount', 
            sortable: true,
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
                // Updated status display with RemittanceStatus enum values
                let statusClass = '';
                let statusText = '';
                
                if (typeof status === 'string') {
                    // Handle RemittanceStatus enum values
                    switch(status) {
                        case 'COMPLETED':
                            statusClass = 'bg-green-100 text-green-700';
                            statusText = 'Completed';
                            break;
                        case 'PARTIAL':
                            statusClass = 'bg-blue-100 text-blue-700';
                            statusText = 'Partial';
                            break;
                        case 'NOT_REMITTED':
                            statusClass = 'bg-yellow-100 text-yellow-700';
                            statusText = 'Not Remitted';
                            break;
                        default:
                            statusClass = 'bg-gray-100 text-gray-700';
                            statusText = status;
                    }
                } else {
                    // Handle legacy boolean values for backward compatibility
                    statusClass = status === true ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
                    statusText = status === true ? 'Completed' : 'Pending';
                }
                
                return (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClass}`}>
                        {statusText}
                    </span>
                );
            }
        },
        { 
            key: 'remittanceDate', 
            label: 'Date', 
            sortable: true,
            render: (date) => formatDate(date)
        },
        {
            key: "actions",
            label: "Actions",
            sortable: false,
            render: (_, row) => (
                <ActionButton
                    row={row} 
                    idField="remittanceId"
                    onEdit={() => handleEdit(row)}
                    onDelete={() => handleDelete(row.remittanceId)}
                />
            ),
        },
    ];

    // Table columns definition for List of Fees view (remitted and unremitted treasurers)
    const feesListColumns = [
        { 
            key: 'feeType', 
            label: 'Fee Type',
            sortable: true,
            render: (_, row) => row.feeType || '-'
        },
        {
            key: 'treasurer',
            label: 'Class Treasurer',
            sortable: true,
            render: (_, row) => {
                const name = row.lastName ? 
                    `${row.lastName}, ${row.firstName} ${row.middleInitial ? row.middleInitial + '.' : ""}` : '-';
                return (
                    <span className="font-medium text-gray-900">
                        {name}
                    </span>
                );
            }
        },
        {
            key: 'program',
            label: 'Program',
            sortable: true,
            sortKey: 'program',
            render: (_, row) => row.programCode || '-'
        },
        {
            key: 'yearAndSection',
            label: 'Year & Section',
            sortable: true,
            sortKey: 'yearAndSection',
            render: (_, row) => (
                <span>
                    {row.yearLevel && row.section ? `${row.yearLevel}-${row.section}` : '-'}
                </span>
            )
        },
        { 
            key: 'amountRemitted', 
            label: 'Amount', 
            sortable: true,
            render: (_, row) => {
                const amount = row.amountRemitted || row.amount || 0;
                return `₱${parseFloat(amount).toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
            }
        },
        { 
            key: 'status', 
            label: 'Status', 
            sortable: true,
            render: (_, row) => {
                // Updated status display with RemittanceStatus enum values
                let statusClass = '';
                
                switch(row.status) {
                    case 'COMPLETED':
                        statusClass = 'bg-green-100 text-green-700';
                        break;
                    case 'PARTIAL':
                        statusClass = 'bg-blue-100 text-blue-700';
                        break;
                    case 'NOT_REMITTED':
                    default:
                        statusClass = 'bg-yellow-100 text-yellow-700';
                        break;
                }
                
                return (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClass}`}>
                        {row.status === 'COMPLETED' 
                            ? 'Completed' 
                            : row.status === 'PARTIAL' 
                                ? 'Partial' 
                                : 'Not Remitted'}
                    </span>
                );
            }
        },
        { 
            key: 'remittanceDate', 
            label: 'Date', 
            sortable: true,
            render: (date) => date ? formatDate(date) : '-'
        },
        {
            key: "actions",
            label: "Actions",
            sortable: false,
            render: (_, row) => {
                
                    return (
                        <Button 
                            variant="ghost"
                            size="icon"
                            className="rounded-md text-rose-600 hover:text-rose-700"
                            onClick={() => handleAddRemittanceForTreasurer(row)} 
                            title="Create Remittance"
                        >
                            <Banknote className="w-5 h-5" />
                        </Button>
                    );
                
                return null;
            },
        },
    ];

    // Data fetching functions
    const fetchRemittances = async () => {
        setLoading(true);
        setPageError('');
        setPageSuccess('');

        // Read accountId and treasurerName from URL
        const searchParamsUrl = new URLSearchParams(location.search);
        const accountIdFromUrl = searchParamsUrl.get('accountId');
        const treasurerNameFromUrl = searchParamsUrl.get('treasurerName');

        if (accountIdFromUrl && treasurerNameFromUrl) {
            setActiveSearchFilter({ id: accountIdFromUrl, name: treasurerNameFromUrl });
            // If a treasurer is searched, ensure view mode is 'records'
            if (viewMode !== 'records') {
                setViewMode('records'); 
            }
        } else {
            setActiveSearchFilter(null);
        }

        let params = {
            pageNumber: currentPage,
            pageSize: pageSize,
            sortField: sortField,
            sortDirection: sortDirection
        };

        // Prioritize accountId from URL if present
        if (accountIdFromUrl) {
            params.accountId = accountIdFromUrl;
            // Apply other page filters if they are set
            if (filters.fee !== 'all') params.feeId = filters.fee; // Assuming filters.fee is feeId
            if (filters.status !== 'all') params.status = filters.status;
            // Program, yearLevel, section filters might not be directly applicable when searching a specific treasurer
            // but can be included if the backend supports them in this context.
            if (filters.program !== 'all') params.program = filters.program;
            if (filters.yearLevel !== 'all') params.yearLevel = filters.yearLevel;
            if (filters.section !== 'all') params.section = filters.section;
        } else if (user.role === 'Class\u00A0Treasurer') { // Corrected role string to use non-breaking space
            params.accountId = user.accountId; // For Class Treasurer's own view
            if (filters.fee !== 'all') params.feeId = filters.fee;
            if (filters.status !== 'all') params.status = filters.status;
        } else {
            // Admin or Org Treasurer view without a specific URL search
            if (filters.fee !== 'all') params.feeId = filters.fee;
            if (filters.status !== 'all') params.status = filters.status;
            if (filters.program !== 'all') params.program = filters.program;
            if (filters.yearLevel !== 'all') params.yearLevel = filters.yearLevel;
            if (filters.section !== 'all') params.section = filters.section;
            // remittedBy filter needs specific handling for backend if it means accountId
            if (filters.remittedBy !== 'all') params.accountId = filters.remittedBy; 
        }

        try {
            const response = await remittanceService.getRemittances(params);
            setRemittances(response.content || []);
            setTotalElements(response.totalElements || 0);
        } catch (err) {
            console.error("API error fetching remittances:", err);
            setRemittances([]);
            setTotalElements(0);
            setPageError(err.response?.data?.message || "Error loading remittance data.");
        } finally {
            setLoading(false);
        }
    };

    // New function to fetch both remitted and unremitted treasurers for a specific fee
    const fetchUnremittedTreasurers = async (feeIdToFetch) => {
        setLoading(true);
        setPageError('');
        
        try {
            // Use accountService instead of remittanceService
            const response = await accountService.getRemittanceStatusByFee(
                feeIdToFetch,
                currentPage, 
                pageSize,    
                sortField,   
                sortDirection,
                filters.program,
                filters.yearLevel,
                filters.section
            );
            
            console.log('Treasurer remittance data with detailed status:', response.content);
            
            const combinedData = response.content.map(dto => {
                return {
                    // Account fields from dto.account
                    accountId: dto.account.accountId,
                    firstName: dto.account.firstName,
                    lastName: dto.account.lastName,
                    middleInitial: dto.account.middleInitial,
                    yearLevel: dto.account.yearLevel,
                    section: dto.account.section,
                    programCode: dto.account.programCode, 
                    
                    // Fee-related fields from DTO top level
                    feeId: dto.feeId,
                    feeType: dto.feeType, 
                    
                    // Remittance fields based on DTO properties
                    remittanceId: dto.remittanceStatus === 'COMPLETED' || dto.remittanceStatus === 'PARTIAL' 
                        ? `RMT-FEE-${dto.feeId}-ACC-${dto.account.accountId}` 
                        : undefined,
                    amountRemitted: dto.totalRemittedAmount || 0,
                    remittanceDate: dto.remittanceStatus === 'COMPLETED' || dto.remittanceStatus === 'PARTIAL' 
                        ? new Date().toISOString() 
                        : null, 
                    status: dto.remittanceStatus // This now will be "COMPLETED", "PARTIAL", or "NOT_REMITTED"
                };
            });
            
            setUnremittedTreasurers(combinedData);
            setTotalElements(response.totalElements || 0); // Update total elements from the paginated response
        } catch (error) {
            console.error('Error fetching treasurer remittance status:', error);
            setUnremittedTreasurers([]); // Clear on error
            setTotalElements(0);
            
            let errorMessage = "Error fetching treasurer remittance data";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setPageError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchFees = async () => {
        try {
            const response = await feeService.getFees();
            
            setFees(response.content);
            
            // Setup fee filter options
            setFilterOptions(prev => ({
                ...prev,
                fee: response.content.map(fee => ({
                    id: fee.feeId,
                    name: fee.feeType
                }))
            }));
        } catch (err) {
            console.log(err);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await accountService.getAccountsByRole("Class_Treasurer");
            
            setUsers(response);
            
            // Setup account filter options
            setFilterOptions(prev => ({
                ...prev,
                remittedBy: response.map(account => ({
                    id: account.accountId,
                    name: account.lastName + ", " + account.firstName + " " + account.middleInitial
                }))
            }));
        } catch (err) {
            console.error("Error:", err);
        }
    };

    const fetchPrograms = async () => {
        try {
            const response = await programService.getPrograms();
            const programsArray = response.content || response; // Handle paginated or direct array
            setFilterOptions(prev => ({
                ...prev,
                program: programsArray.map(prog => ({ // Standardize for DataTable
                    id: prog.programId,
                    name: prog.programName
                }))
            }));
        } catch (err) {
            console.log("Error fetching programs:", err);
        }
    };

    // Handler for filter changes (ADJUSTED)
    const handleFilter = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPageError('');
        setPageSuccess('');
        
        if (name === 'fee') {
            setSelectedFeeType(value === 'all' ? null : value);
            // Data fetching is handled by the main useEffect reacting to filters.fee change.
            // If user explicitly selects "all" in listOfFees, clear data immediately.
            if (viewMode === 'listOfFees' && value === 'all') {
                 setUnremittedTreasurers([]); 
                 setTotalElements(0);
            }
        }
    };

    // Handler for view mode toggle (SIMPLIFIED)
    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        setCurrentPage(0); // Reset page
        setPageError('');
        setPageSuccess('');
        
        if (mode === 'listOfFees') {
            // Default sort for "List of Fees" view
            setSortField('student.lastName'); 
            setSortDirection('asc');
            // Auto-select logic will be handled by the new useEffect.
            // If a fee is already selected, main data fetching useEffect will pick it up.
        } else { // mode === 'records'
            // Default sort for "Records" view
            setSortField('remittanceDate');
            setSortDirection('desc');
            // Reset fee filter when switching to records view
            setFilters(prev => ({ 
                ...prev, 
                fee: 'all', 
                status: 'all', 
                remittedBy: 'all',
                program: 'all',
                yearLevel: 'all',
                section: 'all'
            })); 
            setSelectedFeeType(null);
        }
        // The main data fetching useEffect will handle fetching based on new viewMode and current filters.fee
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

    // Modal state management
    const closeModal = () => {
        setIsModalOpen(false);
        setModalMode('add');
        setEditingRemittance(null);
        setSelectedFeeType(null);
        setSelectedUser(null);
        setTotalRemittance(0);
        setFormError(''); // Clear form errors when closing modal
    };

    const handleAdd = () => {
        setModalMode('add');
        setIsModalOpen(true);
        setFormError('');
        setPageError('');
        setPageSuccess('');
    };

    const handleEdit = (remittance) => {
        setEditingRemittance({
            id: remittance.remittanceId,
            feeType: remittance.fee?.feeId || remittance.feeId,
            userId: remittance.account?.accountId || remittance.accountId,
            amountRemitted: remittance.amountRemitted,
            status: remittance.status,
            remittanceDate: remittance.remittanceDate,
        });
        
        // Set the selected fee type and user
        setSelectedFeeType(remittance.fee?.feeId || remittance.feeId);
        setSelectedUser({
            userId: remittance.account?.accountId || remittance.accountId,
            programCode: remittance.programCode || remittance.account?.student?.program?.programId,
            yearLevel: remittance.yearLevel || remittance.account?.student?.yearLevel,
            section: remittance.section || remittance.account?.student?.section
        });
        
        setModalMode('edit');
        setIsModalOpen(true);
        setFormError('');
        setPageError('');
        setPageSuccess('');
    };

    // Handler for adding remittance for a treasurer who hasn't remitted yet
    const handleAddRemittanceForTreasurer = (treasurer) => {
        setSelectedFeeType(treasurer.feeId.toString());
        setSelectedUser({
            userId: treasurer.accountId,
            programCode: treasurer.programCode,
            yearLevel: treasurer.yearLevel,
            section: treasurer.section
        });
        
        setEditingRemittance({
            feeType: treasurer.feeId.toString(),
            userId: treasurer.accountId,
        });
        
        setModalMode('add');
        setIsModalOpen(true);
        setFormError('');
        setPageError('');
        setPageSuccess('');
    };

    // Delete remittance request (opens dialog)
    const handleDeleteRequest = (remittance) => {
        setRemittanceToDelete(remittance);
        setDeleteDialogOpen(true);
        setPageError('');
        setPageSuccess('');
    };

    // Confirm delete remittance
    const confirmDelete = async () => {
        if (!remittanceToDelete) return;
        
        setIsDeleting(true);
        setPageError('');
        setPageSuccess('');

        // Construct treasurer name for success/error messages
        let treasurerNameToDisplay = `Remittance ID ${remittanceToDelete.remittanceId}`;
        if (remittanceToDelete.lastName || remittanceToDelete.firstName) {
            const lastName = remittanceToDelete.lastName || '';
            const firstName = remittanceToDelete.firstName || '';
            const middleInitial = remittanceToDelete.middleInitial ? ` ${remittanceToDelete.middleInitial}.` : '';
            treasurerNameToDisplay = `${lastName}, ${firstName}${middleInitial}`.replace(/^, | ,$/, '').trim();
            if (treasurerNameToDisplay === "," || treasurerNameToDisplay === "") {
                treasurerNameToDisplay = `Remittance ID ${remittanceToDelete.remittanceId}`;
            }
        }

        try {
            await remittanceService.deleteRemittance(remittanceToDelete.remittanceId);
            fetchRemittances(); // Refresh the list
            setPageSuccess(`Remittance ${remittanceToDelete.remittanceId} deleted successfully.`);
        } catch (err) {
            console.error("Error deleting remittance:", err);
            
            let errorMessage = `Failed to delete remittance ${remittanceToDelete.remittanceId}.`;
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setPageError(errorMessage);
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setRemittanceToDelete(null);
        }
    };

    // Replace the old handleDelete function with the new one that opens the dialog
    const handleDelete = (id) => {
        const remittance = remittances.find(r => r.remittanceId === id);
        if (remittance) {
            handleDeleteRequest(remittance);
        } else {
            // If remittance data can't be found in state, create a minimal object
            handleDeleteRequest({ remittanceId: id });
        }
    };

    // Calculate total remittance amount
    useEffect(() => {
        if (!selectedFeeType || !selectedUser) {
            setTotalRemittance(0);
            return;
        }

        const calculateTotal = async () => {
            try {
                // Use the new service function to get the total amount directly
                const total = await paymentService.getTotalAmountByClassAndFee(
                    selectedUser.programCode,
                    selectedUser.yearLevel,
                    selectedUser.section,
                    selectedFeeType
                );
                setTotalRemittance(Number(total) || 0); // Ensure it's a number
            } catch (error) {
                console.error('Error fetching total remittance amount:', error);
                setTotalRemittance(0);
            }
        };
        
        calculateTotal();
    }, [selectedFeeType, selectedUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const saveFormData = {
            feeType: formData.get('feeType'),
            userId: formData.get('userId'),
            amountRemitted: totalRemittance // Use calculated total instead of input
        };

        setFormError('');
        setPageError('');
        setPageSuccess('');

        // Basic client-side validation
        if (!saveFormData.feeType || !saveFormData.userId || totalRemittance <= 0) {
            setFormError("Fee Type, Class Treasurer, and a positive remittance amount are required.");
            return;
        }

        try {
            // Find treasurer details for success message
            const treasurer = users.find(u => String(u.accountId) === String(saveFormData.userId));
            let treasurerName = `Treasurer ID ${saveFormData.userId}`; // Fallback
            if (treasurer) {
                const lastName = treasurer.lastName || '';
                const firstName = treasurer.firstName || '';
                const middleInitial = treasurer.middleInitial ? ` ${treasurer.middleInitial}.` : '';
                treasurerName = `${lastName}, ${firstName}${middleInitial}`.replace(/^, | ,$/, '').trim();
                if (treasurerName === "," || treasurerName === "") treasurerName = `Treasurer ID ${saveFormData.userId}`;
            }

            // Find fee details for success message
            const fee = fees.find(f => String(f.feeId) === String(saveFormData.feeType));
            const feeTypeName = fee ? fee.feeType : `Fee ID ${saveFormData.feeType}`;

            if (modalMode === 'edit') {
                await remittanceService.updateRemittance(
                    editingRemittance.id,
                    saveFormData.feeType,
                    saveFormData.userId,
                    saveFormData
                );
                setPageSuccess(`Remittance for ${treasurerName} (${feeTypeName}) updated successfully.`);
            } else {
                await remittanceService.addRemittance(
                    saveFormData.feeType,
                    saveFormData.userId,
                    saveFormData
                );
                setPageSuccess(`Remittance for ${treasurerName} (${feeTypeName}) recorded successfully.`);
            }
            
            fetchRemittances();
            closeModal();
        } catch (err) {
            console.error(`Error ${modalMode === 'edit' ? 'updating' : 'adding'} remittance:`, err);
            
            let errorMessage = `Error ${modalMode === 'edit' ? 'updating' : 'recording'} remittance`;
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.status === 409) {
                errorMessage = "This treasurer already has a remittance record for this fee";
            } else if (err.response?.status === 404) {
                errorMessage = "Treasurer or fee information not found";
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setFormError(errorMessage);
        }
    };

    // Side effects
    useEffect(() => {
        if (viewMode === 'records') {
            fetchRemittances();
        } else if (viewMode === 'listOfFees') {
            if (filters.fee && filters.fee !== 'all') {
                fetchUnremittedTreasurers(filters.fee);
            } else {
                // Clear data or show a message if no fee is selected for "List of Fees"
                setUnremittedTreasurers([]);
                setTotalElements(0); // Or handle appropriately
            }
        }
    }, [currentPage, pageSize, sortField, sortDirection, filters, viewMode, user.accountId, location.search]);
    
    useEffect(() => {
        fetchFees();
        fetchUsers();
        fetchPrograms();
    }, []);

    // Auto-select first fee in 'listOfFees' mode (NEW)
    useEffect(() => {
        if (viewMode === 'listOfFees' && filters.fee === 'all' && fees.length > 0) {
            const firstFeeId = String(fees[0].feeId);
            setFilters(prev => ({ ...prev, fee: firstFeeId }));
            setSelectedFeeType(firstFeeId); // Keep modal selection in sync
        }
    }, [fees, viewMode, filters.fee]); // Dependencies: run when these change

    // Get the appropriate data and columns based on view mode (REVISED)
    const getDataAndColumns = () => {
        if (viewMode === 'records') {
            return {
                data: remittances,
                columns: recordsColumns,
                total: totalElements
            };
        } else { // viewMode === 'listOfFees'
            // Only show data if a specific fee is selected
            if (filters.fee !== 'all') {
                return {
                    data: unremittedTreasurers,
                    columns: feesListColumns,
                    total: totalElements 
                };
            } else {
                // If 'listOfFees' mode and filters.fee is 'all' 
                // (e.g., before auto-select or if user explicitly chose 'All Fees' from filter)
                // Return empty data; the "Select a Fee..." message is shown.
                return {
                    data: [],
                    columns: feesListColumns,
                    total: 0
                };
            }
        }
    };

    // Get data and columns based on current view
    const { data, columns, total } = getDataAndColumns();

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
                            <span>Showing remittances for Treasurer: <strong>{activeSearchFilter.name} (Account ID: {activeSearchFilter.id})</strong></span>
                        </div>
                        <Button 
                            variant="ghost"
                            size="sm"
                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100"
                            onClick={() => {
                                navigate(location.pathname, { replace: true }); // Remove query params
                                setActiveSearchFilter(null);
                                // fetchRemittances will be called due to location.search change in useEffect
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
                    Remittance Records
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
                        <Banknote className="w-4 h-4 mr-2" />
                        Select a Fee Type from the filter above to see all Class Treasurers and their remittance status.
                    </p>
                </div>
            )}

            {remittances.some(r => r.status === 'PARTIAL') && (
                <div className="p-3 mb-4 text-sm text-blue-700 bg-blue-100 border border-blue-200 rounded-md">
                    <p className="flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Some remittances are marked as "Partial" because not all students in those classes have paid the fee yet. 
                        The status will automatically update to "Completed" when all students have paid.
                    </p>
                </div>
            )}

            <DataTable
                columns={columns}
                data={data}
                title={'remittance'}
                showAdd={handleAdd}
                user={user}
                loading={loading}
                // Pagination props
                currentPage={currentPage + 1} // Convert 0-based to 1-based for the UI
                totalElements={total}
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
                disableReportGeneration={viewMode === 'listOfFees'}
            />

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
                                    <Banknote className="w-5 h-5 mr-2 text-rose-600" />
                                    Add Remittance
                                </div>
                            ) : (
                                <div className="flex items-center text-rose-600">
                                    <Pencil className="w-5 h-5 mr-2 text-rose-600" />
                                    Edit Remittance
                                </div>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {modalMode === "add"
                                ? "Fill in the details to record a new remittance."
                                : "Make changes to update the remittance record."
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Form Error Message */}
                        {formError && (
                            <div className="p-3 text-sm border rounded-md bg-rose-50 border-rose-200 text-rose-600">
                                <div className="flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {formError}
                                </div>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label htmlFor="feeType">Fee Type</Label>
                                <Select
                                    name="feeType"
                                    value={selectedFeeType || ''}
                                    onValueChange={(value) => {
                                        setSelectedFeeType(value);
                                        setEditingRemittance(prev => ({
                                            ...prev || {},
                                            feeType: value
                                        }));
                                    }}
                                    required
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select fee type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {fees.map(fee => (
                                            <SelectItem key={fee.feeId} value={String(fee.feeId)}>
                                                {fee.feeType} - ₱{fee.amount} ({fee.fees || 'No description'})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="userId">Remitted By</Label>
                                <Select
                                    name="userId"
                                    value={selectedUser?.userId ? String(selectedUser.userId) : ''}
                                    onValueChange={(value) => {
                                        const user = users.find(u => String(u.accountId) === String(value));
                                        setSelectedUser({
                                            userId: user.accountId,
                                            programCode: user.programCode,
                                            yearLevel: user.yearLevel,
                                            section: user.section
                                        });
                                        setEditingRemittance(prev => ({
                                            ...prev || {},
                                            userId: value
                                        }));
                                    }}
                                    required
                                >
                                    <SelectTrigger className="w-full mt-1">
                                        <SelectValue placeholder="Select user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map(user => (
                                            <SelectItem key={user.accountId} value={String(user.accountId)}>
                                                {user.yearLevel} {user.section} - {user.lastName}, {user.firstName} {user.middleInitial}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="p-4 mt-4 rounded-lg bg-gray-50">
                            <Label>Total Amount to be Remitted</Label>
                            <div className="text-xl font-bold text-rose-600">
                                ₱{totalRemittance.toLocaleString('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </div>
                        </div>
                        <DialogFooter className="flex justify-end gap-2 mt-6">
                            <Button type="button" className="cursor-pointer" variant="outline" onClick={closeModal}>
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                className="cursor-pointer bg-rose-600 hover:bg-rose-600/90"
                                disabled={!selectedFeeType || !selectedUser || totalRemittance <= 0}
                            >
                                {modalMode === "add" ? "Record Remittance" : "Save Changes"}
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
                title="Delete Remittance"
                description={
                    remittanceToDelete ? 
                    `Are you sure you want to delete this remittance (ID: ${remittanceToDelete.remittanceId})? This action cannot be undone.`
                    : "Are you sure you want to delete this remittance? This action cannot be undone."
                }
                loading={isDeleting}
                confirmButtonText="Delete Remittance"
            />
        </>
    );
};

export default Remittance;