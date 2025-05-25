import React, { useEffect, useState } from 'react';
import { dashboardService } from '../utils/apiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { DollarSign, Users, TrendingUp, TrendingDown, Package, AlertCircle, CheckCircle, Clock, PieChart, BarChart2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatUtils';

const StatCard = ({ title, value, icon, description, color = 'text-gray-600', bgColor = 'bg-gray-50' }) => (
  <Card className={`border-l-4 border-${color.split('-')[1]}-500`}>
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {React.createElement(icon, { className: `w-4 h-4 ${color}` })}
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </CardContent>
  </Card>
);

const RecentTransactionItem = ({ transaction }) => (
  <li className="flex items-center justify-between py-3 border-b last:border-b-0">
    <div>
      <p className="font-medium text-gray-800">{transaction.description}</p>
      <p className="text-sm text-gray-500">{transaction.type} - {transaction.userInvolved}</p>
    </div>
    <div className="text-right">
      <p className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {formatCurrency(transaction.amount)}
      </p>
      <p className="text-xs text-gray-400">{formatDate(transaction.date, true)}</p>
    </div>
  </li>
);

const AdminDashboardDisplay = () => {
  const [summary, setSummary] = useState(null);
  const [feeUtilizationData, setFeeUtilizationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryData, utilizationData] = await Promise.all([
          dashboardService.getAdminDashboardSummary(),
          dashboardService.getFeeUtilizationBreakdown() 
        ]);
        setSummary(summaryData);
        setFeeUtilizationData(utilizationData || []);
        setError('');
      } catch (err) {
        console.error("Error fetching admin dashboard data:", err);
        setError('Failed to load admin dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Clock className="w-8 h-8 mr-2 animate-spin text-rose-500" /> Loading admin data...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600 bg-red-100 border border-red-300 rounded-md">{error}</div>;
  }

  if (!summary) {
    return <div className="p-4 text-center text-gray-600 bg-gray-100 border border-gray-300 rounded-md">No admin summary data available.</div>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight text-gray-800">Admin Overview</h2>
      
      {/* Overall Financials */}
      <section>
        <h3 className="mb-4 text-xl font-semibold text-gray-700">Overall Financials</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Collections" value={formatCurrency(summary.totalCollections)} icon={TrendingUp} color="text-green-600" bgColor="bg-green-50" />
          <StatCard title="Total Expenses" value={formatCurrency(summary.totalExpenses)} icon={TrendingDown} color="text-red-600" bgColor="bg-red-50" />
          <StatCard title="Total Remitted" value={formatCurrency(summary.totalRemitted)} icon={Package} color="text-blue-600" bgColor="bg-blue-50" />
          <StatCard title="Net Balance" value={formatCurrency(summary.netBalance)} icon={DollarSign} color="text-indigo-600" bgColor="bg-indigo-50" />
        </div>
      </section>

      {/* Payment Summaries */}
      <section>
        <h3 className="mb-4 text-xl font-semibold text-gray-700">Payment Summaries</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total Payments Count" value={summary.totalPaymentsCount?.toLocaleString()} icon={Users} />
          <StatCard title="Total Payments Amount" value={formatCurrency(summary.totalPaymentsAmount)} icon={DollarSign} />
          {summary.paymentsByStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Payments by Status</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(summary.paymentsByStatus.counts || {}).map(([status, count]) => (
                  <div key={status} className="flex justify-between py-1 text-sm">
                    <span>{status}</span>
                    <span>{count?.toLocaleString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Expense Summaries */}
      <section>
        <h3 className="mb-4 text-xl font-semibold text-gray-700">Expense Summaries</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total Expenses Count" value={summary.totalExpensesCount?.toLocaleString()} icon={Users} color="text-red-600" />
          <StatCard title="Total Expenses Amount" value={formatCurrency(summary.totalExpensesAmount)} icon={DollarSign} color="text-red-600" />
          {summary.expensesByStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Expenses by Status</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(summary.expensesByStatus.counts || {}).map(([status, count]) => (
                  <div key={status} className="flex justify-between py-1 text-sm">
                    <span>{status}</span>
                    <span>{count?.toLocaleString()}</span>
                  </div>
                ))}
                {Object.entries(summary.expensesByStatus.amounts || {}).map(([status, amount]) => (
                  <div key={status + '-amount'} className="flex justify-between pt-1 mt-1 text-sm border-t">
                    <span className="font-semibold">{status} Amount</span>
                    <span className="font-semibold">{formatCurrency(amount)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
      
      {/* Recent Activity */}
      {summary.recentTransactions && summary.recentTransactions.length > 0 && (
        <section>
          <h3 className="mb-4 text-xl font-semibold text-gray-700">Recent Activity</h3>
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Last 10 important activities.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-gray-100">
                {summary.recentTransactions.map(transaction => (
                  <RecentTransactionItem key={transaction.id + transaction.type} transaction={transaction} />
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Fee Utilization Breakdown Section */}
      <section>
        <h3 className="mb-4 text-xl font-semibold text-gray-700">Fee Utilization Breakdown</h3>
        {feeUtilizationData.length > 0 ? (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fee Type</th>
                      <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Collected</th>
                      <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Remitted</th>
                      <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Expenses</th>
                      <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Net Balance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {feeUtilizationData.map((fee) => (
                      <tr key={fee.feeId} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{fee.feeType}</td>
                        <td className="px-6 py-4 text-sm text-right text-gray-700 whitespace-nowrap">{formatCurrency(fee.totalCollected)}</td>
                        <td className="px-6 py-4 text-sm text-right text-gray-700 whitespace-nowrap">{formatCurrency(fee.totalRemitted)}</td>
                        <td className="px-6 py-4 text-sm text-right text-red-600 whitespace-nowrap">{formatCurrency(fee.totalExpenses)}</td>
                        <td className={`px-6 py-4 text-sm font-semibold text-right whitespace-nowrap ${parseFloat(fee.netBalance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(fee.netBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="p-4 text-sm text-center text-gray-500 bg-gray-100 border border-gray-200 rounded-md">
            No fee utilization data available.
          </div>
        )}
      </section>

      {/* Other Key Metrics (if available) */}
      {summary.otherMetrics && Object.keys(summary.otherMetrics).length > 0 && (
        <section>
          <h3 className="mb-4 text-xl font-semibold text-gray-700">Other Key Metrics</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(summary.otherMetrics).map(([key, value]) => (
              <StatCard key={key} title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={value} icon={AlertCircle} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminDashboardDisplay; 