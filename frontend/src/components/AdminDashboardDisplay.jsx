import React, { useEffect, useState } from 'react';
import { dashboardService } from '../utils/apiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { DollarSign, Users, TrendingUp, TrendingDown, Package, AlertCircle, CheckCircle, Clock, PieChart, BarChart2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatUtils';

const StatCard = ({ title, value, icon, description, color = 'text-gray-600', bgColor = 'bg-gray-50', trend, borderColor = 'border-l-gray-300' }) => (
  <Card className={`group hover:shadow-lg transition-all duration-300 border-l-4 ${borderColor} shadow-md bg-gradient-to-br from-white to-rose-50/30`}>
    <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
      <div className="space-y-1">
        <CardTitle className="text-xs font-medium text-gray-600 transition-colors group-hover:text-gray-800">
          {title}
        </CardTitle>
        {trend && (
          <div className={`flex items-center space-x-1 text-xs ${trend > 0 ? 'text-green-600' : 'text-rose-600'}`}>
            {trend > 0 ? <ArrowUpRight className="w-2 h-2" /> : <ArrowDownRight className="w-2 h-2" />}
            <span className="text-xs">{Math.abs(trend)}% from last month</span>
          </div>
        )}
      </div>
      <div className={`p-1 rounded-xl ${bgColor} group-hover:scale-110 transition-transform duration-300`}>
        {React.createElement(icon, { className: `w-4 h-4 ${color}` })}
      </div>
    </CardHeader>
    <CardContent className="pb-2">
      <div className={`text-xl font-bold ${color} group-hover:scale-105 transition-transform duration-300`}>
        {value}
      </div>
      {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
    </CardContent>
  </Card>
);

const RecentTransactionItem = ({ transaction }) => (
  <li className="flex items-center justify-between px-3 py-2 transition-colors duration-200 border-l-2 rounded-lg hover:bg-rose-50/50 group border-l-transparent hover:border-l-rose-300">
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${transaction.amount >= 0 ? 'bg-green-500' : 'bg-rose-500'}`}></div>
      <div>
        <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900">{transaction.description}</p>
        <p className="text-xs text-gray-500">{transaction.type} • {transaction.userInvolved}</p>
      </div>
    </div>
    <div className="text-right">
      <p className={`font-semibold text-sm ${transaction.amount >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
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
    return (
      <div className="flex items-center justify-center border h-96 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border-rose-100">
        <div className="space-y-4 text-center">
          <div className="relative">
            <Clock className="w-12 h-12 mx-auto animate-spin text-rose-500" />
            <div className="absolute inset-0 w-12 h-12 mx-auto border-4 rounded-full border-rose-200 animate-pulse"></div>
          </div>
          <p className="text-lg font-medium text-gray-700">Loading admin dashboard...</p>
          <p className="text-sm text-gray-500">Fetching the latest financial data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h3 className="mb-2 text-lg font-semibold text-red-700">Dashboard Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-8 text-center border border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
        <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-600">No Data Available</h3>
        <p className="text-gray-500">No admin summary data available at this time.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 space-y-4 bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-gray-800 to-rose-600 bg-clip-text">
            Admin Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-600">Comprehensive overview of financial operations and system metrics</p>
        </div>
        <div className="flex items-center px-3 py-1 space-x-2 bg-white border shadow-sm rounded-xl border-rose-100">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
          <span className="text-xs font-medium text-gray-600">Live Data</span>
        </div>
      </div>
      
      {/* Overall Financials */}
      <section>
        <div className="mb-4">
          <h3 className="mb-1 text-lg font-bold text-gray-800">Financial Overview</h3>
          <p className="text-sm text-gray-600">Key financial metrics and performance indicators</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Collections" 
            value={formatCurrency(summary.totalCollections)} 
            icon={TrendingUp} 
            color="text-rose-600" 
            bgColor="bg-rose-100" 
            borderColor="border-l-rose-500"
          />
          <StatCard 
            title="Total Expenses" 
            value={formatCurrency(summary.totalExpenses)} 
            icon={TrendingDown} 
            color="text-red-600" 
            bgColor="bg-red-100" 
            borderColor="border-l-red-500"
          />
          <StatCard 
            title="Total Remitted" 
            value={formatCurrency(summary.totalRemitted)} 
            icon={Package} 
            color="text-blue-600" 
            bgColor="bg-blue-100" 
            borderColor="border-l-blue-500"
          />
          <StatCard 
            title="Net Balance" 
            value={formatCurrency(summary.netBalance)} 
            icon={DollarSign} 
            color="text-purple-600" 
            bgColor="bg-purple-100" 
            borderColor="border-l-purple-500"
          />
        </div>
      </section>

      {/* Payment Summaries */}
      <section>
        <div className="mb-4">
          <h3 className="mb-1 text-lg font-bold text-gray-800">Payment Analytics</h3>
          <p className="text-sm text-gray-600">Detailed breakdown of payment transactions and status</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <StatCard 
            title="Total Payments" 
            value={summary.totalPaymentsCount?.toLocaleString()} 
            icon={Users} 
            color="text-rose-600" 
            bgColor="bg-rose-100"
            borderColor="border-l-rose-400"
            description="Total number of payment records"
          />
          <StatCard 
            title="Payments Value" 
            value={formatCurrency(summary.totalPaymentsAmount)} 
            icon={DollarSign} 
            color="text-green-600" 
            bgColor="bg-green-100"
            borderColor="border-l-green-500"
            description="Total monetary value"
          />
          {summary.paymentsByStatus && (
            <Card className="transition-all duration-300 border-l-4 hover:shadow-lg border-l-rose-300">
              <CardHeader className="pb-1 rounded-t-lg bg-gradient-to-r from-rose-50 to-pink-50">
                <CardTitle className="flex items-center text-sm font-semibold text-gray-800">
                  <BarChart2 className="w-4 h-4 mr-2 text-rose-600" />
                  Payment Status Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2">
                  {Object.entries(summary.paymentsByStatus.counts || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between px-2 py-1 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
                      <span className="text-xs font-medium text-gray-700">{status}</span>
                      <span className="text-xs font-bold text-gray-900">{count?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Expense Summaries */}
      <section>
        <div className="mb-4">
          <h3 className="mb-1 text-lg font-bold text-gray-800">Expense Management</h3>
          <p className="text-sm text-gray-600">Overview of organizational expenses and approvals</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <StatCard 
            title="Total Expenses" 
            value={summary.totalExpensesCount?.toLocaleString()} 
            icon={Users} 
            color="text-red-600" 
            bgColor="bg-red-100"
            borderColor="border-l-red-500"
            description="Number of expense records"
          />
          <StatCard 
            title="Expenses Value" 
            value={formatCurrency(summary.totalExpensesAmount)} 
            icon={DollarSign} 
            color="text-red-600" 
            bgColor="bg-red-100"
            borderColor="border-l-red-500"
            description="Total expense amount"
          />
          {summary.expensesByStatus && (
            <Card className="transition-all duration-300 border-l-4 hover:shadow-lg border-l-rose-400">
              <CardHeader className="pb-1 rounded-t-lg bg-gradient-to-r from-rose-50 to-pink-50">
                <CardTitle className="flex items-center text-sm font-semibold text-gray-800">
                  <PieChart className="w-4 h-4 mr-2 text-rose-600" />
                  Expense Status Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-xs font-medium text-gray-700">Count by Status</h4>
                    {Object.entries(summary.expensesByStatus.counts || {}).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between px-2 py-1 rounded-lg bg-gray-50">
                        <span className="text-xs font-medium text-gray-700">{status}</span>
                        <span className="text-xs font-bold text-gray-900">{count?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 space-y-1 border-t">
                    <h4 className="text-xs font-medium text-gray-700">Amount by Status</h4>
                    {Object.entries(summary.expensesByStatus.amounts || {}).map(([status, amount]) => (
                      <div key={status + '-amount'} className="flex items-center justify-between px-2 py-1 rounded-lg bg-red-50">
                        <span className="text-xs font-semibold text-red-700">{status}</span>
                        <span className="text-xs font-bold text-red-800">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
      
      {/* Recent Activity */}
      {summary.recentTransactions && summary.recentTransactions.length > 0 && (
        <section>
          <div className="mb-4">
            <h3 className="mb-1 text-lg font-bold text-gray-800">Recent Activity</h3>
            <p className="text-sm text-gray-600">Latest financial transactions and activities</p>
          </div>
          <Card className="transition-all duration-300 border-l-4 border-l-rose-400 hover:shadow-lg">
            <CardHeader className="pb-1 bg-gradient-to-r from-rose-50/30 to-transparent">
              <CardTitle className="flex items-center text-sm text-gray-800">
                <Clock className="w-4 h-4 mr-2 text-rose-600" />
                Recent Transactions
              </CardTitle>
              <CardDescription className="text-xs">Last 10 important activities.</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
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
        <div className="mb-4">
          <h3 className="mb-1 text-lg font-bold text-gray-800">Fee Utilization Breakdown</h3>
          <p className="text-sm text-gray-600">Detailed analysis of fee collection and expenditure by category</p>
        </div>
        {feeUtilizationData.length > 0 ? (
          <Card className="overflow-hidden transition-all duration-300 border-l-4 border-l-rose-400 hover:shadow-lg">
            <CardHeader className="pb-1 bg-gradient-to-r from-rose-50/30 to-transparent">
              <CardTitle className="flex items-center text-sm text-gray-800">
                <BarChart2 className="w-4 h-4 mr-2 text-rose-600" />
                Financial Breakdown by Fee Type
              </CardTitle>
              <CardDescription className="text-xs">Comprehensive view of collections, remittances, and expenses</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-rose-50 to-pink-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-xs font-medium tracking-wider text-left uppercase text-rose-700">Fee Type</th>
                      <th scope="col" className="px-3 py-2 text-xs font-medium tracking-wider text-right uppercase text-rose-700">Collected</th>
                      <th scope="col" className="px-3 py-2 text-xs font-medium tracking-wider text-right uppercase text-rose-700">Remitted</th>
                      <th scope="col" className="px-3 py-2 text-xs font-medium tracking-wider text-right uppercase text-rose-700">Expenses</th>
                      <th scope="col" className="px-3 py-2 text-xs font-medium tracking-wider text-right uppercase text-rose-700">Net Balance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {feeUtilizationData.map((fee) => (
                      <tr key={fee.feeId} className="transition-colors duration-200 hover:bg-rose-50/30">
                        <td className="px-3 py-2 text-xs font-medium text-gray-900 whitespace-nowrap">{fee.feeType}</td>
                        <td className="px-3 py-2 text-xs text-right text-gray-700 whitespace-nowrap">{formatCurrency(fee.totalCollected)}</td>
                        <td className="px-3 py-2 text-xs text-right text-gray-700 whitespace-nowrap">{formatCurrency(fee.totalRemitted)}</td>
                        <td className="px-3 py-2 text-xs text-right text-red-600 whitespace-nowrap">{formatCurrency(fee.totalExpenses)}</td>
                        <td className={`px-3 py-2 text-xs font-semibold text-right whitespace-nowrap ${parseFloat(fee.netBalance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
          <div className="p-6 text-center border bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200 rounded-2xl">
            <Package className="w-8 h-8 mx-auto mb-3 text-rose-400" />
            <h3 className="mb-1 text-sm font-semibold text-rose-700">No Fee Data Available</h3>
            <p className="text-xs text-rose-600">No fee utilization data available at this time.</p>
          </div>
        )}
      </section>

      {/* Other Key Metrics (if available) */}
      {summary.otherMetrics && Object.keys(summary.otherMetrics).length > 0 && (
        <section>
          <div className="mb-4">
            <h3 className="mb-1 text-lg font-bold text-gray-800">Other Key Metrics</h3>
            <p className="text-sm text-gray-600">Additional system metrics and performance indicators</p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(summary.otherMetrics).map(([key, value]) => (
              <StatCard 
                key={key} 
                title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                value={value} 
                icon={AlertCircle} 
                color="text-rose-600"
                bgColor="bg-rose-100"
                borderColor="border-l-rose-400"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminDashboardDisplay;