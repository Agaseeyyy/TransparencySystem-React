import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { motion } from 'framer-motion';
import { Send, Mail, Users, Calendar, CalendarDays, Bell, Clock, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { studentService, feeService, programService, emailService } from '../utils/apiService'; // Import emailService

const EmailManagement = () => {
  const { user, can } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [fees, setFees] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [announcementLoading, setAnnouncementLoading] = useState(false);
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
  
  const sectionOptions = Array.from({ length: 10 }, (_, i) => String.fromCharCode(65 + i));
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [feesResponse, programsResponse] = await Promise.all([
          feeService.getFees(), // Use feeService
          programService.getPrograms() // Use programService
        ]);
        
        setFees(feesResponse.content || feesResponse); // Adjust based on actual response structure
        setPrograms(programsResponse.content || programsResponse); // Adjust based on actual response structure
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load initial data.");
      }
    };
    
    fetchInitialData();
  }, []);
  
  useEffect(() => {
    const calculateRecipients = async () => {
      if (!formData.feeId) {
        setRecipientCount(0);
        return;
      }
      
      try {
        // Assuming studentService.getStudents can take count parameter or similar
        // This might need a dedicated count endpoint in studentService
        const response = await studentService.getStudents({
          program: formData.program === 'all' ? null : formData.program,
          yearLevel: formData.yearLevel === 'all' ? null : formData.yearLevel,
          section: formData.section === 'all' ? null : formData.section,
          // Add a parameter to indicate count is needed if backend supports it
          // countOnly: true 
        });
        // Adjust based on how count is returned. If it's an array, use .length
        // If it's an object with a count property, use response.count
        // For now, assuming it's an array of students and we need its length.
        // This is a placeholder, actual implementation depends on studentService.getStudents behavior or a new count endpoint.
        const studentCount = Array.isArray(response.content) ? response.content.length : (response.count || 0);
        setRecipientCount(studentCount);

      } catch (error) {
        console.error("Error calculating recipients:", error);
        // toast.error("Failed to calculate recipient count.");
        setRecipientCount(0); // Set to 0 on error
      }
    };
    
    calculateRecipients();
  }, [formData.program, formData.yearLevel, formData.section, formData.feeId]);
  
  const triggerAction = async (action) => {
    setLoading(true);
    setResult(null);
    
    try {
      await emailService.triggerEmailAction(action); // Use emailService
      
      setResult({
        success: true,
        message: `Successfully triggered ${action} emails!`
      });
      toast.success(`Email action successful`, {
        description: `Successfully triggered ${action} emails!`
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error.response?.data?.message || error.message}`
      });
      toast.error(`Email action failed`, {
        description: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (name, value) => {
    if (name === 'feeId' && value) {
      const selectedFee = fees.find(fee => fee.feeId.toString() === value.toString());
      if (selectedFee) {
        const dueDate = new Date(selectedFee.dueDate);
        const startDate = new Date(dueDate);
        startDate.setDate(dueDate.getDate() - 14);
        const endDate = new Date(dueDate);
        endDate.setDate(dueDate.getDate() - 2);
        const formatDate = (date) => date.toISOString().split('T')[0];
        
        setFormData(prevData => ({
          ...prevData,
          [name]: value,
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          location: defaultLocation
        }));
        return;
      }
    }
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
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
    setRecipientCount(0);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setAnnouncementLoading(true);
    setPreviewOpen(false);
    setResult(null);
    
    try {
      const response = await emailService.sendAnnouncement(formData); // Use emailService
      
      setResult({
        success: true,
        message: `Email announcement successfully sent to ${response.recipients || 'relevant'} students.`
      });
      toast.success("Announcement sent successfully", {
        description: `Email sent to ${response.recipients || 'relevant'} students.`
      });
      resetForm();
      setTimeout(() => setResult(null), 8000);
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Failed to send announcement'
      });
      toast.error("Error sending announcement", {
        description: error.response?.data?.message || 'Failed to send announcement'
      });
    } finally {
      setAnnouncementLoading(false);
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
  
  // Check permissions
  if (!can.manageTransaction()) {
    return (
      <div className="container p-4 mx-auto">
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
      </div>
    );
  }
  
  return (
    <div className="container p-4 mx-auto">
      
      {result && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Alert className={`${result.success ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
            <div className="flex items-center">
              {result.success ? (
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2 text-red-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              )}
              <AlertTitle>{result.success ? 'Success' : 'Error'}</AlertTitle>
            </div>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        </motion.div>
      )}
      
      <Tabs defaultValue="announcements" className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="announcements" className="flex items-center">
            <Send className="w-4 h-4 mr-2" />
            <span>Payment Announcements</span>
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            <span>Manual Reminders</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-2" />
            <span>Automatic Schedule</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Payment Announcements Tab */}
        <TabsContent value="announcements">
          {/* Add this success/error message display */}
          

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
                              <SelectItem value="all">All Year Level</SelectItem>
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
                                  {section}
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
                    disabled={announcementLoading || !formData.feeId}
                    className="bg-rose-600 hover:bg-rose-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {announcementLoading ? 'Sending...' : 'Send Announcement'}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
        
        {/* Manual Reminders Tab */}
        <TabsContent value="reminders">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-amber-500" /> 
                  Payment Reminders
                </CardTitle>
                <CardDescription>
                  Send reminders to students with payments due in the next week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => triggerAction('reminders')} 
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600"
                >
                  {loading ? 'Sending...' : 'Send Payment Reminders'}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-rose-500" /> 
                  Overdue Notifications
                </CardTitle>
                <CardDescription>
                  Notify students with overdue payments that need immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => triggerAction('overdue')} 
                  disabled={loading}
                  className="w-full bg-rose-600 hover:bg-rose-700"
                >
                  {loading ? 'Sending...' : 'Send Overdue Notifications'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Automatic Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Automatic Email Schedule</CardTitle>
              <CardDescription>
                The system automatically sends emails based on this schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-3 border rounded-md bg-muted/50">
                  <CalendarDays className="w-5 h-5 mt-1 text-amber-500" />
                  <div>
                    <h3 className="font-medium">Weekly Payment Reminders</h3>
                    <p className="text-sm text-muted-foreground">
                      Sent automatically every Monday at 9:00 AM to students with payments due in the following week
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-3 border rounded-md bg-muted/50">
                  <Bell className="w-5 h-5 mt-1 text-rose-500" />
                  <div>
                    <h3 className="font-medium">Daily Overdue Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Sent automatically every day at 8:00 AM to students with overdue payments
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Email Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to send an email announcement to <span className="font-medium">{recipientCount}</span> students 
              {formData.program !== 'all' && <span> in <span className="font-medium">{getSelectedProgramName()}</span></span>}
              {formData.yearLevel !== 'all' && <span>, year <span className="font-medium">{formData.yearLevel}</span></span>}
              {formData.section !== 'all' && <span>, section <span className="font-medium">{formData.section}</span></span>}.
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
            <AlertDialogCancel disabled={announcementLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSubmit} 
              className="bg-rose-600 hover:bg-rose-700"
              disabled={announcementLoading}
            >
              {announcementLoading ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" cy="12" r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                      fill="none"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Emails
                </>
              )}
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
    </div>
  );
};

export default EmailManagement;