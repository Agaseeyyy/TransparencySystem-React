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

  const columns = [
    { key: 'remittanceId', label: 'Remittance ID' },
    { key: 'feeType', label: 'Fee Type' },
    {
      key: 'userId',
      label: 'Remitted By',
      render: (_, row) => (
        <span className="font-medium text-gray-900">
          {`${row.lastName}, ${row.firstName} ${row.middleInitial + '.' || ""}`}
        </span>
      )
    },
    { key: 'amountRemitted', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'remittanceDate', label: 'Date' },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <ActionButton
          row={row} idField="remittanceId"
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

  const fetchRemittances = () => {
    axios.get('http://localhost:8080/api/v1/remittances')
      .then(res => {
        setRemittances(res.data);
      })
      .catch(err => console.log(err));
  };

  const fetchUsers = () => {
    axios.get('http://localhost:8080/api/v1/users')
      .then(res => {
        if (Array.isArray(res.data)) {
          res.data = res.data.map(user => ({
            ...user,
            role: user.role.replace(/_/g, ' ')
          }))
          setUsers(res.data);
        }
      })
      .catch(err => {
        console.error("Error:", err);
      });
  }

  const fetchFees = () => {
    axios.get('http://localhost:8080/api/v1/fees')
      .then(res => {
        setFees(res.data);
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchRemittances();
  }, []);

  useEffect(() => {
    fetchFees();
    fetchUsers();
  }, []);

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
        fetchRemittances();
        closeModal();
      })
      .catch((err) => {
        console.error(`Error ${modalMode === 'edit' ? 'updating' : 'adding'} remittance:`, err);
      });
  };

  const handleEdit = (remittance) => {
    setEditingRemittance({
      id: remittance.remittanceId,
      paymentId: remittance.paymentId,
      userId: remittance.userId,
      amountRemitted: remittance.amountRemitted,
      status: remittance.status,
      remittanceDate: remittance.remittanceDate,
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:8080/api/v1/remittances/${id}`)
      .then(res => {
        fetchRemittances();
      })
      .catch(err => console.log(err));
  };



  return (
    <>
      <DataTable
        columns={columns}
        data={remittances}
        title={'remittance'}
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
                        {fee.feeType} - ₱{fee.amount} ({fee.description || 'No description'})
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
                        {user.lastName} {user.firstName} {user.middleInitial + '.' || ''}
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