import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import Columns from '../components/Columns';
import FormField from '../components/FormField';
import ActionButton from '../components/ActionButton';
import Modal from '../components/Modal';
import axios from 'axios';

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
      console.error(`Error ${modalMode === 'edit' ? 'updating' : 'adding'} user:`, err);
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
      <Columns 
      columns={columns} 
      data={data}
      title={'department'}
      showAdd={() => {
        setModalMode('add');
        setIsModalOpen(true);
      }} 
      user={user}
      />

      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalMode === 'add' ? 'Add Department' : 'Edit Department'}>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 mb-4">
            <div className="col-span-2">
              <FormField
                label="Department ID"
                id="departmentId"
                defaultValue={editingDepartment?.id || ''}
                placeholder="e.g. CCS, CAS, etc"
                required
                index={0}
              />
            </div>
            <div className="col-span-2">
              <FormField
                label="Department Name"
                id="departmentName"
                defaultValue={editingDepartment?.departmentName || ''}
                placeholder="e.g. College of Computer Studies"
                required
                index={1}
              />
            </div>
            
          </div>
          <button
            type="submit"
            className="text-white inline-flex items-center bg-jpcsred hover:bg-jpcsred focus:ring-4 focus:outline-none focus:ring-jpcsred font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-jpcsred dark:hover:bg-jpcsred dark:focus:ring-jpcsred transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            {modalMode === 'add' ? 'Add Department' : 'Save Changes'}
          </button>
        </form>
      </Modal>
    </>
  )
}

export default Department;