import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import Columns from '../components/Columns';
import FormField from '../components/FormField';
import SelectField from '../components/SelectField';
import ActionButton from '../components/ActionButton';
import Modal from '../components/Modal';
import axios from 'axios';

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
      console.log(saveFormData)
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
      <Columns 
      columns={columns} 
      data={students}
      title={'student'}
      showAdd={() => {
        setModalMode('add');
        setIsModalOpen(true);
      }} 
      user={user}
      />

      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalMode === 'add' ? 'Add Student' : 'Edit Student'}>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Student ID Field */}
            <div className="col-span-2">
              <FormField
                label="Student ID"
                id="studentId"
                defaultValue={editingStudent?.studentId || ''}
                placeholder="231000000"
                required
                index={0}
              />
            </div>

            {/* Name Fields */}
            <div className="col-span-2 md:col-span-1">
              <FormField
                label="Last Name"
                id="lastName"
                defaultValue={editingStudent?.lastName || ''}
                placeholder="Dela Cruz"
                required
                index={1}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <FormField
                label="First Name"
                id="firstName"
                defaultValue={editingStudent?.firstName || ''}
                placeholder="Juan"
                required
                index={2}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <FormField
                label="Middle Initial"
                id="middleInitial"
                defaultValue={editingStudent?.middleInitial || ''}
                placeholder="D"
                maxLength={1}
                index={3}
              />
            </div>

            {/* Email Field */}
            <div className="col-span-2">
              <FormField
                label="Email"
                id="email"
                type="email"
                defaultValue={editingStudent?.email || ''}
                placeholder="juan.delacruz@my.cspc.edu.ph"
                required
                index={4}
              />
            </div>

            {/* Program Selection */}
            <div className="col-span-2">
              <SelectField
                label="Program"
                id="programId"
                defaultValue={editingStudent?.program || ''}
                required
                index={5}
                options={[
                  { value: "", label: "Select program" },
                  ...programs.map(prog => ({
                    value: prog.programId,
                    label: prog.programName
                  }))
                ]}
              />
            </div>

            {/* Year Level Selection */}
            <div className="col-span-1">
              <SelectField
                label="Year Level"
                id="yearLevel"
                defaultValue={editingStudent?.yearLevel || ''}
                required
                index={6}
                options={[
                  { value: "", label: "Select year" },
                  { value: "1", label: "1st Year" },
                  { value: "2", label: "2nd Year" },
                  { value: "3", label: "3rd Year" },
                  { value: "4", label: "4th Year" }
                ]}
              />
            </div>

            {/* Section Selection */}
            <div className="col-span-1">
              <SelectField
                label="Section"
                id="section"
                defaultValue={editingStudent?.section || ''}
                required
                index={7}
                options={[
                  { value: "", label: "Select section" },
                  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => ({
                    value: letter,
                    label: `Section ${letter}`
                  }))
                ]}
              />
            </div>

            {/* Status Selection */}
            <div className="col-span-2">
              <SelectField
                label="Status"
                id="status"
                defaultValue={editingStudent?.status || ''}
                required
                index={8}
                options={[
                  { value: "", label: "Select status" },
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" },
                  { value: "Graduated", label: "Graduated" }
                ]}
              />
            </div>
          </div>

          <button
            type="submit"
            className="text-white inline-flex items-center bg-jpcsred hover:bg-jpcsred focus:ring-4 focus:outline-none focus:ring-jpcsred font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-jpcsred dark:hover:bg-jpcsred dark:focus:ring-jpcsred transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            {modalMode === 'add' ? 'Add Student' : 'Save Changes'}
          </button>
        </form>
      </Modal>
    </>
  )
}

export default Student