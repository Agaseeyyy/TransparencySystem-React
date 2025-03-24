package com.agaseeyyy.transparencysystem.email;

import com.agaseeyyy.transparencysystem.fees.FeeService;
import com.agaseeyyy.transparencysystem.fees.Fees;
import com.agaseeyyy.transparencysystem.payments.PaymentService;
import com.agaseeyyy.transparencysystem.students.Students;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class SendEmailService {
  @Autowired
  private JavaMailSender javaMailSender;
  @Autowired
  private FeeService feeService;
  @Autowired
  private PaymentService paymentService;
  

  @Value("${spring.mail.username}")
  private String fromEmailId;
  
  // Sends a simple email
  public void sendEmail(String to, String subject, String body) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(fromEmailId);
    message.setTo(to);
    message.setSubject(subject);
    message.setText(body);
    
    javaMailSender.send(message);
    System.out.println("Email sent to: " + to);
  }

  // Send announcement about payment collection
  public void sendPaymentAnnouncement(List<Students> students, Fees fee, 
                                      String location, LocalDate startDate, 
                                      LocalDate endDate) {
    String subject = "Payment Announcement: " + fee.getFeeType();
    
    for (Students student : students) {
      StringBuilder body = new StringBuilder();
      body.append("Dear ").append(student.getFirstName()).append(" ").append(student.getLastName()).append(",\n\n");
      body.append("We would like to inform you about the upcoming payment collection:\n\n");
      body.append("Fee: ").append(fee.getFeeType()).append("\n");
      body.append("Amount: ₱").append(fee.getAmount()).append("\n");
      body.append("Collection period: ").append(startDate).append(" to ").append(endDate).append("\n");
      body.append("Location: ").append(location).append("\n\n");
      body.append("Please bring the exact amount and your student ID.\n\n");
      body.append("Thank you,\nJPCS Office");
      
      sendEmail(student.getEmail(), subject, body.toString());
    }
  }

  // Send payment reminder before due date
  public void sendPaymentReminder(Students student, Fees fee) {
    String subject = "Payment Reminder: " + fee.getFeeType();
    
    StringBuilder body = new StringBuilder();
    body.append("Dear ").append(student.getFirstName()).append(" ").append(student.getLastName()).append(",\n\n");
    body.append("This is a friendly reminder about your upcoming payment.\n\n");
    body.append("Fee details:\n");
    body.append("- Type: ").append(fee.getFeeType()).append("\n");
    body.append("- Amount: ₱").append(fee.getAmount()).append("\n");
    body.append("- Due date: ").append(fee.getDueDate()).append("\n\n");
    body.append("Please ensure your payment is made before the due date.\n\n");
    body.append("Thank you,\nJPCS Office");
    
    sendEmail(student.getEmail(), subject, body.toString());
  }
  
  // Send overdue payment notification to a student
  public void sendOverdueNotification(Students student, Fees fee) {
    String subject = "Overdue Payment:  " + fee.getFeeType();
    
    StringBuilder body = new StringBuilder();
    body.append("Dear ").append(student.getFirstName()).append(" ").append(student.getLastName()).append(",\n\n");
    body.append("This is a reminder that your payment for ").append(fee.getFeeType()).append(" is overdue.\n\n");
    body.append("Fee details:\n");
    body.append("- Amount: ₱").append(fee.getAmount()).append("\n");
    body.append("- Due date: ").append(fee.getDueDate()).append("\n");
    body.append("- Days overdue: ").append(LocalDate.now().compareTo(fee.getDueDate())).append("\n\n");
    body.append("Please settle this payment as soon as possible to avoid any complications.\n\n");
    body.append("Thank you,\nJPCS Office");
    
    sendEmail(student.getEmail(), subject, body.toString());
  }
  
  // Daily scheduled task to check for overdue payments (runs at 8 AM)
  @Scheduled(cron = "0 0 8 * * ?")
  public void checkAndNotifyOverduePayments() {
    LocalDate today = LocalDate.now();
    
    // Get all fees
    List<Fees> allFees = feeService.getAllFees();
    
    for (Fees fee : allFees) {
      // Check if fee is overdue
      if (fee.getDueDate().isBefore(today)) {
        // Get students who haven't paid this fee
        List<Students> unpaidStudents = paymentService.findStudentsWhoHaventPaid(fee.getFeeId());
        
        for (Students student : unpaidStudents) {
            sendOverdueNotification(student, fee);
        }
      }
    }
  }

  // Weekly scheduled task to send payment reminders (runs every Monday at 9 AM)
  @Scheduled(cron = "0 0 9 * * MON")
  public void sendWeeklyReminders() {
    LocalDate today = LocalDate.now();
    LocalDate oneWeekLater = today.plusDays(7);
    
    // Get fees due in one week
    List<Fees> allFees = feeService.getAllFees();
    
    for (Fees fee : allFees) {
      if (fee.getDueDate().isEqual(oneWeekLater)) {
        // Get students who haven't paid this fee
        List<Students> unpaidStudents = paymentService.findStudentsWhoHaventPaid(fee.getFeeId());
        
        for (Students student : unpaidStudents) {
            sendPaymentReminder(student, fee);
        }
      }
    }
  }
}
