import { useEffect, useState, useMemo } from "react"
import { useAuth } from "../context/AuthProvider"
import DataTable from "../components/DataTable"
import ActionButton from '../components/ActionButton';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, UserPlus, AlertCircle, CheckCircle } from "lucide-react"
import { accountService, studentService } from "../utils/apiService"

function Account() {
    // State hooks
    const { user, can } = useAuth()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState("add")
    const [editingAccount, setEditingAccount] = useState(null)
    const [data, setData] = useState([])
    const [students, setStudents] = useState([]);

    // Error, Success, and Dialog states
    const [formError, setFormError] = useState('');
    const [pageError, setPageError] = useState('');
    const [pageSuccess, setPageSuccess] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter state
    const [filters, setFilters] = useState({
        role: 'all',
        student: 'all'
    });
    
    // Filter options
    const [filterOptions, setFilterOptions] = useState({
        role: ["Admin", "Class_Treasurer", "Org_Treasurer"]
    });
    
    // Pagination and sorting state
    const [currentPage, setCurrentPage] = useState(0); // Backend uses 0-based indexing
    const [pageSize, setPageSize] = useState(10);
    const [sortField, setSortField] = useState('student.lastName');
    const [sortDirection, setSortDirection] = useState('asc');
    const [loading, setLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    // Table columns definition
    const allColumns = [
        {
            key: "fullName",
            label: "Full Name",
            sortable: true,
            sortKey: "student.lastName",
            render: (_, row) => {
                if (!row.lastName || !row.firstName) {
                    return <div className="font-medium text-gray-500">-</div>;
                }
                return (
                    <div className="font-medium">{`${row.lastName}, ${row.firstName} ${row.middleInitial || ""}.`}</div>
                );
            },
        },
        {
            key: "role",
            label: "Role",
            sortable: true,
            render: (role) => {
                let badgeStyle = "bg-gray-100 text-gray-800"
                if (role === "Admin") badgeStyle = "bg-blue-100 text-blue-800"
                if (role === "Class Treasurer") badgeStyle = "bg-green-100 text-green-800"
                if (role === "Org Treasurer") badgeStyle = "bg-amber-100 text-amber-800"

                return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${badgeStyle}`}>{role}</span>
            },
        },
        { key: "email", label: "Email", sortable: true },
        {
            key: "createdAt",
            label: "Created At",
            sortable: true,
            render: (date) => {
                const d = new Date(date)
                return d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                })
            },
        },
        {
            key: "actions",
            label: "Actions",
            adminOnly: true,
            render: (_, row) => {
                if (row.email === "admin@admin.com") {
                    return (
                        <span className="text-sm italic text-gray-500">
                            Cannot delete this account
                        </span>
                    );
                }
                return (
                    <ActionButton 
                        row={row} idField="accountId" 
                        onEdit={() => handleEdit(row)} 
                        onDelete={() => handleDeleteRequest(row)}
                    />
                );
            },
        },
    ]

    // Filter columns based on user permissions
    const columns = useMemo(() => {
        return allColumns.filter(column => {
            // If column is marked adminOnly, only show it for admin users
            if (column.adminOnly) {
                return can.manageSystem();
            }
            // Otherwise show the column
            return true;
        });
    }, [can]);

    // Data fetching functions
    const fetchAccounts = async () => {
        setLoading(true);
        
        try {
            const response = await accountService.getAccounts(
                currentPage,
                pageSize,
                sortField,
                sortDirection,
                filters.role !== 'all' ? filters.role : ''
            );
            
            if (response && response.content) {
                const accounts = response.content.map(account => ({
                    ...account,
                    role: account.role.replace(/_/g, ' ')
                }));
                setData(accounts);
                setTotalElements(response.totalElements || 0);
            }
        } catch (error) {
            console.error("Error fetching accounts:", error);
        } finally {
            setLoading(false);
        }
    }

    const fetchStudents = async () => {
        try {
            const studentsData = await studentService.getStudentsWithoutAccounts();
            
            if (modalMode === "edit" && editingAccount) {
                setStudents([editingAccount, ...studentsData]);
            } else {
                setStudents(studentsData);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
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
        if (field === 'fullName') {
            setSortField('student.lastName');
        } else {
            setSortField(field);
        }
        setSortDirection(direction);
        setPageError('');
        setPageSuccess('');
    };

    // Modal state management functions
    const handleAdd = () => {
        fetchStudents();
        setModalMode("add");
        setEditingAccount(null);
        setFormError('');
        setPageError('');
        setPageSuccess('');
        setIsModalOpen(true);
    }

     const handleEdit = (account) => {
        setModalMode("edit");        
        setEditingAccount({
            accountId: account.accountId,
            studentId: account.student?.studentId?.toString() || account.studentId?.toString(),
            lastName: account.lastName,
            firstName: account.firstName,
            middleInitial: account.middleInitial,
            email: account.email,
            role: account.role?.replace(/\s/g, '_'),
        });
        fetchStudents(account.student?.studentId || account.studentId); 
        setFormError('');
        setPageError('');
        setPageSuccess('');
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setModalMode("add");
        setEditingAccount(null);
        setStudents([]);
        setFormError('');
    }

    // Fetch students, optionally ensuring a specific student is included (for edit mode)
    const fetchStudentsWithOptionalCurrent = async (currentStudentId = null) => {
        try {
            const studentsData = await studentService.getStudentsWithoutAccounts();
            let finalStudentsList = studentsData;

            if (currentStudentId && modalMode === 'edit') {
                const isCurrentStudentInList = studentsData.some(s => String(s.studentId) === String(currentStudentId));
                if (!isCurrentStudentInList) {
                    if (editingAccount && String(editingAccount.studentId) === String(currentStudentId)){
                         finalStudentsList = [
                            { studentId: editingAccount.studentId, firstName: editingAccount.firstName, lastName: editingAccount.lastName, middleInitial: editingAccount.middleInitial }, 
                            ...studentsData
                        ];
                    }
                }
            }
            setStudents(finalStudentsList);
        } catch (error) {
            console.error("Error fetching students:", error);
            setStudents([]);
        }
    };

    // Replaced original fetchStudents with this one to handle edit mode correctly
    useEffect(() => {
        if (isModalOpen) {
            fetchStudentsWithOptionalCurrent(editingAccount?.studentId);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalOpen, modalMode, editingAccount?.studentId]); 

    // Event handlers
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setPageError('');
        setPageSuccess('');
        const formData = new FormData(e.currentTarget);
        const accountData = Object.fromEntries(formData.entries());

        // For add mode, ensure the email from editingAccount state is included
        if (modalMode === 'add' && editingAccount?.email) {
            accountData.email = editingAccount.email;
        }

        if (!accountData.email || !accountData.role || (modalMode === 'add' && !accountData.password)) {
            setFormError("Email, Role, and Password (for new accounts) are required.");
            return;
        }
        if (modalMode === 'add' && !accountData.studentId) {
            setFormError("Student selection is required for new accounts.");
            return;
        }
        
        try {
            let successMessage = '';
            const selectedStudent = students.find(s => String(s.studentId) === String(accountData.studentId));
            const studentFullName = selectedStudent 
                ? `${selectedStudent.lastName}, ${selectedStudent.firstName}${selectedStudent.middleInitial ? ` ${selectedStudent.middleInitial}.` : ''}` 
                : (editingAccount && modalMode === 'edit' ? `${editingAccount.lastName}, ${editingAccount.firstName}${editingAccount.middleInitial ? ` ${editingAccount.middleInitial}.` : ''}` : 'Selected Student');

            if (modalMode === "edit") {
                await accountService.updateAccount(editingAccount?.accountId, accountData);
                successMessage = `Account for ${studentFullName} updated successfully.`;
            } else {
                await accountService.addAccount(accountData.studentId, accountData);
                successMessage = `Account for ${studentFullName} created successfully.`;
            }
            
            fetchAccounts();
            closeModal();
            setPageSuccess(successMessage);
        } catch (error) {
            console.error(`Error ${modalMode === "edit" ? "updating" : "adding"} account:`, error);
            let errorMessage = `Failed to ${modalMode === 'edit' ? 'update' : 'add'} account.`;
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
                if (errorMessage.toLowerCase().includes("already has an account")) {
                } else if (errorMessage.toLowerCase().includes("email already exists") || errorMessage.toLowerCase().includes("account with email")) {
                    errorMessage = `An account with email '${accountData.email}' already exists.`;
                } else if (errorMessage.toLowerCase().includes("student with id") && errorMessage.toLowerCase().includes("not found")) {
                    errorMessage = `The selected student (ID: ${accountData.studentId}) could not be found.`;
                }
            } else {
                errorMessage = "An unexpected error occurred. Please try again.";
            }
            setFormError(errorMessage);
        }
    }

    // Delete Flow
    const handleDeleteRequest = (account) => {
        setAccountToDelete(account);
        setDeleteDialogOpen(true);
        setPageError('');
        setPageSuccess('');
    };

    const confirmDelete = async () => {
        if (!accountToDelete) return;
        setIsDeleting(true);
        setPageError('');
        setPageSuccess('');

        const accountName = accountToDelete.student 
            ? `${accountToDelete.student.lastName}, ${accountToDelete.student.firstName}${accountToDelete.student.middleInitial ? ` ${accountToDelete.student.middleInitial}.` : ''}` 
            : accountToDelete.email;

        try {
            await accountService.deleteAccount(accountToDelete.accountId);
            fetchAccounts();
            setPageSuccess(`Account for ${accountName} (ID: ${accountToDelete.accountId}) deleted successfully.`);
        } catch (error) {
            console.error("Error deleting account:", error);
            let errorMessage = `Failed to delete account for ${accountName} (ID: ${accountToDelete.accountId}).`;
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
                 if (errorMessage.toLowerCase().includes("primary admin account cannot be deleted")) {
                }
            } else {
                errorMessage = "An unexpected error occurred while deleting.";
            }
            setPageError(errorMessage);
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setAccountToDelete(null);
        }
    };

    // Side effects
    useEffect(() => {
        fetchAccounts();
    }, [currentPage, pageSize, sortField, sortDirection, filters]);
    
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
                data={data}
                title="account"
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
        
            <Dialog open={isModalOpen} onOpenChange={(open) => {
                if (!open) closeModal();
            }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {modalMode === "add" ? (
                                <div className="flex items-center text-rose-600">
                                    <UserPlus className="w-5 h-5 mr-2 text-rose-600" />
                                    Add Account
                                </div>
                            ) : (
                                <div className="flex items-center text-rose-600">
                                    <Pencil className="w-5 h-5 mr-2 text-rose-600" />
                                    Edit Account
                                </div>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {modalMode === "add" 
                                ? "Fill in the details to create a new student account."
                                : "Make changes to update the student account."
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
                                <Label htmlFor="studentId">Student <span className="text-rose-600">*</span></Label>
                                <Select
                                    name="studentId"
                                    value={editingAccount?.studentId ? String(editingAccount.studentId) : undefined}
                                    onValueChange={(value) => {
                                        const selectedStudent = students.find(s => String(s.studentId) === String(value));
                                        setEditingAccount(prev => ({
                                            ...prev || {}, 
                                            studentId: value,
                                            // Auto-populate email with the selected student's email for new accounts
                                            email: modalMode === 'add' && selectedStudent ? selectedStudent.email : (prev?.email || '')
                                        }));
                                    }}
                                    required
                                >
                                    <SelectTrigger className="w-full mt-1">
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
                            <div className="col-span-2">
                                <Label htmlFor="email">Email <span className="text-rose-600">*</span></Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={editingAccount?.email || ''}
                                    onChange={(e) => {
                                        // Allow manual editing in edit mode
                                        if (modalMode === 'edit') {
                                            setEditingAccount(prev => ({
                                                ...prev || {},
                                                email: e.target.value
                                            }));
                                        }
                                    }}
                                    placeholder={modalMode === 'add' ? "Select a student to auto-populate email" : "student@my.cspc.edu.ph"}
                                    className="mt-1"
                                    readOnly
                                    required
                                />
                                {modalMode === 'add' && (
                                    <p className="mt-1 text-xs text-muted-foreground">Email will be auto-populated from the selected student's record</p>
                                )}
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="role">Role <span className="text-rose-600">*</span></Label>
                                <Select name="role" defaultValue={editingAccount?.role || undefined} required>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Admin">Administrator</SelectItem>
                                        <SelectItem value="Class_Treasurer">Class Treasurer</SelectItem>
                                        <SelectItem value="Org_Treasurer">Org Treasurer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="password">Password <span className="text-rose-600">*</span></Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="mt-1"
                                    required={modalMode === "add"}
                                />
                                {modalMode === "edit" && (
                                    <p className="mt-1 text-xs text-muted-foreground">Leave blank to keep current password</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter className="flex justify-end gap-2 mt-6">
                            <Button type="button" className="cursor-pointer" variant="outline" onClick={closeModal}>
                                Cancel
                            </Button>
                            <Button type="submit" className="cursor-pointer bg-rose-600 hover:bg-rose-600/90">
                                {modalMode === "add" ? "Add Account" : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                title="Delete Account"
                description={
                    accountToDelete
                        ? `Are you sure you want to delete the account for ${accountToDelete.student ? `${accountToDelete.student.lastName}, ${accountToDelete.student.firstName}${accountToDelete.student.middleInitial ? ` ${accountToDelete.student.middleInitial}.` : ''}` : accountToDelete.email} (Account ID: ${accountToDelete.accountId})? This action cannot be undone.`
                        : "Are you sure you want to delete this account? This action cannot be undone."
                }
                loading={isDeleting}
            />
        </>
    )
}

export default Account

