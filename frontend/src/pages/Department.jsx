import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import DataTable from '../components/DataTable';
import ActionButton from '../components/ActionButton';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BuildingIcon, Pencil, AlertCircle, CheckCircle } from "lucide-react";
import { departmentService } from "../utils/apiService";

const Department = () => {
    // State hooks
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [departments, setDepartments] = useState([]);
    
    // Error, Success, and Dialog states
    const [formError, setFormError] = useState('');
    const [pageError, setPageError] = useState('');
    const [pageSuccess, setPageSuccess] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Pagination and sorting state
    const [currentPage, setCurrentPage] = useState(0); // Backend uses 0-based indexing
    const [pageSize, setPageSize] = useState(10);
    const [sortField, setSortField] = useState('departmentId');
    const [sortDirection, setSortDirection] = useState('asc');
    const [loading, setLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    // Table columns definition
    const columns = [
        { key: 'departmentId', label: 'Department ID', sortable: true },
        { key: 'departmentName', label: 'Department Name', sortable: true },
        {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
                <ActionButton 
                    row={row}
                    idField="departmentId" 
                    onEdit={() => handleEdit(row)} 
                    onDelete={() => handleDeleteRequest(row)}
                />
            ),
        },
    ];

    // Data fetching functions
    const fetchDepartments = async () => {
        setLoading(true);
        
        try {
            const response = await departmentService.getDepartments(
                currentPage,
                pageSize,
                sortField,
                sortDirection
            );
            
            if (response.content) {
                setDepartments(response.content);
                setTotalElements(response.totalElements || 0);
            } else {
                setDepartments(response);
                setTotalElements(response.length || 0);
            }
        } catch (err) {
            console.log(err);
            setPageError("Failed to fetch departments. Please try again.");
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
        setEditingDepartment(null);
        setFormError('');
    };
    
    const handleAdd = () => {
        setModalMode('add');
        setEditingDepartment(null);
        setFormError('');
        setPageError('');
        setPageSuccess('');
        setIsModalOpen(true);
    };

    const handleEdit = (department) => {  
        setEditingDepartment({
            departmentId: department.departmentId,
            departmentName: department.departmentName,
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

        if (!saveFormData.departmentId || !saveFormData.departmentName) {
            setFormError("Department ID and Name are required.");
            return;
        }

        try {
            let successMessage = '';
            if (modalMode === 'edit') {
                await departmentService.updateDepartment(
                    editingDepartment.departmentId, 
                    saveFormData
                );
                successMessage = `Department '${saveFormData.departmentName}' updated successfully.`;
            } else {
                await departmentService.addDepartment(saveFormData);
                successMessage = `Department '${saveFormData.departmentName}' added successfully.`;
            }
            
            fetchDepartments();
            closeModal();
            setPageSuccess(successMessage);
        } catch (err) {
            console.error(`Error ${modalMode === 'edit' ? 'updating' : 'adding'} department:`, err);
            let errorMessage = `Failed to ${modalMode === 'edit' ? 'update' : 'add'} department.`;
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else {
                errorMessage = "An unexpected error occurred. Please try again.";
            }
            setFormError(errorMessage);
        }
    };

    // Delete flow
    const handleDeleteRequest = (department) => {
        setDepartmentToDelete(department);
        setDeleteDialogOpen(true);
        setPageError('');
        setPageSuccess('');
    };

    const confirmDelete = async () => {
        if (!departmentToDelete) return;
        
        setIsDeleting(true);
        setPageError('');
        setFormError(''); 
        setPageSuccess('');

        const deptName = departmentToDelete.departmentName;
        const deptId = departmentToDelete.departmentId;

        try {
            await departmentService.deleteDepartment(deptId);
            fetchDepartments();
            setPageSuccess(`Department '${deptName}' (ID: ${deptId}) deleted successfully.`);
        } catch (err) {
            console.error("Error deleting department:", err);
            let errorMessage = `Failed to delete department '${deptName}' (ID: ${deptId}).`;
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else {
                errorMessage = "An unexpected error occurred while deleting.";
            }
            setPageError(errorMessage);
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setDepartmentToDelete(null);
        }
    };

    // Side effects
    useEffect(() => {
        fetchDepartments();
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
                data={departments}
                title={'department'}
                showAdd={handleAdd}
                user={user}
                loading={loading}
                // Pagination props
                currentPage={currentPage + 1}
                totalElements={totalElements}
                rowsPerPage={pageSize}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                // Sorting props
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
                                    <BuildingIcon className="w-5 h-5 mr-2 text-rose-600" />
                                    Add Department
                                </div>
                            ) : (
                                <div className="flex items-center text-rose-600">
                                    <Pencil className="w-5 h-5 mr-2 text-rose-600" />
                                    Edit Department
                                </div>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {modalMode === "add" 
                                ? "Fill in the details to create a new department."
                                : "Make changes to update the department."
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
                                <Label htmlFor="departmentId">Department ID <span className="text-rose-600">*</span></Label>
                                <Input
                                    id="departmentId"
                                    name="departmentId"
                                    defaultValue={editingDepartment?.departmentId || ""}
                                    placeholder="e.g. CCS, CAS, etc"
                                    className="mt-1"
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="departmentName">Department Name <span className="text-rose-600">*</span></Label>
                                <Input
                                    id="departmentName"
                                    name="departmentName"
                                    defaultValue={editingDepartment?.departmentName || ""}
                                    placeholder="e.g. College of Computer Studies"
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
                                {modalMode === "add" ? "Add Department" : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                title="Delete Department"
                description={
                    departmentToDelete
                        ? `Are you sure you want to delete the department ${departmentToDelete.departmentName} (ID: ${departmentToDelete.departmentId})? This action cannot be undone.`
                        : "Are you sure you want to delete this department? This action cannot be undone."
                }
                loading={isDeleting}
            />
        </>
    )
}

export default Department;