import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthProvider';
import { motion } from 'framer-motion';
import { Send, Mail, Users, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const PaymentAnnouncement = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [defaultLocation] = useState('JPCS Office, Room 101');
  const [recipientCount, setRecipientCount] = useState(0);
  
  const [formData, setFormData] = useState({
    feeId: '',
    location: 'JPCS Office, Room 101',
    startDate: '',
    endDate: '',
    program: 'all',
    yearLevel: 'all',
    section: 'all'
  });
  
  // Create an array of letters A-Z for section dropdown
  const sectionOptions = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [feesResponse, programsResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/v1/fees'),
          axios.get('http://localhost:8080/api/v1/public/programs')
        ]);
        
        setFees(feesResponse.data);
        setPrograms(programsResponse.data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    
    fetchInitialData();
  }, []);  
  // Calculate expected recipient count when filters change
  useEffect(() => {
    const calculateRecipients = async () => {
      if (!formData.feeId) {
        setRecipientCount(0);
        return;
      }
      
      try {
        const response = await axios.get('http://localhost:8080/api/v1/students/count', {
          params: {
            program: formData.program === 'all' ? null : formData.program,
            yearLevel: formData.yearLevel === 'all' ? null : formData.yearLevel,
            section: formData.section === 'all' ? null : formData.section
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setRecipientCount(response.data?.count || 0);
      } catch (error) {
        console.error("Error calculating recipients:", error);
      }
    };
    
    calculateRecipients();
  }, [formData.program, formData.yearLevel, formData.section, formData.feeId]);
  
  const handleChange = (name, value) => {
    // If the fee ID is changed, automatically set dates based on the selected fee
    if (name === 'feeId' && value) {
      const selectedFee = fees.find(fee => fee.feeId.toString() === value.toString());
      
      if (selectedFee) {
        // Get the due date from the selected fee
        const dueDate = new Date(selectedFee.dueDate);
        
        // Set collection start date to 14 days before due date
        const startDate = new Date(dueDate);
        startDate.setDate(dueDate.getDate() - 14);
        
        // Set collection end date to 2 days before due date
        const endDate = new Date(dueDate);
        endDate.setDate(dueDate.getDate() - 2);
        
        // Format dates to YYYY-MM-DD for input fields
        const formatDate = (date) => {
          return date.toISOString().split('T')[0];
        };
        
        setFormData({
          ...formData,
          [name]: value,
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          location: defaultLocation
        });
        return; // Exit early since we've already updated the state
      }
    }
    
    // Regular field update
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const resetForm = () => {
    setFormData({
      feeId: '',
      location: defaultLocation,
      startDate: '',
      endDate: '',
      program: 'all',
      yearLevel: 'all',
      section: 'all'
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setPreviewOpen(false);
    
    try {
      const response = await axios.post(
        'http://localhost:8080/api/v1/announcements/payment',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Replace the old toast usage with this:
      toast.success("Announcement sent successfully", {
        description: `Email sent to ${response.data.recipients} students.`
      });
      
      // Reset form
      resetForm();
      
    } catch (error) {
      // Replace the old toast usage with this:
      toast.error("Error sending announcement", {
        description: error.response?.data?.message || 'Failed to send announcement'
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };
  
  const handlePreview = () => {
    if (formData.feeId) {
      setPreviewOpen(true);
    }
  };

  const getSelectedFeeName = () => {
    const selectedFee = fees.find(fee => fee.feeId.toString() === formData.feeId.toString());
    return selectedFee ? selectedFee.feeType : "";
  };

  const getSelectedProgramName = () => {
    const selectedProgram = programs.find(prog => prog.programId.toString() === formData.program.toString());
    return selectedProgram ? selectedProgram.programName : "All Programs";
  };
  
  // Only authorized users can access this component
  if (!user || (user.role !== 'Admin' && user.role !== 'Org_Treasurer')) {
    return (
      <Card className="w-full">
        <CardHeader className="border-b bg-red-50">
          <CardTitle className="flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p>You don't have permission to access this feature.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-rose-600">
              <Mail className="w-5 h-5 mr-2" />
              Payment Announcement
            </CardTitle>
            <Badge variant={formData.feeId ? "outline" : "secondary"}>
              {recipientCount} {recipientCount === 1 ? "Recipient" : "Recipients"}
            </Badge>
          </div>
          <CardDescription>
            Send payment collection announcements to students via email
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form id="announcementForm" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feeId">Select Fee</Label>
              <Select
                value={formData.feeId.toString()}
                onValueChange={(value) => handleChange('feeId', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a fee..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {fees.map(fee => (
                      <SelectItem key={fee.feeId} value={fee.feeId.toString()}>
                        <div className="flex justify-between w-full">
                          <span>{fee.feeType}</span>
                          <span className="text-gray-500">₱{fee.amount}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {/* Read-only field displaying the payment details */}
            {formData.feeId && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="p-4 text-blue-900 border rounded bg-blue-50"
              >
                <div className="flex items-center mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  <h4 className="font-medium">Payment Collection Details</h4>
                </div>
                <div className="pl-6 space-y-1 text-sm">
                  <p><span className="font-medium">Location:</span> {formData.location}</p>
                  <p><span className="font-medium">Collection Period:</span> {formData.startDate} to {formData.endDate}</p>
                </div>
              </motion.div>
            )}
            
            {/* Hidden fields for location and dates */}
            <input type="hidden" name="location" value={formData.location} />
            <input type="hidden" name="startDate" value={formData.startDate} />
            <input type="hidden" name="endDate" value={formData.endDate} />
            
            <div className="pt-2">
              <div className="flex items-center mb-2">
                <Users className="w-4 h-4 mr-2" />
                <h3 className="font-medium">Filter Recipients</h3>
              </div>
              <p className="mb-4 text-sm text-gray-500">Leave all filters empty to send to all students</p>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="program">Program</Label>
                  <Select 
                    value={formData.program}
                    onValueChange={(value) => handleChange('program', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Programs" />
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="yearLevel">Year Level</Label>
                    <Select
                      value={formData.yearLevel}
                      onValueChange={(value) => handleChange('yearLevel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="section">Section</Label>
                    <Select
                      value={formData.section}
                      onValueChange={(value) => handleChange('section', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Sections" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sections</SelectItem>
                        {sectionOptions.map(section => (
                          <SelectItem key={section} value={section}>
                            Section {section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            {formData.feeId ? (
              <span>
                Sending notification for <Badge variant="outline">{getSelectedFeeName()}</Badge>
              </span>
            ) : (
              <span>Select a fee to continue</span>
            )}
          </div>
          <div className="space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  onClick={handlePreview}
                  disabled={!formData.feeId}
                >
                  Preview
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview email before sending</TooltipContent>
            </Tooltip>
            
            <Button 
              onClick={() => setOpen(true)}
              disabled={loading || !formData.feeId}
              className="bg-rose-600 hover:bg-rose-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Sending...' : 'Send Announcement'}
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Email Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to send an email announcement to <span className="font-medium">{recipientCount}</span> students 
              {formData.program && <span> in <span className="font-medium">{getSelectedProgramName()}</span></span>}
              {formData.yearLevel && <span>, year <span className="font-medium">{formData.yearLevel}</span></span>}
              {formData.section && <span>, section <span className="font-medium">{formData.section}</span></span>}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <h3 className="mb-1 font-medium">Email Details</h3>
            <div className="p-3 text-sm border rounded bg-gray-50">
              <p><span className="font-medium">Fee:</span> {getSelectedFeeName()}</p>
              <p><span className="font-medium">Location:</span> {formData.location}</p>
              <p><span className="font-medium">Collection Period:</span> {formData.startDate} to {formData.endDate}</p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} className="bg-rose-600 hover:bg-rose-700">
              <Send className="w-4 h-4 mr-2" />
              Send Emails
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Email Preview Dialog */}
      <AlertDialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" /> 
              Email Preview
            </AlertDialogTitle>
            <AlertDialogDescription>
              This is how your email will appear to recipients
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-4 my-2 bg-white border rounded-md">
            <div className="pb-2 mb-2 border-b">
              <p><strong>Subject:</strong> Payment Announcement: {getSelectedFeeName()}</p>
              <p><strong>To:</strong> [Student Email]</p>
            </div>
            <div className="px-1 py-2 space-y-2">
              <p>Dear [Student Name],</p>
              <p>We would like to inform you about the upcoming payment collection:</p>
              <p>Fee: {getSelectedFeeName()}</p>
              <p>Amount: ₱{fees.find(f => f.feeId.toString() === formData.feeId.toString())?.amount || '0.00'}</p>
              <p>Collection period: {formData.startDate} to {formData.endDate}</p>
              <p>Location: {formData.location}</p>
              <p>Please bring the exact amount and your student ID.</p>
              <p>Thank you,<br/>JPCS Office</p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={() => setOpen(true)} className="bg-rose-600 hover:bg-rose-700">
              Continue to Send
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default PaymentAnnouncement;