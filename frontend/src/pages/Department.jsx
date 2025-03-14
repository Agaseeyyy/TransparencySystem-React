import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import DataTable from '../components/DataTable';
import ActionButton from '../components/ActionButton';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BuildingIcon, Pencil } from "lucide-react";

const Department = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [data, setData] = useState([]);

  const columns = [
    { key: 'departmentId', label: 'Department ID' },
    { key: 'departmentName', label: 'Department Name' },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <ActionButton 
          row={row} idField="departmentId" 
          onEdit={() => handleEdit(row)} 
          onDelete={() => handleDelete(row.departmentId)} 
        />
      ),
    },
  ]

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode('add');
    setEditingDepartment(null);
  };

  const fetchDepartments = () => {
    axios.get('http://localhost:8080/api/v1/departments')
      .then(res => {
        setData(res.data)
      })  
      .catch(err => console.log(err))
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const saveFormData = Object.fromEntries(formData.entries());

    const url = modalMode === 'edit' 
      ? `http://localhost:8080/api/v1/departments/${editingDepartment.id}`
      : "http://localhost:8080/api/v1/departments";

    const method = modalMode === 'edit' ? 'put' : 'post';

    axios({
      method,
      url,
      data: saveFormData,
      headers: { "Content-Type": "application/json" }
    })
    .then(() => {
      fetchDepartments();
      closeModal();
    })
    .catch((err) => {
      console.error(`Error ${modalMode === 'edit' ? 'updating' : 'adding'} department:`, err);
    });
  };

  const handleEdit = (department) => {  
      setEditingDepartment({
        id: department.departmentId,
        departmentName: department.departmentName,
      });
      setModalMode('edit');
      setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:8080/api/v1/departments/${id}`)
      .then(res => {
        fetchDepartments();
      })
      .catch(err => console.log(err))
  }

  return (
    <>
      <DataTable 
        columns={columns} 
        data={data}
        title={'department'}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="departmentId">Department ID</Label>
                <Input
                  id="departmentId"
                  name="departmentId"
                  defaultValue={editingDepartment?.id || ""}
                  placeholder="e.g. CCS, CAS, etc"
                  className="mt-1"
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="departmentName">Department Name</Label>
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
    </>
  )
}

export default Department;