import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import Columns from '../components/DataTable';
import ActionButton from '../components/ActionButton';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Pencil, CreditCard } from "lucide-react";

const Fees = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingFees, setEditingFees] = useState(null);
  const [fees, setFees] = useState([]);

  const columns = [
    { key: 'feeId', label: 'Fee ID' },
    { key: 'feeType', label: 'Type' },
    { key: 'amount', label: 'Amount' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'createdAt', label: 'Created' },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <ActionButton 
          row={row} idField="feeId" 
          onEdit={() => handleEdit(row)} 
          onDelete={() => handleDelete(row.feeId)} 
        />
      ),
    },
  ]

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode('add');
    setEditingFees(null);
  };

  const fetchFees = () => {
    axios.get('http://localhost:8080/api/v1/fees')
      .then(res => {
        setFees(res.data)
      })  
      .catch(err => console.log(err))
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const saveFormData = Object.fromEntries(formData.entries());

    const url = modalMode === 'edit' 
      ? `http://localhost:8080/api/v1/fees/${editingFees.id}`
      : "http://localhost:8080/api/v1/fees";

    const method = modalMode === 'edit' ? 'put' : 'post';

    axios({
      method,
      url,
      data: saveFormData,
      headers: { "Content-Type": "application/json" }
    })
    .then(() => {
      fetchFees();
      closeModal();
    })
    .catch((err) => {
      console.error(`Error ${modalMode === 'edit' ? 'updating' : 'adding'} fee:`, err);
    });
  };

  const handleEdit = (fee) => {  
      setEditingFees({
        id: fee.feeId,
        feeType: fee.feeType,
        amount: fee.amount,
        dueDate: fee.dueDate,
        createdAt: fee.createdAt,
      });
      setModalMode('edit');
      setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:8080/api/v1/fees/${id}`)
      .then(res => {
        fetchFees();
      })
      .catch(err => console.log(err))
  }

  return (
    <>
      <Columns 
        columns={columns} 
        data={fees}
        title={'fee'}
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
                  Add Fee
                </div>
              ) : (
                <div className="flex items-center text-rose-600">
                  <Pencil className="w-5 h-5 mr-2 text-rose-600" />
                  Edit Fee
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "add" 
                ? "Fill in the details to create a new fee."
                : "Make changes to update the fee."
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="feeType">Fee Type</Label>
                <Input
                  id="feeType"
                  name="feeType"
                  defaultValue={editingFees?.feeType || ""}
                  placeholder="e.g. Tuition Fee, Library Fee, etc."
                  className="mt-1"
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2">₱</span>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingFees?.amount || ""}
                    placeholder="0.00"
                    className="mt-1 pl-7"
                    required
                  />
                </div>
              </div>
              <div className="col-span-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  defaultValue={editingFees?.dueDate || ""}
                  className="mt-1"
                  required
                />
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2 mt-6">
              <Button type="button" className="cursor-pointer" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer bg-rose-600 hover:bg-rose-600/90">
                {modalMode === "add" ? "Add Fee" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Fees;