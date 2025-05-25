import React, { useEffect, useState } from 'react';
import { dashboardService } from '../utils/apiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { DollarSign, TrendingUp, TrendingDown, Briefcase, Info, Clock, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { formatCurrency } from '../utils/formatUtils';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const StatCard = ({ title, value, icon, description, color = 'text-gray-600' }) => (
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

const FeeTransparencyCard = ({ fee }) => {
  const collected = fee.totalCollectedForFee || 0;
  const spent = fee.totalSpentFromFee || 0;
  const balance = fee.feeBalance || 0;
  const budgetUtilization = collected > 0 ? (spent / collected) * 100 : 0;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-4 bg-gray-50">
        <CardTitle className="text-lg font-semibold text-gray-700">{fee.feeName}</CardTitle>
        {fee.feeDescription && <CardDescription className="mt-1 text-xs text-gray-500">{fee.feeDescription}</CardDescription>}
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Collected:</span>
          <span className="font-medium text-green-600">{formatCurrency(collected)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Spent:</span>
          <span className="font-medium text-red-600">{formatCurrency(spent)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Remaining Balance:</span>
          <span className="font-medium text-blue-600">{formatCurrency(balance)}</span>
        </div>
        {collected > 0 && (
          <div>
            <div className="flex justify-between mb-1 text-xs text-gray-500">
              <span>Budget Utilization</span>
              <span>{budgetUtilization.toFixed(1)}%</span>
            </div>
            <Progress value={budgetUtilization} className="h-2" indicatorClassName={budgetUtilization > 80 ? 'bg-red-500' : budgetUtilization > 50 ? 'bg-yellow-500' : 'bg-green-500'} />
          </div>
        )}
        {fee.expenseBreakdown && fee.expenseBreakdown.length > 0 && (
          <div className="pt-3 mt-3 border-t">
            <h4 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">Expense Highlights</h4>
            <ul className="space-y-1">
              {fee.expenseBreakdown.slice(0, 3).map((exp, idx) => (
                <li key={idx} className="flex justify-between text-xs text-gray-600">
                  <span className="truncate max-w-[70%]">{exp.expenseTitle || 'Unnamed Expense'}</span>
                  <span className="font-medium">{formatCurrency(exp.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ExpenseCategorySummaryItem = ({ categorySummary }) => (
  <Card className="text-center">
    <CardHeader className="pb-2">
      <CardTitle className="text-base font-medium text-gray-700">{categorySummary.categoryName.replace(/_/g, ' ')}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-xl font-bold text-rose-600">{formatCurrency(categorySummary.totalAmountSpent)}</p>
      <p className="text-xs text-gray-500">({categorySummary.numberOfExpenses} expenses)</p>
    </CardContent>
  </Card>
);

const PublicDashboardDisplay = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('name_asc'); // name_asc, name_desc, balance_asc, balance_desc

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getPublicDashboardSummary();
        setSummary(data);
        setError('');
      } catch (err) {
        console.error("Error fetching public dashboard summary:", err);
        setError('Failed to load public transparency data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const filteredAndSortedFees = summary?.feeBreakdown
    ?.filter(fee => fee.feeName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortOrder) {
        case 'name_asc': return a.feeName.localeCompare(b.feeName);
        case 'name_desc': return b.feeName.localeCompare(a.feeName);
        case 'balance_asc': return (a.feeBalance || 0) - (b.feeBalance || 0);
        case 'balance_desc': return (b.feeBalance || 0) - (a.feeBalance || 0);
        default: return 0;
      }
    }) || [];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Clock className="w-8 h-8 mr-2 animate-spin text-rose-500" /> Loading public data...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600 bg-red-100 border border-red-300 rounded-md">{error}</div>;
  }

  if (!summary) {
    return <div className="p-4 text-center text-gray-600 bg-gray-100 border border-gray-300 rounded-md">No public transparency data available.</div>;
  }

  return (
    <div className="space-y-8">
      <header className="py-6 text-center bg-gradient-to-r from-rose-500 to-orange-500 rounded-lg shadow-md">
        <h2 className="text-4xl font-bold tracking-tight text-white">Financial Transparency Portal</h2>
        <p className="mt-2 text-lg text-rose-100">Overview of institutional funds and their utilization.</p>
      </header>
      
      {/* Overall Summary Stats */}
      <section>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard title="Total Collected Overall" value={formatCurrency(summary.totalCollectedOverall)} icon={TrendingUp} color="text-green-600" />
          <StatCard title="Total Spent Overall" value={formatCurrency(summary.totalSpentOverall)} icon={TrendingDown} color="text-red-600" />
          <StatCard title="Current Funds Balance" value={formatCurrency(summary.currentFundsBalance)} icon={DollarSign} color="text-blue-600" />
        </div>
      </section>

      {/* Fee Transparency Section */}
      <section>
        <div className="flex flex-col items-center justify-between gap-4 mb-6 md:flex-row">
            <h3 className="text-2xl font-semibold text-gray-700">Fee Breakdown & Utilization</h3>
            <div className="flex items-center w-full gap-2 md:w-auto">
                <div className="relative flex-grow md:flex-grow-0 md:w-64">
                    <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input 
                        placeholder="Search fees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-auto md:w-[180px]">
                        <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                        <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                        <SelectItem value="balance_asc">Balance (Low-High)</SelectItem>
                        <SelectItem value="balance_desc">Balance (High-Low)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        {filteredAndSortedFees.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedFees.map(fee => (
              <FeeTransparencyCard key={fee.feeName} fee={fee} />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 bg-gray-100 rounded-md">
            <Info size={32} className="mx-auto mb-2" />
            No fees match your search criteria or no fee data available.
          </div>
        )}
      </section>

      {/* Top Expense Categories */}
      {summary.topExpenseCategories && summary.topExpenseCategories.length > 0 && (
        <section>
          <h3 className="mb-4 text-2xl font-semibold text-gray-700">Top Expense Categories</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {summary.topExpenseCategories.map(catSummary => (
              <ExpenseCategorySummaryItem key={catSummary.categoryName} categorySummary={catSummary} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default PublicDashboardDisplay; 