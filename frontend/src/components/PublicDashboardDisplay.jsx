import React, { useEffect, useState } from 'react';
import { dashboardService } from '../utils/apiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Briefcase, 
  Info, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search,
  PieChart,
  BarChart3,
  Shield,
  Eye,
  Calculator,
  Activity,
  Wallet,
  Receipt,
  Building2,
  Users,
  Target,
  Award
} from 'lucide-react';
import { formatCurrency } from '../utils/formatUtils';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const StatCard = ({ title, value, icon, description, color = 'text-gray-600', gradient = 'from-gray-500 to-gray-600' }) => (
  <Card className="relative overflow-hidden transition-all duration-300 transform border-0 shadow-lg group hover:shadow-xl hover:-translate-y-1">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
    <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
      <div className={`p-2 rounded-full bg-gradient-to-br ${gradient} text-white shadow-lg`}>
        {React.createElement(icon, { className: "w-4 h-4" })}
      </div>
    </CardHeader>
    <CardContent className="relative z-10">
      <div className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {value}
      </div>
      {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
    </CardContent>
  </Card>
);

const FeeTransparencyCard = ({ fee }) => {
  const collected = fee.totalCollectedForFee || 0;
  const spent = fee.totalSpentFromFee || 0;
  const balance = fee.feeBalance || 0;
  const budgetUtilization = collected > 0 ? (spent / collected) * 100 : 0;

  const getUtilizationColor = (percentage) => {
    if (percentage > 80) return 'from-red-500 to-red-600';
    if (percentage > 50) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-green-600';
  };

  const getUtilizationStatus = (percentage) => {
    if (percentage > 80) return { text: 'High Usage', color: 'text-red-600', bg: 'bg-red-100' };
    if (percentage > 50) return { text: 'Moderate Usage', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { text: 'Low Usage', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const status = getUtilizationStatus(budgetUtilization);

  return (
    <Card className="overflow-hidden transition-all duration-300 border-0 shadow-lg group hover:shadow-xl bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="relative pb-4 overflow-hidden text-white bg-gradient-to-r from-rose-500 to-pink-500">
        <div className="absolute top-0 right-0 w-32 h-32 translate-x-16 -translate-y-16 rounded-full bg-white/10"></div>
        <div className="relative z-10">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
            <Receipt className="w-5 h-5" />
            {fee.feeName}
          </CardTitle>
          {fee.feeDescription && (
            <CardDescription className="mt-1 text-sm text-rose-100">
              {fee.feeDescription}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        {/* Financial Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 text-center border border-green-200 rounded-lg bg-green-50">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-600" />
            <p className="text-xs font-medium text-green-700">Collected</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(collected)}</p>
          </div>
          <div className="p-3 text-center border border-red-200 rounded-lg bg-red-50">
            <TrendingDown className="w-5 h-5 mx-auto mb-1 text-red-600" />
            <p className="text-xs font-medium text-red-700">Spent</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(spent)}</p>
          </div>
          <div className="p-3 text-center border border-blue-200 rounded-lg bg-blue-50">
            <Wallet className="w-5 h-5 mx-auto mb-1 text-blue-600" />
            <p className="text-xs font-medium text-blue-700">Balance</p>
            <p className="text-lg font-bold text-blue-600">{formatCurrency(balance)}</p>
          </div>
        </div>

        {/* Budget Utilization */}
        {collected > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Budget Utilization</span>
              <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color} font-medium`}>
                {status.text}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{budgetUtilization.toFixed(1)}%</span>
                <span className="text-gray-600">{formatCurrency(collected)}</span>
              </div>
              <div className="w-full h-3 overflow-hidden bg-gray-200 rounded-full">
                <div 
                  className={`h-full bg-gradient-to-r ${getUtilizationColor(budgetUtilization)} transition-all duration-500 rounded-full relative overflow-hidden`}
                  style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expense Breakdown */}
        {fee.expenseBreakdown && fee.expenseBreakdown.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-gray-600" />
              <h4 className="text-sm font-semibold text-gray-700">Recent Expenses</h4>
            </div>
            <div className="space-y-2">
              {fee.expenseBreakdown.slice(0, 3).map((exp, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    <span className="text-sm text-gray-700 font-medium truncate max-w-[120px]">
                      {exp.expenseTitle || 'Unnamed Expense'}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-rose-600">{formatCurrency(exp.amount)}</span>
                </div>
              ))}
              {fee.expenseBreakdown.length > 3 && (
                <p className="mt-2 text-xs text-center text-gray-500">
                  +{fee.expenseBreakdown.length - 3} more expenses
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ExpenseCategorySummaryItem = ({ categorySummary }) => (
  <Card className="overflow-hidden text-center transition-all duration-300 transform border-0 shadow-lg group hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
    <CardHeader className="relative pb-3 text-white bg-gradient-to-r from-orange-400 to-rose-500">
      <div className="absolute top-0 right-0 w-20 h-20 translate-x-10 -translate-y-10 rounded-full bg-white/20"></div>
      <div className="relative z-10 flex items-center justify-center gap-2">
        <Target className="w-5 h-5" />
        <CardTitle className="text-base font-bold">
          {categorySummary.categoryName.replace(/_/g, ' ')}
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent className="p-4">
      <div className="space-y-2">
        <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text">
          {formatCurrency(categorySummary.totalAmountSpent)}
        </p>
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
          <Activity className="w-3 h-3" />
          <span>{categorySummary.numberOfExpenses} expense{categorySummary.numberOfExpenses !== 1 ? 's' : ''}</span>
        </div>
      </div>
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
        <div className="space-y-4 text-center">
          <div className="relative">
            <div className="w-16 h-16 mx-auto border-4 rounded-full border-rose-200 border-t-rose-500 animate-spin"></div>
            <Shield className="absolute inset-0 w-8 h-8 m-auto text-rose-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-700">Loading Transparency Data</h3>
            <p className="text-sm text-gray-500">Fetching financial information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-rose-50 via-white to-orange-50">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-6 space-y-4 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-700">Error Loading Data</h3>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-rose-50 via-white to-orange-50">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-6 space-y-4 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 rounded-full">
              <Info className="w-8 h-8 text-gray-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-700">No Data Available</h3>
              <p className="text-sm text-gray-600">No public transparency data available at this time.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute w-32 h-32 rounded-full top-10 left-10 bg-white/10"></div>
            <div className="absolute w-24 h-24 rounded-full top-32 right-20 bg-white/10"></div>
            <div className="absolute w-40 h-40 rounded-full bottom-10 left-1/3 bg-white/10"></div>
          </div>
        </div>
        
        <div className="relative z-10 px-6 py-16 mx-auto max-w-7xl lg:px-8">
          <div className="space-y-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight text-white md:text-6xl">
              Financial Transparency
              <span className="block mt-2 text-3xl font-medium md:text-4xl text-rose-100">
                Portal
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl text-rose-100">
              Complete oversight of institutional funds and their utilization. 
              Ensuring accountability and transparency in financial management.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-rose-100">
              <Users className="w-5 h-5" />
              <span className="text-sm">Public Access • Real-time Data • Full Transparency</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-12 mx-auto space-y-12 max-w-7xl">
        {/* Overall Summary Stats */}
        <section className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="flex items-center justify-center gap-3 text-3xl font-bold text-gray-800">
              <Calculator className="w-8 h-8 text-rose-500" />
              Financial Overview
            </h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              Current status of all collected fees, expenses, and remaining balances
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard 
              title="Total Collections" 
              value={formatCurrency(summary.totalCollectedOverall)} 
              icon={TrendingUp} 
              description="All fees collected to date"
              gradient="from-green-500 to-emerald-600"
            />
            <StatCard 
              title="Total Expenditure" 
              value={formatCurrency(summary.totalSpentOverall)} 
              icon={TrendingDown} 
              description="Total amount spent on expenses"
              gradient="from-red-500 to-rose-600"
            />
            <StatCard 
              title="Available Balance" 
              value={formatCurrency(summary.currentFundsBalance)} 
              icon={Wallet} 
              description="Current funds available"
              gradient="from-blue-500 to-indigo-600"
            />
          </div>
        </section>

        {/* Fee Transparency Section */}
        <section className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h2 className="flex items-center gap-3 text-3xl font-bold text-gray-800">
                <PieChart className="w-8 h-8 text-rose-500" />
                Fee Breakdown & Utilization
              </h2>
              <p className="text-gray-600">
                Detailed breakdown of each fee type and how funds are being utilized
              </p>
            </div>
            
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <Input 
                  placeholder="Search fees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:w-64 border-rose-200 focus:border-rose-500 focus:ring-rose-500"
                />
              </div>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full sm:w-48 border-rose-200 focus:border-rose-500 focus:ring-rose-500">
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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {filteredAndSortedFees.map(fee => (
                <FeeTransparencyCard key={fee.feeName} fee={fee} />
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 space-y-4 text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 rounded-full">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-700">No Fees Found</h3>
                  <p className="text-gray-500">
                    {searchTerm ? 
                      `No fees match "${searchTerm}". Try adjusting your search.` :
                      'No fee data available at this time.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Top Expense Categories */}
        {summary.topExpenseCategories && summary.topExpenseCategories.length > 0 && (
          <section className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="flex items-center justify-center gap-3 text-3xl font-bold text-gray-800">
                <BarChart3 className="w-8 h-8 text-rose-500" />
                Expense Categories
              </h2>
              <p className="max-w-2xl mx-auto text-gray-600">
                Top spending categories showing where institutional funds are being allocated
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {summary.topExpenseCategories.map(catSummary => (
                <ExpenseCategorySummaryItem key={catSummary.categoryName} categorySummary={catSummary} />
              ))}
            </div>
          </section>
        )}

        {/* Footer Info */}
        <section className="pt-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-gray-100">
            <CardContent className="p-8 space-y-4 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Award className="w-5 h-5" />
                <span className="font-medium">Committed to Financial Transparency</span>
              </div>
              <p className="max-w-2xl mx-auto text-sm text-gray-500">
                This dashboard provides real-time access to financial information in accordance with 
                institutional transparency policies. All data is updated regularly to ensure accuracy.
              </p>
              <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Real-time Data</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Secure Access</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>Full Transparency</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default PublicDashboardDisplay; 