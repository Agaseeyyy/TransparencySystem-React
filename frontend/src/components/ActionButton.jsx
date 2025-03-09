

const ActionButton = ({ row, onEdit, onDelete }) => {
  return (
    <button
      className="relative text-gray-400 hover:text-gray-500"
      onClick={() => {
        // Toggle the actions menu
        const actionMenu = document.getElementById(`actionMenu-${row.id}`);
        actionMenu.classList.toggle("hidden");
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
      </svg>
      <div
        id={`actionMenu-${row.id}`}
        className="absolute right-0 z-30 hidden w-48 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-gray-200 ring-opacity-5 focus:outline-none"
        role="menu"
      >
        <div className="py-1">
          <a
            href="#"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={onEdit}
          >
            <svg
              className="w-5 h-5 mr-3 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
              <path
                fillRule="evenodd"
                d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                clipRule="evenodd"
              />
            </svg>
            Edit
          </a>
        </div>
        <div className="py-1">
          <a
            href="#"
            className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
            onClick={onDelete}
          >
            <svg
              className="w-5 h-5 mr-3 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Delete
          </a>
        </div>
      </div>
    </button>
  );
};

export default ActionButton;