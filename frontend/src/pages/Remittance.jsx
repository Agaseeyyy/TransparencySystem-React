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
import { Pencil, Banknote } from "lucide-react";
// Remove date-fns import

const Remittance = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingRemittance, setEditingRemittance] = useState(null);
  const [remittances, setRemittances] = useState([]);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [fees, setFees] = useState([]);
  const [totalRemittance, setTotalRemittance] = useState(0);
  const [selectedFeeType, setSelectedFeeType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // State for sorting and filtering
  const [sortBy, setSortBy] = useState('remittanceDate');
  const [sortDir, setSortDir] = useState('desc');
  const [filters, setFilters] = useState({
    feeType: 'all',
    status: 'all',
    date: 'all'
  });
  const [filterOptions, setFilterOptions] = useState({
    feeType: [],
    status: ['Paid', 'Pending', ''],
    date: [] // Will be populated with unique dates from remittances
  });

  // Helper function for formatting dates without date-fns
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    
    const options = { month: 'short', day: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Helper function for formatting dates in YYYY-MM-DD format
  const formatDateYYYYMMDD = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const columns = [
    { key: 'remittanceId', label: 'Remittance ID', sortable: true },
    { 
      key: 'feeType', 
      label: 'Fee Type',
      sortable: true,
      render: (_, row) => row.feeType || '-'
    },
    {
      key: 'user',
      label: 'Remitted By',
      sortable: true,
      sortKey: 'user.lastName',
      render: (_, row) => {
        const user = row.lastName;
        if (!user) return '-';
        return (
          <span className="font-medium text-gray-900">
            {`${row.lastName}, ${row.firstName} ${row.middleInitial ? row.middleInitial + '.' : ""}`}
          </span>
        );
      }
    },
    { 
      key: 'amountRemitted', 
      label: 'Amount', 
      sortable: true,
      render: (amount) => `₱${parseFloat(amount).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (status) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          status === 'Completed' ? 'bg-green-100 text-green-700' : 
          status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
          'bg-red-100 text-red-700'
        }`}>
          {status}
        </span>
      )
    },
    { 
      key: 'remittanceDate', 
      label: 'Date', 
      sortable: true,
      render: (date) => formatDate(date)
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_, row) => (
        <ActionButton
          row={row} 
          idField="remittanceId"
          onEdit={() => handleEdit(row)}
          onDelete={() => handleDelete(row.remittanceId)}
        />
      ),
    },
  ];

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode('add');
    setEditingRemittance(null);
    setSelectedFeeType(null);
    setSelectedUser(null);
    setTotalRemittance(0);
  };

  // Fetch data with sorting and filtering
  const fetchTableData = () => {
    setLoading(true);
    axios.get('http://localhost:8080/api/v1/remittances/table', {
      params: {
        sortBy,
        sortDir,
        feeType: filters.feeType,
        status: filters.status,
        date: filters.date
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => {
      if (res.data.success) {
        setRemittances(res.data.data);
        
        // Extract unique dates for the date filter
        if (res.data.data && res.data.data.length > 0) {
          const uniqueDates = [...new Set(res.data.data
            .filter(item => item.remittanceDate)
            .map(item => formatDateYYYYMMDD(item.remittanceDate)))]
            .sort().reverse(); // Sort in descending order (newest first)
          
          setFilterOptions(prev => ({
            ...prev,
            date: uniqueDates
          }));
        }
      } else {
        console.error("Failed to load remittances:", res.data.message);
      }
    })
    .catch(err => {
      console.error("Error loading remittances:", err);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  const fetchFees = () => {
    axios.get('http://localhost:8080/api/v1/fees')
      .then(res => {
        setFees(res.data);
        
        // Setup fee filter options
        setFilterOptions(prev => ({
          ...prev,
          feeType: res.data.map(fee => ({ 
            id: fee.feeId,  // Use feeName as the filter value
            name: fee.feeType 
          }))
        }));
      })
      .catch(err => console.log(err));
  };

  const fetchUsers = () => {
    axios.get('http://localhost:8080/api/v1/users')
      .then(res => {
        if (Array.isArray(res.data)) {
          res.data = res.data.map(user => ({
            ...user,
            role: user.role?.replace(/_/g, ' ')
          }));
          setUsers(res.data);
        }
      })
      .catch(err => {
        console.error("Error:", err);
      });
  };

  // Handle sorting changes
  const handleSort = (field, direction) => {
    setSortBy(field);
    setSortDir(direction);
  };

  // Handle filtering changes
  const handleFilter = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  useEffect(() => {
    fetchFees();
    fetchUsers();
    // Initial fetch with default sorting
    fetchTableData();
  }, []);

  useEffect(() => {
    // Refetch when sort or filter changes
    fetchTableData();
  }, [sortBy, sortDir, filters]);

  useEffect(() => {
    if (!selectedFeeType || !selectedUser) {
      setTotalRemittance(0);
      return;
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    };

    axios.get(
      `http://localhost:8080/api/v1/payments/students/${selectedUser.programCode}/${selectedUser.yearLevel}/${selectedUser.section}/fees/${selectedFeeType}`,
      config
    )
      .then(response => {
        const total = response.data.reduce((sum, payment) => {
          return sum + (Number(payment.amount) || 0);
        }, 0);
        setTotalRemittance(total);
      })
      .catch(error => {
        console.error('Error calculating total:', error);
        setTotalRemittance(0);
      });
  }, [selectedFeeType, selectedUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const saveFormData = {
      feeType: formData.get('feeType'),
      userId: formData.get('userId'),
      amountRemitted: totalRemittance // Use calculated total instead of input
    };

    const url = modalMode === 'edit'
      ? `http://localhost:8080/api/v1/remittances/${editingRemittance.id}/fees/${saveFormData.feeType}/users/${saveFormData.userId}`
      : `http://localhost:8080/api/v1/remittances/fees/${saveFormData.feeType}/users/${saveFormData.userId}`;

    const method = modalMode === 'edit' ? 'put' : 'post';

    axios({
      method,
      url,
      data: saveFormData,
      headers: { "Content-Type": "application/json" }
    })
      .then(() => {
        fetchTableData(); // Use the table data fetch method
        closeModal();
      })
      .catch((err) => {
        console.error(`Error ${modalMode === 'edit' ? 'updating' : 'adding'} remittance:`, err);
      });
  };

  const handleEdit = (remittance) => {
    setEditingRemittance({
      id: remittance.remittanceId,
      feeType: remittance.fee?.feeType,
      userId: remittance.user?.userId,
      amountRemitted: remittance.amountRemitted,
      status: remittance.status,
      remittanceDate: remittance.remittanceDate,
    });
    
    // Set the selected fee type and user
    setSelectedFeeType(remittance.fee?.feeType);
    setSelectedUser(remittance.user);
    
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this remittance?")) {
      axios.delete(`http://localhost:8080/api/v1/remittances/${id}`)
        .then(() => {
          fetchTableData(); // Use the table data fetch method
        })
        .catch(err => console.log(err.message));
    }
  };

  const handleAdd = () => {
    setModalMode('add');
    setIsModalOpen(true);
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={remittances}
        title={'remittance'}
        showAdd={handleAdd}
        user={user}
        loading={loading}
        onSort={handleSort}
        onFilter={handleFilter}
        sortBy={sortBy}
        sortDir={sortDir}
        filters={filters}
        filterOptions={filterOptions}
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
                  <Banknote className="w-5 h-5 mr-2 text-rose-600" />
                  Add Remittance
                </div>
              ) : (
                <div className="flex items-center text-rose-600">
                  <Pencil className="w-5 h-5 mr-2 text-rose-600" />
                  Edit Remittance
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "add"
                ? "Fill in the details to record a new remittance."
                : "Make changes to update the remittance record."
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="feeType">Fee Type</Label>
                <Select
                  name="feeType"
                  value={selectedFeeType || ''}
                  onValueChange={(value) => {
                    setSelectedFeeType(value);
                    setEditingRemittance(prev => ({
                      ...prev || {},
                      feeType: value
                    }));
                  }}
                  required
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select fee type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fees.map(fee => (
                      <SelectItem key={fee.feeId} value={String(fee.feeId)}>
                        {fee.feeName} - ₱{fee.amount} ({fee.description || 'No description'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="userId">Remitted By</Label>
                <Select
                  name="userId"
                  value={selectedUser?.userId ? String(selectedUser.userId) : ''}
                  onValueChange={(value) => {
                    const user = users.find(u => String(u.userId) === String(value));
                    setSelectedUser(user);
                    setEditingRemittance(prev => ({
                      ...prev || {},
                      userId: value
                    }));
                  }}
                  required
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.userId} value={String(user.userId)}>
                        {user.lastName} {user.firstName} {user.middleInitial ? user.middleInitial + '.' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-4 mt-4 rounded-lg bg-gray-50">
              <Label>Total Amount to be Remitted</Label>
              <div className="text-xl font-bold text-rose-600">
                ₱{totalRemittance.toLocaleString('en-PH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2 mt-6">
              <Button type="button" className="cursor-pointer" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="cursor-pointer bg-rose-600 hover:bg-rose-600/90"
                disabled={!selectedFeeType || !selectedUser || totalRemittance <= 0}
              >
                {modalMode === "add" ? "Record Remittance" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Remittance;