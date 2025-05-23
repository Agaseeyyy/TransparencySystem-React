package com.agaseeyyy.transparencysystem.email;

import com.agaseeyyy.transparencysystem.fees.FeeService;
import com.agaseeyyy.transparencysystem.fees.Fees;
import com.agaseeyyy.transparencysystem.payments.PaymentService;
import com.agaseeyyy.transparencysystem.students.Students;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.time.LocalDate;
import java.util.List;

@Service
public class SendEmailService {
  private static final Logger logger = LoggerFactory.getLogger(SendEmailService.class);
  
  @Autowired
  private JavaMailSender javaMailSender;
  
  @Autowired
  private FeeService feeService;
  
  @Autowired
  private PaymentService paymentService;
  
  @Value("${spring.mail.username}")
  private String fromEmailId;
  
  // Sends a simple email with better error handling and HTML support
  public boolean sendEmail(String to, String subject, String body) {
    try {
      logger.info("Attempting to send email to: {}", to);
      
      // Use MimeMessage for better formatting support
      MimeMessage message = javaMailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true);
      
      helper.setFrom(fromEmailId);
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(body, true); // Set to true for HTML content
      
      javaMailSender.send(message);
      logger.info("Email sent successfully to: {}", to);
      return true;
    } catch (MessagingException e) {
      logger.error("Failed to send email to: {}, reason: {}", to, e.getMessage());
      return false;
    } catch (Exception e) {
      logger.error("Unexpected error occurred while sending email: {}", e.getMessage());
      return false;
    }
  }

  // Send announcement about payment collection with HTML formatting
  public int sendPaymentAnnouncement(List<Students> students, Fees fee, 
                                   String location, LocalDate startDate, 
                                   LocalDate endDate) {
    String subject = "Payment Announcement: " + fee.getFeeType();
    int successCount = 0;
    
    logger.info("Sending payment announcement for fee: {} to {} students", fee.getFeeType(), students.size());
    
    for (Students student : students) {
      if (student.getEmail() == null || student.getEmail().isBlank()) {
        logger.warn("Student has no email address: {}, {}", student.getStudentId(), student.getLastName());
        continue;
      }
      
      // Build HTML email content
      String body = new StringBuilder()
          .append("<html><body>")
          .append("<h2>Payment Announcement</h2>")
          .append("<p>Dear ").append(student.getFirstName()).append(" ").append(student.getLastName()).append(",</p>")
          .append("<p>We would like to inform you about the upcoming payment collection:</p>")
          .append("<div style='background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;'>")
          .append("<p><b>Fee:</b> ").append(fee.getFeeType()).append("</p>")
          .append("<p><b>Amount:</b> ₱").append(fee.getAmount()).append("</p>")
          .append("<p><b>Collection period:</b> ").append(startDate).append(" to ").append(endDate).append("</p>")
          .append("<p><b>Location:</b> ").append(location).append("</p>")
          .append("</div>")
          .append("<p>Please bring the exact amount and your student ID.</p>")
          .append("<p>Thank you,<br>JPCS Office</p>")
          .append("</body></html>")
          .toString();
      
      if (sendEmail(student.getEmail(), subject, body)) {
        successCount++;
      }
    }
    
    logger.info("Successfully sent {} out of {} payment announcements", successCount, students.size());
    return successCount;
  }

  // Send payment reminder before due date
  public int sendPaymentReminder(Students student, Fees fee) {
    String subject = "Payment Reminder: " + fee.getFeeType();
    
    // Skip if student has no email
    if (student.getEmail() == null || student.getEmail().isBlank()) {
      logger.warn("Cannot send payment reminder - Student has no email address: {}, {}", 
                 student.getStudentId(), student.getLastName());
      return 0;
    }
    
    // HTML-formatted email
    String body = new StringBuilder()
        .append("<html><body>")
        .append("<h2>Payment Reminder</h2>")
        .append("<p>Dear ").append(student.getFirstName()).append(" ").append(student.getLastName()).append(",</p>")
        .append("<p>This is a friendly reminder about your upcoming payment.</p>")
        .append("<div style='background-color: #fff7e6; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #ffa500;'>")
        .append("<h3 style='margin-top: 0;'>Fee details:</h3>")
        .append("<p><b>Type:</b> ").append(fee.getFeeType()).append("</p>")
        .append("<p><b>Amount:</b> ₱").append(fee.getAmount()).append("</p>")
        .append("<p><b>Due date:</b> ").append(fee.getDueDate()).append("</p>")
        .append("</div>")
        .append("<p>Please ensure your payment is made before the due date.</p>")
        .append("<p>Thank you,<br>JPCS Office</p>")
        .append("</body></html>")
        .toString();
    
    return sendEmail(student.getEmail(), subject, body) ? 1 : 0;
  }
  
  // Send overdue payment notification to a student
  public int sendOverdueNotification(Students student, Fees fee) {
    String subject = "Overdue Payment: " + fee.getFeeType();
    
    // Skip if student has no email
    if (student.getEmail() == null || student.getEmail().isBlank()) {
      logger.warn("Cannot send overdue notification - Student has no email address: {}, {}", 
                 student.getStudentId(), student.getLastName());
      return 0;
    }
    
    int daysOverdue = LocalDate.now().compareTo(fee.getDueDate());
    
    // HTML-formatted email with warning colors
    String body = new StringBuilder()
        .append("<html><body>")
        .append("<h2 style='color: #cc0000;'>Overdue Payment Notice</h2>")
        .append("<p>Dear ").append(student.getFirstName()).append(" ").append(student.getLastName()).append(",</p>")
        .append("<p>This is a reminder that your payment for <b>").append(fee.getFeeType()).append("</b> is overdue.</p>")
        .append("<div style='background-color: #ffebeb; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #cc0000;'>")
        .append("<h3 style='margin-top: 0;'>Fee details:</h3>")
        .append("<p><b>Amount:</b> ₱").append(fee.getAmount()).append("</p>")
        .append("<p><b>Due date:</b> ").append(fee.getDueDate()).append("</p>")
        .append("<p><b>Days overdue:</b> ").append(daysOverdue).append("</p>")
        .append("</div>")
        .append("<p>Please settle this payment as soon as possible to avoid any complications.</p>")
        .append("<p>Thank you,<br>JPCS Office</p>")
        .append("</body></html>")
        .toString();
    
    return sendEmail(student.getEmail(), subject, body) ? 1 : 0;
  }
  
  // Daily scheduled task to check for overdue payments (runs at 8 AM)
  @Scheduled(cron = "0 0 8 * * ?")
  public void checkAndNotifyOverduePayments() {
    LocalDate today = LocalDate.now();
    logger.info("Running daily overdue payment check on {}", today);
    
    // Get all fees
    List<Fees> allFees = feeService.getFees();
    int emailsSent = 0;
    
    for (Fees fee : allFees) {
      // Check if fee is overdue
      if (fee.getDueDate().isBefore(today)) {
        logger.info("Processing overdue fee: {} (due on {})", fee.getFeeType(), fee.getDueDate());
        
        // Get students who haven't paid this fee
        List<Students> unpaidStudents = paymentService.findStudentsWhoHaventPaid(fee.getFeeId());
        logger.info("Found {} unpaid students for fee {}", unpaidStudents.size(), fee.getFeeId());
        
        for (Students student : unpaidStudents) {
            emailsSent += sendOverdueNotification(student, fee);
        }
      }
    }
    
    logger.info("Completed overdue payment check: {} notification emails sent", emailsSent);
  }

  // Weekly scheduled task to send payment reminders (runs every Monday at 9 AM)
  @Scheduled(cron = "0 0 9 * * MON")
  public void sendWeeklyReminders() {
    LocalDate today = LocalDate.now();
    LocalDate oneWeekLater = today.plusDays(7);
    logger.info("Running weekly payment reminders check on {}", today);
    
    // Get fees due in one week
    List<Fees> allFees = feeService.getFees();
    int emailsSent = 0;
    
    for (Fees fee : allFees) {
      if (fee.getDueDate().isEqual(oneWeekLater)) {
        logger.info("Processing upcoming fee: {} (due on {})", fee.getFeeType(), fee.getDueDate());
        
        // Get students who haven't paid this fee
        List<Students> unpaidStudents = paymentService.findStudentsWhoHaventPaid(fee.getFeeId());
        logger.info("Found {} unpaid students for fee {}", unpaidStudents.size(), fee.getFeeId());
        
        for (Students student : unpaidStudents) {
            emailsSent += sendPaymentReminder(student, fee);
        }
      }
    }
    
    logger.info("Completed weekly payment reminder: {} reminder emails sent", emailsSent);
  }
}
