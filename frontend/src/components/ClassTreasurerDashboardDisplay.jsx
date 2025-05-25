import React, { useEffect, useState } from 'react';
import { dashboardService } from '../utils/apiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { DollarSign, Users, CheckSquare, ListChecks, UserCheck, AlertCircle, Clock, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatUtils';

const StatCard = ({ title, value, icon, description, color = 'text-gray-600' }) => (
  <Card className={`border-l-4 border-${color.split('-')[1]}-500`}>
    <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
      <CardTitle className="text-xs font-medium">{title}</CardTitle>
      {React.createElement(icon, { className: `w-3 h-3 ${color}` })}
    </CardHeader>
    <CardContent className="pb-2">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </CardContent>
  </Card>
);

const TransactionListItem = ({ transaction, type }) => (
  <li className="py-2 border-b last:border-b-0">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-800">
          {type === 'remittance' ? `To: ${transaction.remittedTo || 'N/A'}` : transaction.description}
        </p>
        <p className="text-xs text-gray-500">
          {type === 'payment' && transaction.userInvolved ? `${transaction.userInvolved} - ` : ''}
          Status: {transaction.status}
        </p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-gray-400">{formatDate(transaction.date, true)}</p>
      </div>
    </div>
    {type === 'remittance' && transaction.description && 
      <p className="mt-1 text-xs text-gray-500">Details: {transaction.description}</p>
    }
  </li>
);

const StudentPaymentStatusItem = ({ studentStatus }) => (
  <li className="flex items-center justify-between py-2 border-b last:border-b-0">
    <div>
      <p className="text-sm font-medium text-gray-800">{studentStatus.studentName}</p>
      <p className="text-xs text-gray-500">{studentStatus.feeType}</p>
    </div>
    <div className="text-right">
      <p className={`text-sm font-semibold ${studentStatus.paymentStatus === 'Paid' ? 'text-green-600' : (studentStatus.paymentStatus === 'Partially Paid' ? 'text-yellow-600' : 'text-red-600')}`}>
        {studentStatus.paymentStatus}
      </p>
      <p className="text-xs text-gray-500">
        Paid: {formatCurrency(studentStatus.amountPaid)} / Due: {formatCurrency(studentStatus.amountDue)}
      </p>
    </div>
  </li>
);

const ClassTreasurerDashboardDisplay = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getClassTreasurerDashboardSummary();
        setSummary(data);
        setError('');
      } catch (err) {
        console.error("Error fetching class treasurer dashboard summary:", err);
        setError('Failed to load class treasurer dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Clock className="w-8 h-8 mr-2 animate-spin text-rose-500" /> Loading treasurer data...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600 bg-red-100 border border-red-300 rounded-md">{error}</div>;
  }

  if (!summary) {
    return <div className="p-4 text-center text-gray-600 bg-gray-100 border border-gray-300 rounded-md">No class treasurer summary data available.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight text-gray-800">Class Treasurer Dashboard</h2>
      <div className="text-sm text-gray-600">
        <p>Welcome, <span className="font-semibold">{summary.treasurerName}</span>!</p>
        <p>Managing: <span className="font-semibold">{summary.className}</span></p>
      </div>

      {/* Remittance Summary */}
      <section>
        <h3 className="mb-3 text-lg font-semibold text-gray-700">Your Remittance Summary</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total Remittances Made" value={summary.totalRemittancesMadeCount?.toLocaleString()} icon={Package} color="text-blue-600" />
          <StatCard title="Total Amount Remitted" value={formatCurrency(summary.totalAmountRemittedByTreasurer)} icon={TrendingUp} color="text-green-600" />
          {summary.remittancesByStatus && (
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium">Remittances by Status</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                {Object.entries(summary.remittancesByStatus.counts || {}).map(([status, count]) => (
                  <div key={status} className="flex justify-between py-1 text-xs">
                    <span>{status}</span>
                    <span>{count?.toLocaleString()} ({formatCurrency(summary.remittancesByStatus.amounts?.[status] || 0)})</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
        {summary.recentRemittancesByTreasurer && summary.recentRemittancesByTreasurer.length > 0 && (
          <Card className="mt-3">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Recent Remittances</CardTitle>
              <CardDescription className="text-xs">Your last few remittance activities.</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <ul className="divide-y divide-gray-100">
                {summary.recentRemittancesByTreasurer.map(tx => <TransactionListItem key={tx.id} transaction={tx} type="remittance" />)}
              </ul>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Payment Summary for Managed Fees */}
      <section>
        <h3 className="mb-3 text-lg font-semibold text-gray-700">Class Collection Summary</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <StatCard title="Total Collected (Managed Fees)" value={formatCurrency(summary.totalCollectedForManagedFees)} icon={DollarSign} color="text-teal-600" />
          <StatCard title="Total Payments (Managed Fees)" value={summary.totalPaymentsForManagedFeesCount?.toLocaleString()} icon={Users} color="text-cyan-600" />
        </div>
        {summary.recentPaymentsForManagedFees && summary.recentPaymentsForManagedFees.length > 0 && (
           <Card className="mt-3">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Recent Payments Received</CardTitle>
              <CardDescription className="text-xs">Last few payments collected for your class.</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <ul className="divide-y divide-gray-100">
                {summary.recentPaymentsForManagedFees.map(tx => <TransactionListItem key={tx.id} transaction={tx} type="payment" />)}
              </ul>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Student Payment Statuses */}
      {summary.studentPaymentStatuses && summary.studentPaymentStatuses.length > 0 && (
        <section>
          <h3 className="mb-3 text-lg font-semibold text-gray-700">Student Payment Status (Managed Fees)</h3>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Overview of Student Payments</CardTitle>
              <CardDescription className="text-xs">Status of payments from students in your class for the fees you manage.</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <ul className="divide-y divide-gray-100">
                {summary.studentPaymentStatuses.map(sps => (
                  <StudentPaymentStatusItem key={sps.studentId + sps.feeType} studentStatus={sps} />
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
};

export default ClassTreasurerDashboardDisplay;