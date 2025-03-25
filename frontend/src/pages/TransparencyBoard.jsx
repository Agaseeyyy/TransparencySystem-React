import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, PieChart as PieChartIcon, Search, TrendingUp, Lock, Download, FileSpreadsheet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Example data for demonstration
const EXAMPLE_FEE_DATA = [
  { feeType: "Organization Fee", description: "Annual organization membership", totalAmount: 15000, amountCollected: 12500, amountRemitted: 10000 },
  { feeType: "Student Council", description: "Student government fund", totalAmount: 20000, amountCollected: 18000, amountRemitted: 15000 },
  { feeType: "Department Fee", description: "Department activities", totalAmount: 10000, amountCollected: 9000, amountRemitted: 8500 },
  { feeType: "Publication Fee", description: "School publication", totalAmount: 8000, amountCollected: 7200, amountRemitted: 6000 },
  { feeType: "Athletics Fee", description: "Sports programs & facilities", totalAmount: 12000, amountCollected: 10800, amountRemitted: 9500 },
];

const EXAMPLE_PROGRAM_DATA = [
  { programId: "BSIT", programName: "BS Information Technology", totalCollected: 18500, totalRemitted: 15000 },
  { programId: "BSCS", programName: "BS Computer Science", totalCollected: 19200, totalRemitted: 16500 },
  { programId: "BSIS", programName: "BS Information Systems", totalCollected: 17800, totalRemitted: 14200 },
];

const TransparencyBoard = () => {
  const { user, isAuthenticated } = useAuth();
  const [feeData, setFeeData] = useState(EXAMPLE_FEE_DATA);
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [programs, setPrograms] = useState(EXAMPLE_PROGRAM_DATA);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [loadingExport, setLoadingExport] = useState(false);

  // Check if user has admin or treasurer role
  const isAdminOrTreasurer = isAuthenticated && user && (
    user.role === 'Admin' || user.role === 'Org_Treasurer'
  );

  const COLORS = ['#e11d48', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // For both public and admin views, fetch the basic data
        const [feesRes, programsRes] = await Promise.all([
          axios.get('http://localhost:8080/api/v1/public/fees/summary'),
          axios.get('http://localhost:8080/api/v1/public/programs')
        ]);
        
        setFeeData(feesRes.data);
        setPrograms(programsRes.data);
        
        // If user is admin or treasurer, fetch additional detailed data
        if (isAdminOrTreasurer) {
          const detailedFeeRes = await axios.get(
            'http://localhost:8080/api/v1/admin/transparency/fees/detailed',
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          
          // You could use this detailed data for the admin tab
          console.log("Admin detailed data:", detailedFeeRes.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAdminOrTreasurer]);

  // Add this useEffect to handle click-away for the export menu dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const menu = document.getElementById('exportMenu');
      const button = document.querySelector('[data-export-button]');
      
      if (menu && !menu.contains(event.target) && button && !button.contains(event.target)) {
        menu.classList.add('hidden');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredFees = feeData.filter(fee => 
    fee.feeType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summaries
  const totalCollected = feeData.reduce((sum, fee) => sum + fee.amountCollected, 0);
  const totalRemitted = feeData.reduce((sum, fee) => sum + fee.amountRemitted, 0);
  const remainingBalance = totalCollected - totalRemitted;
  const collectionRate = totalCollected > 0 ? (totalRemitted / totalCollected) * 100 : 0;

  // Add this new function to handle the export
  const exportReport = async (format) => {
    if (!isAdminOrTreasurer) {
      return; // Only allow admins/treasurers to export
    }
    
    try {
      setLoadingExport(true);
      
      // Make the API call to get the report data
      const response = await axios({
        url: `http://localhost:8080/api/v1/admin/transparency/export/report?format=${format}`,
        method: 'GET',
        responseType: 'blob', // Important for binary files like Excel
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      
      // Set download attributes
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      link.setAttribute('download', `financial_report_${timestamp}.${format === 'excel' ? 'xlsx' : 'csv'}`);
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting report:', error);
      // You could add a toast notification here to inform the user of the error
    } finally {
      setLoadingExport(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container px-4 py-6 mx-auto"
    >
      <motion.div 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col mb-6"
      >
        <p className="mt-1 text-gray-500">
          Financial transparency system for student fees
        </p>
        
        {/* Access level indicator */}
        {isAdminOrTreasurer && (
          <Badge className="self-start mt-2 bg-rose-100 text-rose-800 border-rose-200">
            Admin/Treasurer View
          </Badge>
        )}
      </motion.div>

      {/* Search Filter */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by fee type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="w-full md:w-auto">
          <Select value={selectedProgram} onValueChange={setSelectedProgram}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select Program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {programs.map(program => (
                <SelectItem key={program.programId} value={program.programId}>
                  {program.programName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Export option - only for admin/treasurer */}
        {isAdminOrTreasurer && (
          <div className="relative">
            <Button
              variant="outline" 
              className="justify-between gap-2"
              onClick={() => document.getElementById('exportMenu').classList.toggle('hidden')}
              disabled={loadingExport}
              data-export-button
            >
              {loadingExport ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full border-t-rose-600 animate-spin"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export Report</span>
                </>
              )}
            </Button>
            <div 
              id="exportMenu" 
              className="absolute right-0 z-10 hidden py-1 mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-36"
            >
              <button 
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-sm"
                onClick={() => exportReport('csv')}
                disabled={loadingExport}
              >
                <span className="mr-1">📄</span> CSV Format
              </button>
              <button 
                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-sm"
                onClick={() => exportReport('excel')}
                disabled={loadingExport}
              >
                <span className="mr-1">📊</span> Excel Format
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-l-rose-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Collected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₱{totalCollected.toLocaleString('en-PH')}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                From all fee types
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Remitted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₱{totalRemitted.toLocaleString('en-PH')}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Remitted to organizations
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Remaining Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₱{remainingBalance.toLocaleString('en-PH')}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Yet to be remitted
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Collection Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {collectionRate.toFixed(1)}%
              </div>
              <div className="w-full h-2.5 mt-2 bg-gray-200 rounded-full">
                <div 
                  className={`h-2.5 rounded-full ${
                    collectionRate > 75 ? 'bg-green-500' : 
                    collectionRate > 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${collectionRate}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fees">Fee Details</TabsTrigger>
          <TabsTrigger value="programs">By Program</TabsTrigger>
          {isAdminOrTreasurer && <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>}
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="w-5 h-5 mr-2" />
                  Fee Distribution
                </CardTitle>
                <CardDescription>
                  Breakdown of fee collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={feeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amountCollected"
                        nameKey="feeType"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {feeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₱${value.toLocaleString('en-PH')}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Collection vs Remittance
                </CardTitle>
                <CardDescription>
                  Comparing collected vs remitted amounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={feeData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="feeType" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₱${value.toLocaleString('en-PH')}`} />
                      <Legend />
                      <Bar dataKey="amountCollected" name="Collected" fill="#e11d48" />
                      <Bar dataKey="amountRemitted" name="Remitted" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Fees Tab */}
        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Fee Collection Details
              </CardTitle>
              <CardDescription>
                Detailed breakdown of all fee types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Collected</TableHead>
                    <TableHead>Remitted</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFees.map((fee, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{fee.feeType}</TableCell>
                      <TableCell>{fee.description}</TableCell>
                      <TableCell>₱{fee.totalAmount.toLocaleString('en-PH')}</TableCell>
                      <TableCell>₱{fee.amountCollected.toLocaleString('en-PH')}</TableCell>
                      <TableCell>₱{fee.amountRemitted.toLocaleString('en-PH')}</TableCell>
                      <TableCell>
                        {fee.amountCollected === fee.amountRemitted ? (
                          <Badge className="text-green-800 bg-green-100">Complete</Badge>
                        ) : fee.amountRemitted > 0 ? (
                          <Badge className="bg-amber-100 text-amber-800">Partial</Badge>
                        ) : (
                          <Badge className="text-red-800 bg-red-100">Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Programs Tab */}
        <TabsContent value="programs">
          <Card>
            <CardHeader>
              <CardTitle>Collection by Program</CardTitle>
              <CardDescription>
                Fee collection breakdown by program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={programs}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="programName" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₱${value.toLocaleString('en-PH')}`} />
                    <Legend />
                    <Bar dataKey="totalCollected" name="Collected" fill="#e11d48" />
                    <Bar dataKey="totalRemitted" name="Remitted" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Detailed Analysis Tab - Only for Admin/Treasurer */}
        {isAdminOrTreasurer && (
          <TabsContent value="detailed">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Financial Analysis</CardTitle>
                <CardDescription>
                  Extended financial information only visible to administrators and treasurers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 mb-4 border rounded-md bg-gray-50">
                  <h3 className="text-lg font-semibold">Additional Administrative Data</h3>
                  <p className="text-gray-600">This section contains detailed financial data not visible to the public.</p>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fee Type</TableHead>
                      <TableHead>Expected Collection</TableHead>
                      <TableHead>Collection Progress</TableHead>
                      <TableHead>Remittance Progress</TableHead>
                      <TableHead>Pending Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feeData.map((fee, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{fee.feeType}</TableCell>
                        <TableCell>₱{(fee.totalAmount * 1.1).toLocaleString('en-PH')}</TableCell>
                        <TableCell>{((fee.amountCollected / fee.totalAmount) * 100).toFixed(1)}%</TableCell>
                        <TableCell>{((fee.amountRemitted / fee.amountCollected) * 100).toFixed(1)}%</TableCell>
                        <TableCell>
                          {fee.amountCollected !== fee.amountRemitted && (
                            <Badge>Requires Remittance</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Login prompt for non-admin/treasurers */}
      {!isAdminOrTreasurer && (
        <Card className="p-4 mb-6 border-dashed">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="font-medium">Admin View Available</h3>
              <p className="text-sm text-gray-500">
                <a href="/login" className="text-rose-600 hover:underline">Login</a> as an administrator or treasurer to access detailed financial information.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Footer Note */}
      <div className="mt-8 text-sm text-center text-gray-500">
        <p>This transparency board is updated regularly. Last updated: {new Date().toLocaleDateString()}</p>
        <p className="mt-1">For questions or concerns, please contact the Finance Office.</p>
      </div>
    </motion.div>
  );
};

export default TransparencyBoard;