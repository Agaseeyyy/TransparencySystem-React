import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import DataTable from '../components/DataTable';
import ActionButton from '../components/ActionButton';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Pencil } from "lucide-react";

const Student = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingStudent, setEditingStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);

  const columns = [
    { key: "studentId", label: 'Student ID' },
    { 
      key: 'fullName', label: 'Full Name',
      render: (_, row) => (
        <span className="font-medium text-gray-900">
          {`${row.lastName}, ${row.firstName} ${row.middleInitial || ''}.`}
        </span>
      )
    },
    { key: "email", label: 'Email' },
    { key: 'program', label: 'Program' },
    { 
      key: "yearSec", label: 'Year and Section',
      render: (_, row)=> (
        <span>
          {`${row.yearLevel} - ${row.section}`}
        </span>
      )
    },
    { key: "status", label: 'Status' },
    { key: 'department', label: 'Department' },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => {
        return (
          <ActionButton 
            row={row} idField="studentId" 
            onEdit={() => handleEdit(row)} 
            onDelete={() => handleDelete(row.studentId)} 
          />
        );
      }
    },
  ]

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode('add');
    setEditingStudent(null);
  };

  const fetchStudents = () => {
    axios.get('http://localhost:8080/api/v1/students')
      .then(res => {
        setStudents(res.data)
      })  
      .catch(err => console.log(err))
  };

  const fetchPrograms = () => {
    axios.get('http://localhost:8080/api/v1/programs')
      .then(res => {
        setPrograms(res.data)
      })  
      .catch(err => console.log(err))
  };

  useEffect(() => {
    fetchStudents();
    fetchPrograms();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const saveFormData = Object.fromEntries(formData.entries());

    const url = modalMode === 'edit' 
      ? `http://localhost:8080/api/v1/students/${editingStudent.studentId}/programs/${saveFormData.programId}`
      : `http://localhost:8080/api/v1/students/programs/${saveFormData.programId}`;

    const method = modalMode === 'edit' ? 'put' : 'post';

    axios({
      method,
      url,
      data: saveFormData,
      headers: { "Content-Type": "application/json" }
    })
    .then(() => {
      fetchStudents();
      closeModal();
    })
    .catch((err) => {
      console.error(`Error ${modalMode === 'edit' ? 'updating' : 'adding'} user:`, err);
    });
  };

  const handleEdit = (student) => {  
      setEditingStudent({
        studentId: student.studentId,
        lastName: student.lastName,
        firstName: student.firstName,
        middleInitial: student.middleInitial,
        email: student.email,
        program: student.program,
        yearLevel: student.yearLevel,
        section: student.section,
        status: student.status
      });
      setModalMode('edit');
      setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:8080/api/v1/students/${id}`)
      .then(() => {
        fetchStudents();
      })
      .catch(err => console.log(err.message))
  }

  return (
    <>
      <DataTable 
      columns={columns} 
      data={students}
      title={'student'}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  name="studentId"
                  defaultValue={editingStudent?.studentId || ''}
                  placeholder="231000000"
                  className="mt-1"
                  required
                />
              </div>

              <div className="col-span-1">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={editingStudent?.lastName || ''}
                  placeholder="Dela Cruz"
                  className="mt-1"
                  required
                />
              </div>
              
              <div className="col-span-1">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={editingStudent?.firstName || ''}
                  placeholder="Juan"
                  className="mt-1"
                  required
                />
              </div>

              <div className="col-span-1">
                <Label htmlFor="middleInitial">Middle Initial</Label>
                <Input
                  id="middleInitial"
                  name="middleInitial"
                  defaultValue={editingStudent?.middleInitial || ''}
                  placeholder="D"
                  className="mt-1"
                  maxLength={1}
                />
              </div>
              
              <div className="col-span-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingStudent?.email || ''}
                  placeholder="juan.delacruz@student.edu.ph"
                  className="mt-1"
                  required
                />
              </div>

              <div className="w-full col-span-1">
                <Label htmlFor="programId">Program</Label>
                <Select 
                  name="programId" 
                  defaultValue={editingStudent?.program || ''}
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
                <Label htmlFor="status">Status</Label>
                <Select 
                  name="status" 
                  defaultValue={editingStudent?.status || ''}
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
                <Label htmlFor="yearLevel">Year Level</Label>
                <Select 
                  name="yearLevel" 
                  defaultValue={editingStudent?.yearLevel || ''}
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
                <Label htmlFor="section">Section</Label>
                <Select 
                  name="section" 
                  defaultValue={editingStudent?.section || ''}
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
    </>
  )
}

export default Student;