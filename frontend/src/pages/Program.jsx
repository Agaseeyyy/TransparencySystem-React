import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import DataTable from '../components/DataTable';
import ActionButton from '../components/ActionButton';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FolderPlus, Pencil, AlertCircle, CheckCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { programService, departmentService } from "../utils/apiService";

const Program = () => {    
    // State hooks
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editingProgram, setEditingProgram] = useState(null);
    const [programs, setPrograms] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [formError, setFormError] = useState('');
    const [pageError, setPageError] = useState('');
    const [pageSuccess, setPageSuccess] = useState('');
    
    // Delete confirmation state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [programToDelete, setProgramToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Filter state
    const [filters, setFilters] = useState({
        department: 'all'
    });
    
    // Filter options
    const [filterOptions, setFilterOptions] = useState({
        department: []
    });
    
    // Pagination and sorting state
    const [currentPage, setCurrentPage] = useState(0); // Backend uses 0-based indexing
    const [pageSize, setPageSize] = useState(10);
    const [sortField, setSortField] = useState('programId');
    const [sortDirection, setSortDirection] = useState('asc');
    const [loading, setLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    // Table columns definition
    const columns = [
        { key: 'programId', label: 'Program ID', sortable: true },
        { key: 'programName', label: 'Program Name', sortable: true },
        { 
            key: 'departmentId', 
            label: 'Department', 
            sortable: true,
            sortKey: 'department.departmentName',
            render: (_, row) => (
                <span>{row.department?.departmentName || row.departmentId || ''}</span>
            )
        },
        {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
                <ActionButton 
                    row={row} 
                    idField="programId" 
                    onEdit={() => handleEdit(row)} 
                    onDelete={() => handleDeleteRequest(row)} 
                />
            ),
        },
    ];

    // Data fetching functions
    const fetchPrograms = async () => {
        setLoading(true);
        
        try {
            const response = await programService.getPrograms(
                currentPage,
                pageSize,
                sortField,
                sortDirection,
                filters.department !== 'all' ? filters.department : null
            );
            
            setPrograms(response.content || []);
            setTotalElements(response.totalElements || 0);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await departmentService.getDepartments();
            
            setDepartments(response.content);
            
            // Setup department filter options
            setFilterOptions(prev => ({
                ...prev,
                department: response.content.map(dept => ({
                    id: dept.departmentId,
                    name: dept.departmentName
                }))
            }));
        } catch (err) {
            console.log(err);
        }
    };

    // Handler for filter changes
    const handleFilter = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
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
    const handleAdd = () => {
        setModalMode('add');
        setFormError('');
        setPageError('');
        setPageSuccess('');
        setIsModalOpen(true);
    };

    const handleEdit = (program) => {  
        setEditingProgram({
            departmentId: program.department?.departmentId || program.departmentId,
            programId: program.programId,
            programName: program.programName,
        });
        setModalMode('edit');
        setFormError('');
        setPageError('');
        setPageSuccess('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalMode('add');
        setEditingProgram(null);
        setFormError('');
    };

    // Event handlers
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setPageError('');
        setPageSuccess('');
        const formData = new FormData(e.target);
        const saveFormData = Object.fromEntries(formData.entries());

        if (!saveFormData.programId || !saveFormData.programName || !saveFormData.departmentId) {
            setFormError("All fields with * are required.");
            return;
        }

        try {
            let successMessage = '';
            if (modalMode === 'edit') {
                await programService.updateProgram(
                    editingProgram.programId,
                    saveFormData.departmentId,
                    saveFormData
                );
                successMessage = `Program '${saveFormData.programName}' updated successfully.`;
            } else {
                await programService.addProgram(
                    saveFormData.departmentId,
                    saveFormData
                );
                successMessage = `Program '${saveFormData.programName}' added successfully.`;
            }
            fetchPrograms();
            closeModal();
            setPageSuccess(successMessage);
            setPageError('');
        } catch (err) {
            console.error(`Error ${modalMode === 'edit' ? 'updating' : 'adding'} program:`, err);
            let errorMessage = `Failed to ${modalMode === 'edit' ? 'update' : 'add'} program.`;
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
                if (errorMessage.toLowerCase().includes("already exists")) {
                    errorMessage = `A program with ID '${saveFormData.programId}' already exists. Please use a different ID.`;
                } else if (errorMessage.toLowerCase().includes("not found")) {
                    errorMessage = "The specified department or program could not be found. Please check the details or refresh.";
                }
            } else {
                errorMessage = `An unexpected error occurred. Please try again.`;
            }
            setFormError(errorMessage);
            setPageSuccess('');
        }
    };

    // Handle delete request (opens confirmation dialog)
    const handleDeleteRequest = (program) => {
        setProgramToDelete(program);
        setDeleteDialogOpen(true);
    };

    // Actual delete function after confirmation
    const confirmDelete = async () => {
        if (!programToDelete) return;
        
        const id = programToDelete.programId;
        const name = programToDelete.programName;
        
        setPageError(''); 
        setFormError(''); 
        setPageSuccess(''); 
        setIsDeleting(true);
        
        try {
            await programService.deleteProgram(id);
            fetchPrograms();
            setPageSuccess(`Program '${name || id}' deleted successfully.`);
            setPageError('');
        } catch (err) {
            console.error("Error deleting program:", err.message, err.response);
            let errorMessage = "Failed to delete program.";
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
                if (errorMessage.toLowerCase().includes("cannot delete") && errorMessage.toLowerCase().includes("associated students")) {
                    errorMessage = `Cannot delete Program '${id}'. It has associated students. Please reassign them first.`;
                } else if (errorMessage.toLowerCase().includes("not found")){
                    errorMessage = `Program '${id}' not found. It might have already been deleted.`;
                }
            } else {
                errorMessage = `An unexpected error occurred while deleting. Please try again.`;
            }
            setPageError(errorMessage);
            setPageSuccess(''); 
        } finally {
            // Reset delete state
            setDeleteDialogOpen(false);
            setProgramToDelete(null);
            setIsDeleting(false);
        }
    };

    // Legacy handleDelete (now replaced by handleDeleteRequest and confirmDelete)
    const handleDelete = async (id) => {
        // This is kept for backward compatibility, but we now use the confirmation flow
        const programToDelete = programs.find(p => p.programId === id);
        handleDeleteRequest(programToDelete);
    };

    // Side effects
    useEffect(() => {
        fetchPrograms();
    }, [currentPage, pageSize, sortField, sortDirection, filters]);
    
    useEffect(() => {
        fetchDepartments();
    }, []);

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
                data={programs}
                title={'program'}
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
            
            {/* Program Form Dialog */}
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
                                    <FolderPlus className="w-5 h-5 mr-2 text-rose-600" />
                                    Add Program
                                </div>
                            ) : (
                                <div className="flex items-center text-rose-600">
                                    <Pencil className="w-5 h-5 mr-2 text-rose-600" />
                                    Edit Program
                                </div>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {modalMode === "add" 
                                ? "Fill in the details to create a new program."
                                : "Make changes to update the program."
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
                                <Label htmlFor="programId">Program ID <span className="text-rose-600">*</span></Label>
                                <Input
                                    id="programId"
                                    name="programId"
                                    defaultValue={editingProgram?.programId || undefined}
                                    placeholder="e.g. BSIT, BSCS, etc"
                                    className="mt-1"
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="programName">Program Name <span className="text-rose-600">*</span></Label>
                                <Input
                                    id="programName"
                                    name="programName"
                                    defaultValue={editingProgram?.programName || undefined}
                                    placeholder="e.g. BS Information Technology"
                                    className="mt-1"
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="departmentId">Department <span className="text-rose-600">*</span></Label>
                                <Select name="departmentId" defaultValue={editingProgram?.departmentId || undefined} required>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map(dept => (
                                            <SelectItem key={dept.departmentId} value={dept.departmentId}>
                                                {dept.departmentName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter className="flex justify-end gap-2 mt-6">
                            <Button type="button" className="cursor-pointer" variant="outline" onClick={closeModal}>
                                Cancel
                            </Button>
                            <Button type="submit" className="cursor-pointer bg-rose-600 hover:bg-rose-600/90">
                                {modalMode === "add" ? "Add Program" : "Save Changes"}
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
                title="Delete Program"
                description={
                    programToDelete
                        ? `Are you sure you want to delete the program ${programToDelete.programName} (ID: ${programToDelete.programId})? This action cannot be undone.`
                        : "Are you sure you want to delete this program? This action cannot be undone."
                }
                loading={isDeleting}
            />
        </>
    )
}

export default Program