import { useState } from 'react'
import Columns from "../components/Columns";
import ActionButton from "../components/ActionButton";
import Modal from '../components/Modal';


function Users() {
  const columns = [
    { key: "name", label: "Full Name" },
    {
      key: "role",
      label: "Role",
      render: (role) => {
        let roleColor = "bg-gray-200 text-gray-800"; // Default style
        if (role === "Admin") roleColor = "text-blue-800 bg-blue-100";
        if (role === "User") roleColor = "text-green-800 bg-green-100";
        if (role === "Guest") roleColor = "text-yellow-800 bg-yellow-100";

        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleColor}`}>
            {role}
          </span>
        );
      },
    },
    { key: "email", label: "Email" },
    { key: "created", label: "Created At" },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => <ActionButton row={row} />, // Use the ActionButton component
    },
  ];

  const sampleData = [
    {
      id: 1,
      name: "Agassi Bustarga",
      role: "Admin",
      email: "agbustarga@my.cspc.edu.ph",
      created: "Feb 12, 2025",
      image: "https://randomuser.me/api/portraits/men/1.jpg", // Add image URL
    },
    {
      id: 2,
      name: "Ducay",
      role: "Treasurer",
      email: "agbustarga@my.cspc.edu.ph",
      created: "Feb 12, 2025",
    },
  ]

  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    console.log('User Form Data:', data);
    toggleModal();
  };
  

  return(
    <>
      <Columns 
        columns={columns} 
        data={sampleData} 
        title={'user'}
        showAdd={toggleModal} 
      />
      <Modal isOpen={isModalOpen} onClose={toggleModal} title="User">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 mb-4">
            <div className="col-span-2">
              <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-jpcsred focus:border-jpcsred block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-jpcsred dark:focus:border-jpcsred focus:outline-jpcsred"
                placeholder="John"
                required
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-jpcsred focus:border-jpcsred block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-jpcsred dark:focus:border-jpcsred focus:outline-jpcsred"
                placeholder="Doe"
                required
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
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-jpcsred focus:border-jpcsred block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-jpcsred dark:focus:border-jpcsred focus:outline-jpcsred"
                required
              >
                <option value="">Select role</option>
                <option value="admin">Administrator</option>
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
            Add New Users
          </button>
        </form>
      </Modal>
    </>
  );
}

export default Users