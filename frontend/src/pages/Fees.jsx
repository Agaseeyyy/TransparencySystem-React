import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import DataTable from '../components/DataTable';
import ActionButton from '../components/ActionButton';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Pencil, CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import { feeService } from "../utils/apiService";

const Fees = () => {
    // State hooks
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editingFees, setEditingFees] = useState(null);
    const [fees, setFees] = useState([]);
    const [formError, setFormError] = useState('');
    const [pageError, setPageError] = useState('');
    const [pageSuccess, setPageSuccess] = useState('');
    
    // Delete Confirmation Dialog states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [feeToDelete, setFeeToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Pagination and sorting state
    const [currentPage, setCurrentPage] = useState(0); // Backend uses 0-based indexing
    const [pageSize, setPageSize] = useState(10);
    const [sortField, setSortField] = useState('feeId');
    const [sortDirection, setSortDirection] = useState('asc');
    const [loading, setLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    // Table columns definition
    const columns = [
        { key: 'feeId', label: 'Fee ID', sortable: true },
        { key: 'feeType', label: 'Type', sortable: true },
        { 
            key: 'amount', 
            label: 'Amount', 
            sortable: true,
            render: (amount) => amount ? `₱${parseFloat(amount).toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}` : '-'
        },
        { 
            key: 'dueDate', 
            label: 'Due Date', 
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
            key: 'createdAt', 
            label: 'Created', 
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
            key: "actions",
            label: "Actions",
            render: (_, row) => (
                <ActionButton 
                    row={row} 
                    idField="feeId" 
                    onEdit={() => handleEdit(row)} 
                    onDelete={() => handleDeleteRequest(row)}
                />
            ),
        },
    ];

    // Data fetching functions
    const fetchFees = async () => {
        setLoading(true);
        setPageError('');
        try {
            const response = await feeService.getFees(
                currentPage,
                pageSize,
                sortField,
                sortDirection
            );
            
            if (response.content) {
                setFees(response.content);
                setTotalElements(response.totalElements || 0);
            } else {
                setFees(response || []);
                setTotalElements(response?.length || 0);
            }
        } catch (err) {
            console.error("Error fetching fees:", err);
            setPageError("Failed to fetch fees. Please try again later.");
            setFees([]);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    // Handlers for pagination and sorting
    const handlePageChange = (page) => {
        setCurrentPage(page - 1);
        setPageError('');
        setPageSuccess('');
    };

    const handleRowsPerPageChange = (value) => {
        setPageSize(parseInt(value));
        setCurrentPage(0);
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
        setEditingFees(null);
        setFormError('');
    };
    
    const handleAdd = () => {
        setModalMode('add');
        setEditingFees(null);
        setFormError('');
        setPageError('');
        setPageSuccess('');
        setIsModalOpen(true);
    };
    
    const handleEdit = (fee) => {  
        setEditingFees({
            id: fee.feeId,
            feeType: fee.feeType,
            amount: fee.amount,
            dueDate: fee.dueDate?.split('T')[0],
        });
        setModalMode('edit');
        setFormError('');
        setPageError('');
        setPageSuccess('');
        setIsModalOpen(true);
    };
    
    // Event handlers
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setPageError('');
        setPageSuccess('');
        const formData = new FormData(e.target);
        const saveFormData = Object.fromEntries(formData.entries());

        if (!saveFormData.feeType || !saveFormData.amount || !saveFormData.dueDate) {
            setFormError("Fee Type, Amount, and Due Date are required.");
            return;
        }
        if (parseFloat(saveFormData.amount) <= 0) {
            setFormError("Amount must be a positive number.");
            return;
        }

        try {
            let successMessage = '';
            if (modalMode === 'edit') {
                await feeService.updateFee(editingFees.id, saveFormData);
                successMessage = `Fee '${saveFormData.feeType}' updated successfully.`;
            } else {
                await feeService.addFee(saveFormData);
                successMessage = `Fee '${saveFormData.feeType}' added successfully.`;
            }
            
            fetchFees();
            closeModal();
            setPageSuccess(successMessage);
        } catch (err) {
            console.error(`Error ${modalMode === 'edit' ? 'updating' : 'adding'} fee:`, err);
            let errorMessage = `Failed to ${modalMode === 'edit' ? 'update' : 'add'} fee.`;
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            setFormError(errorMessage);
        }
    };

    const handleDeleteRequest = (fee) => {
        setFeeToDelete(fee);
        setDeleteDialogOpen(true);
        setPageError('');
        setPageSuccess('');
    };

    const confirmDelete = async () => {
        if (!feeToDelete) return;

        setIsDeleting(true);
        setPageError('');
        setPageSuccess('');
        const feeName = feeToDelete.feeType || `ID ${feeToDelete.feeId}`;

        try {
            await feeService.deleteFee(feeToDelete.feeId);
            fetchFees();
            setPageSuccess(`Fee '${feeName}' deleted successfully.`);
        } catch (err) {
            console.error("Error deleting fee:", err);
            let errorMessage = `Failed to delete fee '${feeName}'.`;
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            setPageError(errorMessage);
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setFeeToDelete(null);
        }
    };

    // Side effects
    useEffect(() => {
        fetchFees();
    }, [currentPage, pageSize, sortField, sortDirection]);

    // Component render
    return (
        <>
            {pageError && (
                <div className="p-3 mb-4 text-sm border rounded-md bg-rose-50 border-rose-200 text-rose-600">
                    <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {pageError}
                    </div>
                </div>
            )}
            {pageSuccess && (
                <div className="p-3 mb-4 text-sm text-green-700 border border-green-200 rounded-md bg-green-50">
                    <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {pageSuccess}
                    </div>
                </div>
            )}

            <DataTable 
                columns={columns} 
                data={fees}
                title={'fee'}
                showAdd={user?.role === 'Admin' || user?.role === 'Treasurer' ? handleAdd : undefined}
                user={user}
                loading={loading}
                currentPage={currentPage + 1}
                totalElements={totalElements}
                rowsPerPage={pageSize}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                onSort={handleSort}
                sortBy={sortField}
                sortDir={sortDirection}
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
                                    <CreditCard className="w-5 h-5 mr-2 text-rose-600" />
                                    Add Fee
                                </div>
                            ) : (
                                <div className="flex items-center text-rose-600">
                                    <Pencil className="w-5 h-5 mr-2 text-rose-600" />
                                    Edit Fee
                                </div>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {modalMode === "add" 
                                ? "Fill in the details to create a new fee."
                                : "Make changes to update the fee."
                            }
                        </DialogDescription>
                    </DialogHeader>
                    {formError && (
                        <div className="p-3 mt-4 text-sm border rounded-md bg-rose-50 border-rose-200 text-rose-600">
                            <div className="flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {formError}
                            </div>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="mt-2 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label htmlFor="feeType">Fee Type <span className="text-rose-600">*</span></Label>
                                <Input
                                    id="feeType"
                                    name="feeType"
                                    defaultValue={editingFees?.feeType || ""}
                                    placeholder="e.g. Tuition Fee, Library Fee, etc."
                                    className="mt-1"
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="amount">Amount <span className="text-rose-600">*</span></Label>
                                <div className="relative mt-1">
                                    <span className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2">₱</span>
                                    <Input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        defaultValue={editingFees?.amount || ""}
                                        placeholder="0.00"
                                        className="pl-7"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="dueDate">Due Date <span className="text-rose-600">*</span></Label>
                                <Input
                                    id="dueDate"
                                    name="dueDate"
                                    type="date"
                                    defaultValue={editingFees?.dueDate || new Date().toISOString().split('T')[0]}
                                    className="mt-1"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter className="flex justify-end gap-2 mt-6">
                            <Button type="button" className="cursor-pointer" variant="outline" onClick={closeModal}>
                                Cancel
                            </Button>
                            <Button type="submit" className="cursor-pointer bg-rose-600 hover:bg-rose-600/90">
                                {modalMode === "add" ? "Add Fee" : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <DeleteConfirmationDialog 
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                title="Delete Fee"
                description={
                    feeToDelete ? 
                    `Are you sure you want to delete the fee '${feeToDelete.feeType || `ID ${feeToDelete.feeId}`}'? This action cannot be undone.`
                    : "Are you sure you want to delete this fee? This action cannot be undone."
                }
                loading={isDeleting}
                confirmButtonText="Delete Fee"
            />
        </>
    )
}

export default Fees;