import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Separator } from "../components/ui/separator";
import { formatCurrency, formatDate } from "../utils/formatUtils";
import { fileUtils } from "../utils/apiService";
import { useAuth } from "../context/AuthProvider";
import { 
  ChevronDown, ChevronUp, Receipt, FileText, Banknote, Calendar, Building,
  AlertCircle, CheckCircle, Ban, Clock, Users, Info, ExternalLink, Repeat,
  DollarSign, Filter, ArrowDownUp, FileBarChart, CalendarDays, CreditCard,
  MoreVertical, Edit, Trash2, EyeIcon, TagsIcon
} from 'lucide-react';
import { useState } from 'react';

const ExpenseCard = ({ expense, openForm, handleDelete, className = "", expandedCardId, setExpandedCardId }) => {
  const { can } = useAuth();
  
  // Check if this card is the currently expanded one
  const expanded = expandedCardId === expense.expenseId;

  // Log current card's ID and its expanded state whenever it renders
  console.log(`ExpenseCard Rendered: ID = ${expense?.expenseId}, Expanded = ${expanded}`);

  // Status badge styling
  const getStatusStyles = (status, type = 'expense') => {
    if (type === 'expense') {
      switch (status) {
        case 'PAID': return 'bg-green-100 text-green-700 border-green-200';
        case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'CANCELLED': return 'bg-gray-100 text-gray-700 border-gray-200';
        case 'REFUNDED': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'DISPUTED': return 'bg-rose-100 text-rose-700 border-rose-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
      }
    } else {
      switch (status) {
        case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200';
        case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'REJECTED': return 'bg-rose-100 text-rose-700 border-rose-200';
        case 'REQUIRES_REVIEW': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
      }
    }
  };

  // Format display labels
  const formatLabel = (text) => {
    return text ? text.replace(/_/g, ' ') : '-';
  };

  return (
    <Card className={`h-full flex flex-col overflow-hidden hover:shadow-lg hover:border-rose-200 transition-all duration-300 border-l-4 border-l-rose-500 ${className}`}>
      <CardHeader className="p-6 pb-4 bg-gradient-to-r from-rose-50/60 to-transparent">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <Badge className="mb-1 text-xs font-medium tracking-wide bg-rose-100 border-rose-300 text-rose-700 hover:bg-rose-200" variant="outline">{expense.expenseReference}</Badge>
            {expense.isRecurring && (
              <Badge variant="outline" className="flex items-center text-xs font-medium bg-rose-50 border-rose-200 text-rose-700">
                <Repeat size={12} className="flex-shrink-0 mr-1.5" /> 
                <span>{formatLabel(expense.recurringFrequency) || 'Recurring'}</span>
              </Badge>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-semibold leading-tight tracking-tight text-gray-800 break-words line-clamp-2">{expense.expenseTitle}</CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-2 mt-3 text-sm">
              <div className="flex items-center gap-1.5 bg-gray-50/80 py-1 px-2 rounded-md">
                <Building size={16} className="flex-shrink-0 text-rose-500" /> 
                <span className="font-medium truncate">{expense.departmentName || 'No Department'}</span>
              </div>
            </CardDescription>
          </div>
          <div className="flex flex-row items-center justify-between gap-2 mt-1">
            <div className="text-2xl font-bold truncate text-rose-600">{formatCurrency(expense.amount)}</div>
            <div className="flex-shrink-0 px-2 py-1 text-sm font-medium text-gray-600 rounded-md bg-gray-50/80">{formatDate(expense.expenseDate)}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-5 pt-3">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge 
            variant="secondary" 
            className={`${getStatusStyles(expense.expenseStatus)} text-sm px-3 py-1`}
          >
            <span>{formatLabel(expense.expenseStatus)}</span>
          </Badge>
          <Badge 
            variant="secondary" 
            className={`${getStatusStyles(expense.approvalStatus, 'approval')} text-sm px-3 py-1`}
          >
            <span>{formatLabel(expense.approvalStatus)}</span>
          </Badge>
          <Badge variant="outline" className="flex items-center px-3 py-1 text-sm bg-rose-50 border-rose-200 text-rose-700">
            <TagsIcon size={12} className="flex-shrink-0 mr-2" />
            <span>{formatLabel(expense.expenseCategory)}</span>
          </Badge>
          {fileUtils.hasFile(expense.documentationPath) && (
            <Badge variant="outline" className="flex items-center px-3 py-1 text-sm text-blue-700 border-blue-200 bg-blue-50">
              <FileText size={12} className="flex-shrink-0 mr-2" />
              <span>Has Documentation</span>
            </Badge>
          )}
        </div>

        {/* Basic info in grid for wider layout */}
        <div className="grid grid-cols-2 mt-4 text-sm gap-x-6 gap-y-3">
          <div className="flex items-center">
            <div className="flex items-center gap-2 min-w-32">
              <Calendar size={16} className="flex-shrink-0 text-rose-500" />
              <span className="font-medium text-gray-700">Payment Date:</span>
            </div>
            <div className="ml-3">{formatDate(expense.paymentDate) || 'Not paid'}</div>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center gap-2 min-w-32">
              <CreditCard size={16} className="flex-shrink-0 text-rose-500" />
              <span className="font-medium text-gray-700">Method:</span>
            </div>
            <div className="ml-3">{formatLabel(expense.paymentMethod) || 'Not specified'}</div>
          </div>
          
          <div className="flex items-center col-span-2">
            <div className="flex items-center gap-2 min-w-32">
              <Receipt size={16} className="flex-shrink-0 text-rose-500" />
              <span className="font-medium text-gray-700">Vendor:</span>
            </div>
            <div className="ml-3 truncate" title={expense.vendorSupplier || 'Not specified'}>
              {expense.vendorSupplier || 'Not specified'}
            </div>
          </div>
        </div>

        {/* Expandable section */}
        {expanded && (
          <div className="pt-4 mt-5 space-y-4 border-t border-rose-100">
            {expense.expenseDescription && (
              <div>
                <div className="mb-2 text-sm font-medium text-gray-700">Description</div>
                <div className="p-4 text-sm border rounded-md bg-rose-50/30 border-rose-100">{expense.expenseDescription}</div>
              </div>
            )}
            
            <div className="grid grid-cols-1 text-sm md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              <div>
                <div className="mb-1 font-medium text-gray-700">Receipt/Invoice</div>
                <div className="text-gray-800">{expense.receiptInvoiceNumber || '-'}</div>
              </div>
              
              <div>
                <div className="mb-1 font-medium text-gray-700">Budget Allocation</div>
                <div className="text-gray-800">{expense.budgetAllocation || '-'}</div>
              </div>
              
              <div>
                <div className="mb-1 font-medium text-gray-700">Documentation</div>
                <div className="text-gray-800">
                  {fileUtils.hasFile(expense.documentationPath) ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-600">
                        📎 {fileUtils.getFileName(expense.documentationPath)}
                      </span>
                      <div className="flex gap-2">
                        <a 
                          href={fileUtils.getFileViewUrl(expense.documentationPath)}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 underline hover:text-blue-800"
                        >
                          View
                        </a>
                        <a 
                          href={fileUtils.getFileDownloadUrl(expense.documentationPath)}
                          download
                          className="text-xs text-green-600 underline hover:text-green-800"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">No file attached</span>
                  )}
                </div>
              </div>
              
              <div>
                <div className="mb-1 font-medium text-gray-700">Academic Details</div>
                <div className="text-gray-800">{[
                  expense.academicYear, 
                  expense.semester ? `${expense.semester} Semester` : null
                ].filter(Boolean).join(', ') || '-'}</div>
              </div>
              
              {expense.taxAmount && (
                <div>
                  <div className="mb-1 font-medium text-gray-700">Tax Amount</div>
                  <div className="text-gray-800">{formatCurrency(expense.taxAmount)} ({expense.isTaxInclusive ? 'Inclusive' : 'Exclusive'})</div>
                </div>
              )}
              
              {expense.relatedFeeType && (
                <div>
                  <div className="mb-1 font-medium text-gray-700">Related Fee</div>
                  <div className="text-gray-800">{expense.relatedFeeType}</div>
                </div>
              )}
              
              <div>
                <div className="mb-1 font-medium text-gray-700">Created</div>
                <div className="text-gray-800">{formatDate(expense.createdAt)}</div>
              </div>
              
              {expense.updatedAt && (
                <div>
                  <div className="mb-1 font-medium text-gray-700">Last Updated</div>
                  <div className="text-gray-800">{formatDate(expense.updatedAt)}</div>
                </div>
              )}
            </div>
            
            {expense.remarks && (
              <div>
                <div className="mb-2 text-sm font-medium text-gray-700">Remarks</div>
                <div className="p-4 text-sm border rounded-md bg-rose-50/30 border-rose-100">{expense.remarks}</div>
              </div>
            )}
            
            {expense.approvalRemarks && (
              <div>
                <div className="mb-2 text-sm font-medium text-gray-700">Approval Remarks</div>
                <div className="p-4 text-sm border rounded-md bg-rose-50/30 border-rose-100">{expense.approvalRemarks}</div>
              </div>
            )}
          </div>
        )}

        <Button 
          variant="ghost"
          size="sm"
          className="w-full py-2 mt-4 text-sm font-medium text-rose-500 hover:text-rose-700 hover:bg-rose-50"
          onClick={() => {
            console.log(`Button Clicked: ID = ${expense?.expenseId}, Current Expanded = ${expanded}, Toggling to = ${!expanded}`);
            // Toggle: if this card is expanded, collapse it; if not expanded, expand it
            setExpandedCardId(expanded ? null : expense.expenseId);
          }}
        >
          {expanded ? (
            <>
              <ChevronUp size={20} className="mr-2" /> Show Less Details
            </>
          ) : (
            <>
              <ChevronDown size={20} className="mr-2" /> Show Full Details
            </>
          )}
        </Button>
      </CardContent>
      
      <CardFooter className="p-5 pt-0 border-t border-rose-100 bg-rose-50/20">
        {/* Responsive button layout with desktop and mobile version */}
        {/* Mobile buttons (stacked) */}
        <div className="flex flex-col w-full gap-3 md:hidden">
          <div className="flex w-full gap-3">
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
              onClick={() => openForm('edit', expense)}
            >
              <Edit className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span>Edit</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
              onClick={() => handleDelete(expense.expenseId)}
            >
              <Trash2 className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span>Delete</span>
            </Button>
          </div>
          
          {(expense.approvalStatus !== 'APPROVED' || expense.approvalStatus !== 'REJECTED') && can.manageTransaction() && (
            <div className="flex w-full gap-3">
              {expense.approvalStatus !== 'APPROVED' && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex-1 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
                  onClick={() => openForm('approve', expense)}
                  disabled={expense.approvalStatus === 'APPROVED'}
                >
                  <CheckCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  <span>Approve</span>
                </Button>
              )}
              
              {expense.approvalStatus !== 'REJECTED' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                  onClick={() => openForm('reject', expense)}
                  disabled={expense.approvalStatus === 'REJECTED'}
                >
                  <Ban className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  <span>Reject</span>
                </Button>
              )}
            </div>
          )}

          {expense.approvalStatus === 'APPROVED' && expense.expenseStatus !== 'PAID' && can.manageTransaction() && (
            <Button 
              variant="outline"
              size="sm"
              className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
              onClick={() => openForm('pay', expense)}
            >
              <CreditCard className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span>Mark as Paid</span>
            </Button>
          )}
        </div>

        {/* Desktop buttons (side by side) */}
        <div className="justify-between hidden w-full md:flex">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm"
              className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
              onClick={() => openForm('edit', expense)}
            >
              <Edit className="flex-shrink-0 w-4 h-4 mr-2" />
              <span>Edit</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
              onClick={() => handleDelete(expense.expenseId)}
            >
              <Trash2 className="flex-shrink-0 w-4 h-4 mr-2" />
              <span>Delete</span>
            </Button>
          </div>
          
          <div className="flex gap-3">
            {can.manageTransaction() && expense.approvalStatus !== 'APPROVED' && (
              <Button 
                variant="outline"
                size="sm"
                className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
                onClick={() => openForm('approve', expense)}
                disabled={expense.approvalStatus === 'APPROVED'}
              >
                <CheckCircle className="flex-shrink-0 w-4 h-4 mr-2" />
                <span>Approve</span>
              </Button>
            )}
            
            {can.manageTransaction() && expense.approvalStatus !== 'REJECTED' && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                onClick={() => openForm('reject', expense)}
                disabled={expense.approvalStatus === 'REJECTED'}
              >
                <Ban className="flex-shrink-0 w-4 h-4 mr-2" />
                <span>Reject</span>
              </Button>
            )}

            {can.manageTransaction() && expense.approvalStatus === 'APPROVED' && expense.expenseStatus !== 'PAID' && (
              <Button 
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => openForm('pay', expense)}
              >
                <CreditCard className="flex-shrink-0 w-4 h-4 mr-2" />
                <span>Mark as Paid</span>
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

const ExpensesSummary = ({ expenses }) => {
  // Calculate total expenses
  const totalAmount = expenses.reduce((total, expense) => {
    return total + (parseFloat(expense.amount) || 0);
  }, 0);

  // Get expenses by approval status
  const pendingExpenses = expenses.filter(expense => expense.approvalStatus === 'PENDING');
  const approvedExpenses = expenses.filter(expense => expense.approvalStatus === 'APPROVED');
  const rejectedExpenses = expenses.filter(expense => expense.approvalStatus === 'REJECTED');

  // Calculate amounts by status
  const pendingAmount = pendingExpenses.reduce((total, expense) => total + (parseFloat(expense.amount) || 0), 0);
  const approvedAmount = approvedExpenses.reduce((total, expense) => total + (parseFloat(expense.amount) || 0), 0);

  // Count by category
  const categoryCounts = expenses.reduce((acc, expense) => {
    const category = expense.expenseCategory || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  // Get top 3 categories
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, count]) => ({ category, count }));

  // Recent expenses (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.expenseDate);
    return expenseDate >= thirtyDaysAgo;
  });
  const recentAmount = recentExpenses.reduce((total, expense) => total + (parseFloat(expense.amount) || 0), 0);

  return (
    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="transition-all duration-300 bg-white border-l-4 border-l-rose-500 hover:shadow-lg">
        <CardHeader className="pb-2 bg-gradient-to-r from-rose-50/50 to-transparent">
          <CardTitle className="flex items-center text-sm font-medium">
            <DollarSign className="w-4 h-4 mr-2 text-rose-600" />
            Total Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-600">{formatCurrency(totalAmount)}</div>
          <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
            <FileText className="w-3 h-3 text-rose-500" /> {expenses.length} records
          </div>
        </CardContent>
      </Card>
      
      <Card className="transition-all duration-300 bg-white border-l-4 border-l-rose-400 hover:shadow-lg">
        <CardHeader className="pb-2 bg-gradient-to-r from-rose-50/30 to-transparent">
          <CardTitle className="flex items-center text-sm font-medium">
            <Clock className="w-4 h-4 mr-2 text-rose-500" />
            Pending Approval
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-500">{formatCurrency(pendingAmount)}</div>
          <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
            <AlertCircle className="w-3 h-3 text-rose-400" /> {pendingExpenses.length} pending records
          </div>
        </CardContent>
      </Card>
      
      <Card className="transition-all duration-300 bg-white border-l-4 border-l-green-500 hover:shadow-lg">
        <CardHeader className="pb-2 bg-gradient-to-r from-green-50/30 to-transparent">
          <CardTitle className="flex items-center text-sm font-medium">
            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
            Approved Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(approvedAmount)}</div>
          <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
            <CheckCircle className="w-3 h-3 text-green-500" /> {approvedExpenses.length} approved records
          </div>
        </CardContent>
      </Card>
      
      <Card className="transition-all duration-300 bg-white border-l-4 border-l-rose-300 hover:shadow-lg">
        <CardHeader className="pb-2 bg-gradient-to-r from-rose-50/20 to-transparent">
          <CardTitle className="flex items-center text-sm font-medium">
            <CalendarDays className="w-4 h-4 mr-2 text-rose-500" />
            Recent (30 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-500">{formatCurrency(recentAmount)}</div>
          <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
            <Calendar className="w-3 h-3 text-rose-400" /> {recentExpenses.length} recent records
          </div>
        </CardContent>
      </Card>
      
      <Card className="transition-all duration-300 bg-white border-l-4 lg:col-span-2 border-l-rose-400 hover:shadow-lg">
        <CardHeader className="pb-2 bg-gradient-to-r from-rose-50/30 to-transparent">
          <CardTitle className="flex items-center text-sm font-medium">
            <TagsIcon className="w-4 h-4 mr-2 text-rose-600" />
            Top Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topCategories.length > 0 ? (
              topCategories.map(({ category, count }) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{category.replace(/_/g, ' ')}</span>
                  </div>
                  <Badge variant="outline" className="bg-rose-50 border-rose-200 text-rose-700">{count}</Badge>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No categories found</div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="transition-all duration-300 bg-white border-l-4 lg:col-span-2 border-l-rose-300 hover:shadow-lg">
        <CardHeader className="pb-2 bg-gradient-to-r from-rose-50/20 to-transparent">
          <CardTitle className="flex items-center text-sm font-medium">
            <FileBarChart className="w-4 h-4 mr-2 text-rose-600" />
            Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center p-2 transition-colors border border-green-100 rounded-md bg-green-50 hover:bg-green-100">
              <span className="text-sm font-medium text-green-700">Approved</span>
              <span className="text-lg font-bold text-green-700">{approvedExpenses.length}</span>
              <span className="text-xs text-green-600">{expenses.length > 0 ? Math.round((approvedExpenses.length / expenses.length) * 100) : 0}%</span>
            </div>
            <div className="flex flex-col items-center p-2 transition-colors border rounded-md bg-rose-50 border-rose-100 hover:bg-rose-100">
              <span className="text-sm font-medium text-rose-700">Pending</span>
              <span className="text-lg font-bold text-rose-700">{pendingExpenses.length}</span>
              <span className="text-xs text-rose-600">{expenses.length > 0 ? Math.round((pendingExpenses.length / expenses.length) * 100) : 0}%</span>
            </div>
            <div className="flex flex-col items-center p-2 transition-colors border border-gray-100 rounded-md bg-gray-50 hover:bg-gray-100">
              <span className="text-sm font-medium text-gray-700">Rejected</span>
              <span className="text-lg font-bold text-gray-700">{rejectedExpenses.length}</span>
              <span className="text-xs text-gray-600">{expenses.length > 0 ? Math.round((rejectedExpenses.length / expenses.length) * 100) : 0}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { ExpenseCard, ExpensesSummary };
