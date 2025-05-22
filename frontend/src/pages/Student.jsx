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
import { UserPlus, Pencil, AlertCircle, CheckCircle } from "lucide-react";
import { studentService, programService } from "../utils/apiService";

const Student = () => {    
    // State hooks
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editingStudent, setEditingStudent] = useState(null);
    const [students, setStudents] = useState([]);
    const [programs, setPrograms] = useState([]);
    
    // Error and Success Message States
    const [formError, setFormError] = useState('');
    const [pageError, setPageError] = useState('');
    const [pageSuccess, setPageSuccess] = useState('');

    // Delete Confirmation Dialog States
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Filter state
    const [filters, setFilters] = useState({
        program: 'all',
        yearLevel: 'all',
        section: 'all',
        status: 'all'
    });
    
    // Filter options
    const [filterOptions, setFilterOptions] = useState({
        program: [],
        yearLevel: ["1", "2", "3", "4"],
        section: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
        status: ["Active", "Inactive", "Graduated"]
    });
    
    // Pagination and sorting state
    const [currentPage, setCurrentPage] = useState(0); // Backend uses 0-based indexing
    const [pageSize, setPageSize] = useState(10);
    const [sortField, setSortField] = useState('lastName');
    const [sortDirection, setSortDirection] = useState('asc');
    const [loading, setLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    // Table columns definition
    const columns = [
        { key: "studentId", label: 'Student ID', sortable: true },
        { 
            key: 'fullName', 
            label: 'Full Name', 
            sortable: true, 
            sortKey: 'lastName',
            render: (_, row) => {
                const lastName = row.lastName || '';
                const firstName = row.firstName || '';
                const middleInitial = row.middleInitial ? ` ${row.middleInitial}.` : '';
                return (
                    <span className="font-medium text-gray-900">
                        {`${lastName}, ${firstName}${middleInitial}`.replace(/^, | ,$/, '').trim()}
                    </span>
                );
            }
        },
        { key: "email", label: 'Email', sortable: true },
        { 
            key: 'program', 
            label: 'Program', 
            sortable: true,
            sortKey: 'program.programName',
            render: (_, row) => (
                <span>
                    {row.program || ''}
                </span>
            )
        },
        { 
            key: "yearSec", 
            label: 'Year and Section',
            sortable: false, // Not directly sortable as it's a composite value
            render: (_, row)=> (
                <span>
                    {`${row.yearLevel} - ${row.section}`}
                </span>
            )
        },
        { key: "yearLevel", label: 'Year Level', sortable: true, hidden: true },
        { key: "section", label: 'Section', sortable: true, hidden: true },
        { key: "status", label: 'Status', sortable: true },
        { 
            key: 'department', 
            label: 'Department',
            sortable: true,
            sortKey: 'program.department',
            render: (_, row) => (
                <span>
                    {row.department || ''}
                </span>
            )
        },
        {
            key: "actions",
            label: "Actions",
            render: (_, row) => {
                return (
                    <ActionButton 
                        row={row} 
                        idField="studentId" 
                        onEdit={() => handleEdit(row)} 
                        onDelete={() => handleDeleteRequest(row)}
                    />
                );
            }
        },
    ];

    // Data fetching functions
    const fetchStudents = async () => {
        setLoading(true);
        
        try {
            const params = {
                pageNumber: currentPage,
                pageSize: pageSize,
                sortField: sortField,
                sortDirection: sortDirection
            };
            
            // Add filter parameters as query params if they exist
            if (filters.program !== 'all') params.program = filters.program;
            if (filters.yearLevel !== 'all') params.yearLevel = filters.yearLevel;
            if (filters.section !== 'all') params.section = filters.section;
            if (filters.status !== 'all') params.status = filters.status;
            
            const response = await studentService.getStudents(params);
            
            setStudents(response.content || []);
            setTotalElements(response.totalElements || 0);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPrograms = async () => {
        try {
            const response = await programService.getPrograms();
            
            const programsArray = response.content || response; // Ensure we get the array of raw program objects
            setPrograms(programsArray); // This state is used for the modal, expects raw program objects
            
            setFilterOptions(prev => ({
                ...prev,
                // For filterOptions, map to a standardized {id, name} structure for DataTable
                program: programsArray.map(prog => ({ id: prog.programId, name: prog.programName })) 
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
        setPageError('');
        setPageSuccess('');
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
    const handleAdd = () => {
        fetchPrograms();
        setModalMode('add');
        setEditingStudent(null);
        setFormError('');
        setPageError('');
        setPageSuccess('');
        setIsModalOpen(true);
    };

    const handleEdit = (student) => {  
        fetchPrograms();
        setEditingStudent({
            studentId: student.studentId,
            lastName: student.lastName,
            firstName: student.firstName,
            middleInitial: student.middleInitial,
            email: student.email,
            program: student.program?.programId || student.program,
            yearLevel: String(student.yearLevel),
            section: student.section,
            status: student.status
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
        setEditingStudent(null);
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

        // Basic client-side validation
        if (!saveFormData.studentId || !saveFormData.lastName || !saveFormData.firstName || !saveFormData.email || !saveFormData.programId || !saveFormData.yearLevel || !saveFormData.section || !saveFormData.status) {
            setFormError("All fields marked with * are required.");
            return;
        }

        try {
            let successMessage = '';
            const studentFullName = `${saveFormData.lastName}, ${saveFormData.firstName}${saveFormData.middleInitial ? ` ${saveFormData.middleInitial}.` : ''}`;

            if (modalMode === 'edit') {
                await studentService.updateStudent(
                    editingStudent.studentId,
                    saveFormData.programId,
                    saveFormData
                );
                successMessage = `Student ${studentFullName} updated successfully.`;
            } else {
                await studentService.addStudent(
                    saveFormData.programId,
                    saveFormData
                );
                successMessage = `Student ${studentFullName} added successfully.`;
            }
            
            fetchStudents();
            closeModal();
            setPageSuccess(successMessage);
        } catch (err) {
            console.error(`Error ${modalMode === 'edit' ? 'updating' : 'add'} student:`, err);
            let errorMessage = `Failed to ${modalMode === 'edit' ? 'update' : 'add'} student.`;
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
                 // Simplify known messages
                 if (errorMessage.toLowerCase().includes("already exists")) {
                    // More specific check for email vs student ID
                    if (errorMessage.toLowerCase().includes("email")) {
                        errorMessage = `A student with email '${saveFormData.email}' already exists.`;
                    } else if (errorMessage.toLowerCase().includes("student with id")) {
                        errorMessage = `A student with ID '${saveFormData.studentId}' already exists.`;
                    } else {
                        // Generic already exists if details not matched
                        errorMessage = "This student record (ID or Email) may already exist.";
                    }
                } else if (errorMessage.toLowerCase().includes("program not found")) {
                    errorMessage = "The selected program could not be found. Please refresh and try again.";
                } else if (errorMessage.toLowerCase().includes("does not match student id in request body")) {
                    errorMessage = "Student ID mismatch. Please ensure the ID is correct and try again."; 
                }
            } else {
                errorMessage = "An unexpected error occurred. Please try again.";
            }
            setFormError(errorMessage);
        }
    };

    // Delete flow
    const handleDeleteRequest = (student) => {
        setStudentToDelete(student);
        setDeleteDialogOpen(true);
        setPageError('');
        setPageSuccess('');
    };

    const confirmDelete = async () => {
        if (!studentToDelete) return;
        
        setIsDeleting(true);
        setPageError('');
        setPageSuccess('');

        const studentFullName = `${studentToDelete.lastName}, ${studentToDelete.firstName}${studentToDelete.middleInitial ? ` ${studentToDelete.middleInitial}.` : ''}`;
        const studentId = studentToDelete.studentId;

        try {
            await studentService.deleteStudent(studentId);
            fetchStudents();
            setPageSuccess(`Student ${studentFullName} (ID: ${studentId}) deleted successfully.`);
        } catch (err) {
            console.error("Error deleting student:", err);
            let errorMessage = `Failed to delete student ${studentFullName} (ID: ${studentId}).`;
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
                // Further simplify messages if needed based on backend exceptions
                if (errorMessage.toLowerCase().includes("associated account")) {
                    errorMessage = `Cannot delete ${studentFullName}. Student has an associated account.`;
                } else if (errorMessage.toLowerCase().includes("associated payment records")) {
                    errorMessage = `Cannot delete ${studentFullName}. Student has associated payment records.`;
                }
            } else {
                errorMessage = "An unexpected error occurred while deleting.";
            }
            setPageError(errorMessage);
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setStudentToDelete(null);
        }
    };

    // Side effects
    useEffect(() => {
        fetchStudents();
    }, [currentPage, pageSize, sortField, sortDirection, filters]);
    
    useEffect(() => {
        fetchPrograms();
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
                data={students}
                title={'student'}
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
                                    <UserPlus className="w-5 h-5 mr-2 text-rose-600" />
                                    Add Student
                                </div>
                            ) : (
                                <div className="flex items-center text-rose-600">
                                    <Pencil className="w-5 h-5 mr-2 text-rose-600" />
                                    Edit Student
                                </div>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {modalMode === "add" 
                                ? "Fill in the details to create a new student record."
                                : "Make changes to update the student record."
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
                                <Label htmlFor="studentId">Student ID <span className="text-rose-600">*</span></Label>
                                <Input
                                    id="studentId"
                                    name="studentId"
                                    defaultValue={editingStudent?.studentId || undefined }
                                    placeholder="231000000"
                                    className="mt-1"
                                    required
                                />
                            </div>

                            <div className="col-span-1">
                                <Label htmlFor="lastName">Last Name <span className="text-rose-600">*</span></Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    defaultValue={editingStudent?.lastName || undefined }
                                    placeholder="Dela Cruz"
                                    className="mt-1"
                                    required
                                />
                            </div>
                            
                            <div className="col-span-1">
                                <Label htmlFor="firstName">First Name <span className="text-rose-600">*</span></Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    defaultValue={editingStudent?.firstName || undefined }
                                    placeholder="Juan"
                                    className="mt-1"
                                    required
                                />
                            </div>

                            <div className="col-span-1">
                                <Label htmlFor="middleInitial">Middle Initial</Label>
                                <Select 
                                    name="middleInitial" 
                                    defaultValue={editingStudent?.middleInitial || undefined}
                                >
                                    <SelectTrigger className="w-full mt-1">
                                        <SelectValue placeholder="Select initial" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].map(letter => (
                                            <SelectItem key={letter} value={letter}>
                                                {letter}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="col-span-1">
                                <Label htmlFor="email">Email <span className="text-rose-600">*</span></Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={editingStudent?.email || undefined }
                                    placeholder="juan.delacruz@student.edu.ph"
                                    className="mt-1"
                                    required
                                />
                            </div>

                            <div className="w-full col-span-1">
                                <Label htmlFor="programId">Program <span className="text-rose-600">*</span></Label>
                                <Select 
                                    name="programId" 
                                    defaultValue={editingStudent?.program || undefined }
                                    required
                                >
                                    <SelectTrigger className="w-full mt-1">
                                        <SelectValue placeholder="Select program" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {programs.map(prog => (
                                            <SelectItem key={prog.programId} value={prog.programId}>
                                                {prog.programName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="w-full col-span-1">
                                <Label htmlFor="status">Status <span className="text-rose-600">*</span></Label>
                                <Select 
                                    name="status" 
                                    defaultValue={editingStudent?.status || undefined }
                                    required
                                >
                                    <SelectTrigger className="w-full mt-1">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                        <SelectItem value="Graduated">Graduated</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full col-span-1">
                                <Label htmlFor="yearLevel">Year Level <span className="text-rose-600">*</span></Label>
                                <Select 
                                    name="yearLevel" 
                                    defaultValue={editingStudent?.yearLevel || undefined }
                                    required
                                >
                                    <SelectTrigger className="w-full mt-1">
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1st Year</SelectItem>
                                        <SelectItem value="2">2nd Year</SelectItem>
                                        <SelectItem value="3">3rd Year</SelectItem>
                                        <SelectItem value="4">4th Year</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="w-full col-span-1">
                                <Label htmlFor="section">Section <span className="text-rose-600">*</span></Label>
                                <Select 
                                    name="section" 
                                    defaultValue={editingStudent?.section || undefined }
                                    required
                                >
                                    <SelectTrigger className="w-full mt-1">
                                        <SelectValue placeholder="Select section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['A','B','C','D','E','F','G','H','I','J'].map(letter => (
                                            <SelectItem key={letter} value={letter}>{letter}</SelectItem>
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
                                {modalMode === "add" ? "Add Student" : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                title="Delete Student"
                description={
                    studentToDelete
                        ? `Are you sure you want to delete the student ${studentToDelete.lastName}, ${studentToDelete.firstName}${studentToDelete.middleInitial ? ` ${studentToDelete.middleInitial}.` : ''} (ID: ${studentToDelete.studentId})? This action cannot be undone.`
                        : "Are you sure you want to delete this student? This action cannot be undone."
                }
                loading={isDeleting}
            />
        </>
    )
}

export default Student;