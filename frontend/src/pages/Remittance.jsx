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

  const columns = [
    { key: 'remittanceId', label: 'Remittance ID' },
    { key: 'paymentId', label: 'Payment ID' },
    { 
      key: 'userId', 
      label: 'Remitted By',
      render: (_, row) => (
        <span className="font-medium text-gray-900">
          {row.userName || row.userId}
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
  };

  const fetchRemittances = () => {
    axios.get('http://localhost:8080/api/v1/remittances')
      .then(res => {
        setRemittances(res.data);
      })  
      .catch(err => console.log(err));
  };

  const fetchPayments = () => {
    axios.get('http://localhost:8080/api/v1/payments')
      .then(res => {
        setPayments(res.data);
      })  
      .catch(err => console.log(err));
  };

  const fetchUsers = () => {
    axios.get('http://localhost:8080/api/v1/users')
      .then(res => {
        setUsers(res.data);
      })  
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchRemittances();
  }, []);

  useEffect(() => {
    fetchPayments();
    fetchUsers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const saveFormData = Object.fromEntries(formData.entries());
    
    // Based on your RemittanceService backend
    const url = modalMode === 'edit' 
      ? `http://localhost:8080/api/v1/remittances/${editingRemittance.id}/payments/${saveFormData.paymentId}/users/${saveFormData.userId}`
      : `http://localhost:8080/api/v1/remittances/payments/${saveFormData.paymentId}/users/${saveFormData.userId}`;

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
                <Label htmlFor="paymentId">Payment</Label>
                <Select
                  name="paymentId"
                  value={editingRemittance?.paymentId ? String(editingRemittance.paymentId) : ""}
                  onValueChange={(value) => {
                    setEditingRemittance(prev => ({
                      ...prev || {}, 
                      paymentId: value
                    }));
                  }}
                  required
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select payment" />
                  </SelectTrigger>
                  <SelectContent>
                    {payments.map(payment => (
                      <SelectItem key={payment.paymentId} value={String(payment.paymentId)}>
                        {payment.paymentId} - {payment.firstName} {payment.lastName} ({payment.amount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="userId">Remitted By</Label>
                <Select 
                  name="userId" 
                  value={editingRemittance?.userId ? String(editingRemittance.userId) : ""}
                  onValueChange={(value) => {
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
                        {user.username} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-1">
                <Label htmlFor="amountRemitted">Amount</Label>
                <div className="relative">
                  <span className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2">₱</span>
                  <Input
                    id="amountRemitted"
                    name="amountRemitted"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingRemittance?.amountRemitted || ""}
                    className="mt-1 pl-7"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div className="col-span-1">
                <Label htmlFor="remittanceDate">Remittance Date</Label>
                <Input
                  id="remittanceDate"
                  name="remittanceDate"
                  type="date"
                  defaultValue={editingRemittance?.remittanceDate || new Date().toISOString().split('T')[0]}
                  className="mt-1"
                  required
                />
              </div>
              
              <div className="w-full col-span-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  name="status" 
                  value={editingRemittance?.status || ""}
                  onValueChange={(value) => {
                    setEditingRemittance(prev => ({
                      ...prev || {}, 
                      status: value
                    }));
                  }}
                  required
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2 mt-6">
              <Button type="button" className="cursor-pointer" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer bg-rose-600 hover:bg-rose-600/90">
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