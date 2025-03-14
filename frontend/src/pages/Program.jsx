import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import Columns from '../components/DataTable';
import FormField from '../components/FormField';
import SelectField from '../components/SelectField';
import ActionButton from '../components/ActionButton';
import Modal from '../components/Modal';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FolderPlus, Pencil } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const Program = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingProgram, setEditingProgram] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);

  const columns = [
    { key: 'programId', label: 'Program ID' },
    { key: 'programName', label: 'Program Name' },
    { key: 'departmentId', label: 'Department' },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <ActionButton 
          row={row} idField="programId" 
          onEdit={() => handleEdit(row)} 
          onDelete={() => handleDelete(row.programId)} 
        />
      ),
    },
  ]

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode('add');
    setEditingProgram(null);
  };

  const fetchPrograms = () => {
    axios.get('http://localhost:8080/api/v1/programs')
      .then(res => {
        setPrograms(res.data)
      })  
      .catch(err => console.log(err))
  };

  const fetchDepartments = () => {
    axios.get('http://localhost:8080/api/v1/departments')
      .then(res => {
        setDepartments(res.data)
      })  
      .catch(err => console.log(err))
  };

  useEffect(() => {
    fetchPrograms();
    fetchDepartments();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const saveFormData = Object.fromEntries(formData.entries());


    const url = modalMode === 'edit' 
      ? `http://localhost:8080/api/v1/programs/${editingProgram.programId}/departments/${saveFormData.departmentId}`
      : `http://localhost:8080/api/v1/programs/departments/${saveFormData.departmentId}`;

    const method = modalMode === 'edit' ? 'put' : 'post';

    axios({
      method,
      url,
      data: saveFormData,
      headers: { "Content-Type": "application/json" }
    })
    .then(() => {
      fetchPrograms();
      closeModal();
    })
    .catch((err) => {
      console.error(`Error ${modalMode === 'edit' ? 'updating' : 'adding'} user:`, err);
    });
  };

  const handleEdit = (program) => {  
      setEditingProgram({
        departmentId: program.departmentId,
        programId: program.programId,
        programName: program.programName,
      });
      setModalMode('edit');
      setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:8080/api/v1/programs/${id}`)
      .then(res => {
        fetchPrograms();
      })
      .catch(err => console.log(err.me))
  }


  return (
    <>
      <Columns 
      columns={columns} 
      data={programs}
      title={'program'}
      showAdd={() => {
        setModalMode('add');
        setIsModalOpen(true);
      }} 
      user={user}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="programId">Program ID</Label>
                <Input
                  id="programId"
                  name="programId"
                  defaultValue={editingProgram?.programId || ""}
                  placeholder="e.g. BSIT, BSCS, etc"
                  className="mt-1"
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="programName">Program Name</Label>
                <Input
                  id="programName"
                  name="programName"
                  defaultValue={editingProgram?.programName || ""}
                  placeholder="e.g. BS Information Technology"
                  className="mt-1"
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="departmentId">Department</Label>
                <Select name="departmentId" defaultValue={editingProgram?.departmentId || ""} required>
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
    </>
  )
}

export default Program