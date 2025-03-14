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

import { Pencil, CreditCard } from "lucide-react";

const Payments = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingPayments, setEditingPayments] = useState(null);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);


  const columns = [
    { key: 'paymentId', label: 'Payment ID' },
    { 
      key: 'fullName', label: 'Full Name',
      render: (_, row) => (
        <span className="font-medium text-gray-900">
          {`${row.lastName}, ${row.firstName} ${row.middleInitial || ''}.`}
        </span>
      )
    },
    { key: 'program', label: 'Program' },
    { 
      key: "yearSec", label: 'Year and Section',
      render: (_, row)=> (
        <span>
          {`${row.yearLevel} - ${row.section}`}
        </span>
      )
    },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'paymentDate', label: 'Date' },
    { 
      key: 'remarks', 
      label: 'Remarks',
      render: (_, row) => (
        <div className="max-w-xs truncate" title={row.remarks || ""}>
          {row.remarks || "-"}
        </div>
      ) 
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <ActionButton 
          row={row} idField="paymentId" 
          onEdit={() => handleEdit(row)} 
          onDelete={() => handleDelete(row.paymentId)} 
        />
      ),
    },
  ]

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode('add');
    setEditingPayments(null);
  };

  const openModal = () => { setIsModalOpen(true) };

  const fetchPayments = () => {
    axios.get('http://localhost:8080/api/v1/payments')
      .then(res => {
        setPayments(res.data)
      })  
      .catch(err => console.log(err))
  };

  const fetchStudents = () => {
    axios.get('http://localhost:8080/api/v1/students')
      .then(res => {
        setStudents(res.data)
      })  
      .catch(err => console.log(err))
  };

  const fetchFees = () => {
    axios.get('http://localhost:8080/api/v1/fees')
      .then(res => {
        setFees(res.data)
      })  
      .catch(err => console.log(err))
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchFees();
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const saveFormData = Object.fromEntries(formData.entries());
    console.log(saveFormData);

    const url = modalMode === 'edit' 
      ? `http://localhost:8080/api/v1/payments/${editingPayments.id}/fees/${saveFormData.feeType}/students/${saveFormData.studentId}`
      : `http://localhost:8080/api/v1/payments/fees/${saveFormData.feeType}/students/${saveFormData.studentId}`;

    const method = modalMode === 'edit' ? 'put' : 'post';

    axios({
      method,
      url,
      data: saveFormData,
      headers: { "Content-Type": "application/json" }
    })
    .then(() => {
      fetchPayments();
      closeModal();
    })
    .catch((err) => {
      console.error(`Error ${modalMode === 'edit' ? 'updating' : 'adding'} payment:`, err);
    });
  };

  const handleEdit = (payment) => {  
      setEditingPayments({
        id: payment.paymentId,
        studentId: payment.studentId,
        feeType: payment.feeId,  // Changed from paymentType to feeId to match form field name
        paymentDate: payment.paymentDate, // Changed from dueDate to paymentDate
        status: payment.status,
        remarks: payment.remarks || "", // Added remarks field
        createdAt: payment.createdAt,
      });
      setModalMode('edit');
      setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:8080/api/v1/payments/${id}`)
      .then(res => {
        fetchPayments();
      })
      .catch(err => console.log(err))
  }

  return (
    <>
      <DataTable 
        columns={columns} 
        data={payments}
        title={'payments'}
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
                  <CreditCard className="w-5 h-5 mr-2 text-rose-600" />
                  Add Payment
                </div>
              ) : (
                <div className="flex items-center text-rose-600">
                  <Pencil className="w-5 h-5 mr-2 text-rose-600" />
                  Edit Payment
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "add" 
                ? "Fill in the details to record a new payment."
                : "Make changes to update the payment record."
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="studentId">Students</Label>
                <Select
                  name="studentId"
                  value={editingPayments?.studentId ? String(editingPayments.studentId) : ""}
                  onValueChange={(value) => {
                    setEditingPayments(prev => ({
                      ...prev || {}, 
                      studentId: value
                    }));
                  }}
                  required
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.studentId} value={String(student.studentId)}>
                        {student.lastName}, {student.firstName} {student.middleInitial || ''}.  ({student.studentId})               
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full col-span-1">
                <Label htmlFor="feeType">Payment Type</Label>
                <Select 
                  name="feeType" 
                  value={editingPayments?.feeType ? String(editingPayments.feeType) : ""}
                  onValueChange={(value) => {
                    setEditingPayments(prev => ({
                      ...prev || {}, // Use empty object if prev is null
                      feeType: value
                    }));
                  }}
                  required
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fees.map(fee => (
                      <SelectItem key={fee.feeId} value={String(fee.feeId)}>
                        {fee.feeType} ({fee.amount})       
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-1">
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  name="paymentDate"
                  type="date"
                  defaultValue={editingPayments?.paymentDate || new Date().toISOString().split('T')[0]}
                  className="mt-1"
                  required
                />
              </div>
              
              <div className="w-full col-span-1">
                <Label htmlFor="status">Status</Label>
                <Select 
                  name="status" 
                  defaultValue={editingPayments?.status || ''}
                  required
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Input
                  id="remarks"
                  name="remarks"
                  defaultValue={editingPayments?.remarks || ""}
                  placeholder="Additional notes about the payment"
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2 mt-6">
              <Button type="button" className="cursor-pointer" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer bg-rose-600 hover:bg-rose-600/90">
                {modalMode === "add" ? "Record Payment" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Payments;