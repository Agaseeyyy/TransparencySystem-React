import { useEffect, useState } from 'react';
import Columns from "../components/Columns";
import ActionButton from "../components/ActionButton";
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import SelectField from '../components/SelectField';
import { useAuth } from '../context/AuthProvider';
import axios from 'axios';

function Users() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingUser, setEditingUser] = useState(null);
  const [data, setData] = useState([]);

  const columns = [
    { key: "full_name", label: "Full Name" },
    {
      key: "role",
      label: "Role",
      render: (role) => {
        let roleColor = "bg-gray-200 text-gray-800"; 
        if (role === "Admin") roleColor = "text-blue-800 bg-blue-100";
        if (role === "Class Treasurer") roleColor = "text-green-800 bg-green-100";
        if (role === "Org Treasurer") roleColor = "text-yellow-800 bg-yellow-100";

        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleColor}`}>
            {role}
          </span>
        );
      },
    },
    { key: "email", label: "Email" },
    { 
      key: "created_at", 
      label: "Created At",
      render: (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <ActionButton row={row} onEdit={() => handleEdit(row)} onDelete={() => handleDelete(row.id)} />
      ),
    },
  ];

  const fetchUsers = () => {
    axios.get('http://localhost:8080/api/v1/users')
      .then(res => {
        setData(res.data)
      })  
      .catch(err => console.log(err))
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());

    const url = modalMode === 'edit' 
      ? `http://localhost:8080/api/v1/users/${editingUser.id}`
      : "http://localhost:8080/api/v1/users";

    const method = modalMode === 'edit' ? 'put' : 'post';

    axios({
      method,
      url,
      data: userData,
      headers: { "Content-Type": "application/json" }
    })
    .then(() => {
      fetchUsers();
      closeModal();
    })
    .catch((err) => {
      console.error(`Error ${modalMode === 'edit' ? 'updating' : 'adding'} user:`, err);
    });
  };

  const handleEdit = (user) => {
    const [lastName, restOfName] = user.full_name.split(', ');
    const matches = restOfName.match(/(.*) ([A-Z]\.)/);
  
    if (matches) {
      const firstName = matches[1];  
      const middleInitial = matches[2].replace('.', '');  
      
      setEditingUser({
        id: user.id,
        lastName: lastName,
        firstName: firstName,
        middleInitial: middleInitial,
        email: user.email,
        role: user.role
      });
    }
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode('add');
    setEditingUser(null);
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:8080/api/v1/users/${id}`)
      .then(res => {
        fetchUsers();
      })
      .catch(err => console.log(err))
  }

  return (
    <>
      <Columns 
        columns={columns} 
        data={data}
        title={'user'}
        showAdd={() => {
          setModalMode('add');
          setIsModalOpen(true);
        }} 
        user={user}
      />
      
      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalMode === 'add' ? 'Add User' : 'Edit User'}>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 mb-4">
            <div className="col-span-2">
              <FormField
                label="Last Name"
                id="lastName"
                defaultValue={editingUser?.lastName || ''}
                placeholder="Doe"
                required
                index={0}
              />
            </div>
            <div className="col-span-1">
              <FormField
                label="First Name"
                id="firstName"
                defaultValue={editingUser?.firstName || ''}
                placeholder="John"
                required
                index={1}
              />
            </div>
            <div className="col-span-1">
              <FormField
                label="Middle Initial"
                id="middleInitial"
                defaultValue={editingUser?.middleInitial || ''}
                placeholder="C"
                maxLength={1}
                index={2}
              />
            </div>
            <div className="col-span-2">
              <FormField
                label="Email"
                id="email"
                type="email"
                defaultValue={editingUser?.email || ''}
                placeholder="john.doe@example.com"
                required
                index={3}
              />
            </div>
            <div className="col-span-2">
              <SelectField
                label="Role"
                id="role"
                defaultValue={editingUser?.role || ''}
                required
                index={4}
                options={[
                  { value: "", label: "Select role" },
                  { value: "Admin", label: "Administrator" },
                  { value: "editor", label: "Editor" },
                  { value: "viewer", label: "Viewer" }
                ]}
              />
            </div>
            <div className="col-span-2">
              <FormField
                label="Password"
                id="password"
                type="password"
                placeholder="••••••••"
                required
                index={5}
              />
            </div>
          </div>
          <button
            type="submit"
            className="text-white inline-flex items-center bg-jpcsred hover:bg-jpcsred focus:ring-4 focus:outline-none focus:ring-jpcsred font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-jpcsred dark:hover:bg-jpcsred dark:focus:ring-jpcsred transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            {modalMode === 'add' ? 'Add User' : 'Save Changes'}
          </button>
        </form>
      </Modal>
    </>
  );
}

export default Users;
