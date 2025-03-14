import { useState } from 'react';

const Columns = ({ columns, data, title, showAdd, user }) => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const totalRows = Object.keys(data).length;

  const changeRowsPerPage = (rows) => {
    setRowsPerPage(rows);
    setCurrentPage(1); // Reset to the first page when changing rows per page
  };

  const changePage = (direction) => {
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= Math.ceil(totalRows / rowsPerPage)) {
      setCurrentPage(newPage);
    }
  };

  const updatePagination = () => {
    const start = (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, totalRows);
    return `${start}-${end}`;
  };

  
  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="p-6 mx-auto bg-white rounded-lg shadow-lg max-w-[1920px]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Total: {/*dynamic count*/}</h1>
          {user?.role === 'Admin' || user?.role === 'ORG_TREASURER' ? (
             <button
              id="addUserButton"
              className="flex items-center px-4 py-2 text-white rounded-md bg-rose-700 hover:bg-rose-900"
              onClick={showAdd}
            >
             <svg
               xmlns="http://www.w3.org/2000/svg"
               className="w-5 h-5 mr-2"
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor"
             >
               <path
                 strokeLinecap="round"
                 strokeLinejoin="round"
                 strokeWidth="2"
                 d="M12 6v6m0 0v6m0-6h6m-6 0H6"
               />
             </svg>
             Add new {title}
           </button>
          ) : null}
        </div>

        {/* Table Container */}
        <div className="border border-gray-200 rounded-lg overflow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data && data.length > 0 ? (
                  data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {columns.map((column, colIndex) => (
                        <td
                          key={`${rowIndex}-${colIndex}`}
                          className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap"
                        >
                          {column.render ? column.render(row[column.key], row) : (row[column.key])}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-4 text-sm text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 rounded-b-lg sm:px-6">
            <div className="flex items-center">
              <p className="mr-4 text-sm text-gray-700">Rows per page:</p>
              <div className="relative">
                <button
                  id="rowsPerPageButton"
                  type="button"
                  className="inline-flex justify-between w-24 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                  onClick={() => document.getElementById('rowsPerPageMenu').classList.toggle('hidden')}
                >
                  <span>{rowsPerPage}</span>
                  <svg
                    className="w-5 h-5 ml-2 -mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <div
                  id="rowsPerPageMenu"
                  className="absolute z-10 hidden w-24 mt-1 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-gray-300 ring-opacity-5"
                >
                  <div className="py-1" role="menu">
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => changeRowsPerPage(10)}
                    >
                      10
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => changeRowsPerPage(25)}
                    >
                      25
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => changeRowsPerPage(50)}
                    >
                      50
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => changeRowsPerPage(100)}
                    >
                      100
                    </a>
                  </div>
                </div>
              </div>
              <p className="ml-4 text-sm text-gray-700">
                <span id="currentPageInfo">{updatePagination()}</span> of <span id="totalRows">{totalRows}</span>
              </p>
            </div>
            <div className="flex items-center">
              <button
                id="prevPageButton"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50"
                onClick={() => changePage(-1)}
              >
                Previous
              </button>
              <button
                id="nextPageButton"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50"
                onClick={() => changePage(1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Columns;