import { useEffect, useState, useMemo } from "react"
import { useAuth } from "../context/AuthProvider"
import DataTable from "../components/DataTable"
import ActionButton from '../components/ActionButton';
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, UserPlus } from "lucide-react"
import axios from "axios"

function Users() {
  // State hooks
  const { user, can } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState("add")
  const [editingUser, setEditingUser] = useState(null)
  const [data, setData] = useState([])
  const [students, setStudents] = useState([]);
  console.log(user)

  // Table columns definition
  const allColumns = [
    {
      key: "fullName",
      label: "Full Name",
      render: (_, row) => (
        <div className="font-medium">{`${row.lastName}, ${row.firstName} ${row.middleInitial || ""}.`}</div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (role) => {
        let badgeStyle = "bg-gray-100 text-gray-800"
        if (role === "Admin") badgeStyle = "bg-blue-100 text-blue-800"
        if (role === "Class Treasurer") badgeStyle = "bg-green-100 text-green-800"
        if (role === "Org Treasurer") badgeStyle = "bg-amber-100 text-amber-800"

        return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${badgeStyle}`}>{role}</span>
      },
    },
    { key: "email", label: "Email" },
    {
      key: "createdAt",
      label: "Created At",
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
      render: (_, row) => (
        <ActionButton 
          row={row} idField="userId" 
          onEdit={() => handleEdit(row)} 
          onDelete={() => handleDelete(row.userId)} 
        />
      ),
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
  const fetchUsers = () => {
    axios.get('http://localhost:8080/api/v1/users')
      .then(res => {
        if(Array.isArray(res.data)) {
          res.data = res.data.map(user => ({
            ...user,
            role: user.role.replace(/_/g, ' ')
          }))
        setData(res.data);
        }
      })
      .catch(err => {
        console.error("Error:", err);
      });
  }

  const fetchStudents = () => {
    axios.get('http://localhost:8080/api/v1/students')
      .then(res => {
        setStudents(res.data)
      })  
      .catch(err => console.log(err))
  };

  // Side effects (useEffect hooks)
  useEffect(() => {
    fetchUsers()
  }, [])

  // Modal state management functions
  const handleAdd = () => {
    fetchStudents()
    setModalMode("add")
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalMode("add")
    setEditingUser(null)
    setStudents([])
  }

  // Event handlers
  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const userData = Object.fromEntries(formData.entries())
    
    const url = modalMode === "edit"
      ? `http://localhost:8080/api/v1/users/${editingUser?.id}`
      : `http://localhost:8080/api/v1/users/${userData.studentId}`

    const method = modalMode === "edit" ? "put" : "post"

    axios({
      method,
      url,
      data: userData,
      headers: { "Content-Type": "application/json" },
    })
      .then(() => {
        fetchUsers()
        closeModal()
      })
      .catch((err) => {
        console.error(`Error ${modalMode === "edit" ? "updating" : "adding"} user:`, err)
      })
  }

  const handleEdit = (user) => {
    fetchStudents()
    setEditingUser({
      id: user.userId,
      lastName: user.lastName,
      firstName: user.firstName,
      middleInitial: user.middleInitial,
      email: user.email,
      role: user.role,
    })
    setModalMode("edit")
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:8080/api/v1/users/${id}`)
      .then(() => {
        fetchUsers()
      })
      .catch((err) => console.log(err))
  }
  
  // Component render
  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        title="user"
        showAdd={handleAdd}
        user={user}
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
                  Add User
                </div>
              ) : (
                <div className="flex items-center text-rose-600">
                  <Pencil className="w-5 h-5 mr-2 text-rose-600" />
                  Edit User
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "add" 
                ? "Fill in the details to create a new user account."
                : "Make changes to update the user account."
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="studentId">Student</Label>
                <Select
                  name="studentId"
                  value={editingUser?.studentId ? String(editingUser.studentId) : ""}
                  onValueChange={(value) => {
                    setEditingUser(prev => ({
                      ...prev || {}, 
                      studentId: value
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingUser?.email || ""}
                  placeholder="john.doe@example.com"
                  className="mt-1"
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue={editingUser?.role || ""} required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Administrator</SelectItem>
                    <SelectItem value="Class_Treasurer">Class Treasurer</SelectItem>
                    <SelectItem value="Org_Treasurer">Org Treasurer</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="password">Password</Label>
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
                {modalMode === "add" ? "Add User" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Users

