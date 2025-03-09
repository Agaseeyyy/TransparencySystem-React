import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import Columns from '../components/Columns';
import FormField from '../components/FormField';
import SelectField from '../components/SelectField';
import ActionButton from '../components/ActionButton';
import Modal from '../components/Modal';
import axios from 'axios';

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
        <ActionButton row={row} onEdit={() => handleEdit(row)} onDelete={() => handleDelete(row.programId)} />
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

    console.log(saveFormData)

    const url = modalMode === 'edit' 
      ? `http://localhost:8080/api/v1/programs/${editingDepartment.id}`
      : "http://localhost:8080/api/v1/programs";

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

  const handleEdit = (department) => {  
      setEditingProgram({
        id: department.departmentId,
        departmentName: department.departmentName,
      });
      setModalMode('edit');
      setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:8080/api/v1/departments/${id}`)
      .then(res => {
        fetchPrograms();
      })
      .catch(err => console.log(err))
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalMode === 'add' ? 'Add Program' : 'Edit Program'}>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 mb-4">
            <div className="col-span-2">
              <FormField
                label="Program ID"
                id="programId"
                defaultValue={editingProgram?.id || ''}
                placeholder="e.g. BSIT, BSCS, etc"
                required
                index={0}
              />
            </div>
            <div className="col-span-2">
              <FormField
                label="Program Name"
                id="programName"
                defaultValue={editingProgram?.programName || ''}
                placeholder="e.g. BS Information Technology"
                required
                index={1}
              />
            </div>
            <div className="col-span-2">
              <SelectField
                label="Department"
                id="departmentId"
                defaultValue={editingProgram?.departmentId || ''}
                required
                index={2}
                options={[
                  { value: "", label: "Select department" },
                  ...departments.map(dept => ({
                    value: dept.departmentId,
                    label: dept.departmentName
                  }))
                ]}
              />
            </div>
          </div>
          <button
            type="submit"
            className="text-white inline-flex items-center bg-jpcsred hover:bg-jpcsred focus:ring-4 focus:outline-none focus:ring-jpcsred font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-jpcsred dark:hover:bg-jpcsred dark:focus:ring-jpcsred transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            {modalMode === 'add' ? 'Add Program' : 'Save Changes'}
          </button>
        </form>
      </Modal>
    </>
  )
}

export default Program