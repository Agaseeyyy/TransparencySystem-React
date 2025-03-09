import { useEffect, useState } from 'react'
import Columns from "../components/Columns";
import ActionButton from "../components/ActionButton";
import Modal from '../components/Modal';
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
  }
  , []);

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
              <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                defaultValue={editingUser?.lastName || ''}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-jpcsred focus:border-jpcsred block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-jpcsred dark:focus:border-jpcsred focus:outline-jpcsred"
                placeholder="Doe"
                required
              />
            </div>
            <div className="col-span-1">
              <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                defaultValue={editingUser?.firstName || ''}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-jpcsred focus:border-jpcsred block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-jpcsred dark:focus:border-jpcsred focus:outline-jpcsred"
                placeholder="John"
                required
              />
            </div>
            <div className="col-span-1">
              <label htmlFor="middleInitial" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Middle Initial
              </label>
              <input
                type="text"
                name="middleInitial"
                id="middleInitial"
                defaultValue={editingUser?.middleInitial || ''}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-jpcsred focus:border-jpcsred block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-jpcsred dark:focus:border-jpcsred focus:outline-jpcsred"
                placeholder="C"
                maxLength={1}
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                defaultValue={editingUser?.email || ''}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-jpcsred focus:border-jpcsred block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-jpcsred dark:focus:border-jpcsred focus:outline-jpcsred"
                placeholder="john.doe@example.com"
                required
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Role
              </label>
              <select
                id="role"
                name="role"
                defaultValue={editingUser?.role || ''}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-jpcsred focus:border-jpcsred block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-jpcsred dark:focus:border-jpcsred focus:outline-jpcsred"
                required
              >
                <option value="">Select role</option>
                <option value="Admin">Administrator</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div className="col-span-2">
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-jpcsred focus:border-jpcsred block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-jpcsred dark:focus:border-jpcsred focus:outline-jpcsred"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="text-white inline-flex items-center bg-jpcsred hover:bg-jpcsred focus:ring-4 focus:outline-none focus:ring-jpcsred font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-jpcsred dark:hover:bg-jpcsred dark:focus:ring-jpcsred"
          >
            {modalMode === 'add' ? 'Add User' : 'Save Changes'}
          </button>
        </form>
      </Modal>
    </>
  );
}

export default Users