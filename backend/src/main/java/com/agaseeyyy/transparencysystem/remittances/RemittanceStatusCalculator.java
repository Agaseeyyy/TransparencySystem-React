package com.agaseeyyy.transparencysystem.remittances;

import java.time.Year;
import java.util.logging.Logger;

import org.springframework.stereotype.Service;

import com.agaseeyyy.transparencysystem.enums.RemittanceStatus;
import com.agaseeyyy.transparencysystem.payments.PaymentRepository;
import com.agaseeyyy.transparencysystem.students.StudentRepository;

/**
 * Service responsible for calculating the remittance status based on
 * the payment completion status of students in a class.
 */
@Service
public class RemittanceStatusCalculator {
    
    private static final Logger logger = Logger.getLogger(RemittanceStatusCalculator.class.getName());
    
    private final StudentRepository studentRepository;
    private final PaymentRepository paymentRepository;
    
    public RemittanceStatusCalculator(
            StudentRepository studentRepository,
            PaymentRepository paymentRepository) {
        this.studentRepository = studentRepository;
        this.paymentRepository = paymentRepository;
    }
    
    /**
     * Calculate the status of a remittance based on student payment completion
     * 
     * @param feeId The fee ID
     * @param programId The program ID
     * @param yearLevel The year level
     * @param section The section
     * @param hasRemittanceRecord Whether a remittance record exists
     * @return The appropriate RemittanceStatus (COMPLETED, PARTIAL, or NOT_REMITTED)
     */
    public RemittanceStatus calculateStatus(
            Integer feeId, 
            String programId, 
            Year yearLevel, 
            Character section,
            boolean hasRemittanceRecord) {
        
        // If there's no remittance record, return NOT_REMITTED
        if (!hasRemittanceRecord) {
            return RemittanceStatus.NOT_REMITTED;
        }
        
        // Count total students in the class
        long totalStudentsInClass = studentRepository.countByProgramProgramIdAndYearLevelAndSection(
                programId, yearLevel, section);
        
        // Count students who have paid for this fee
        long studentsWhoPaid = paymentRepository.countPaidStudentsByFeeAndClass(
                feeId, programId, yearLevel, section);
        
        // Log for debugging
        logger.info(String.format(
                "Remittance status calculation for fee %d in class %s-%s%s: %d of %d students paid",
                feeId, programId, yearLevel, section, studentsWhoPaid, totalStudentsInClass));
        
        // Determine status based on payment completion
        if (studentsWhoPaid == totalStudentsInClass) {
            return RemittanceStatus.COMPLETED;
        } else {
            return RemittanceStatus.PARTIAL;
        }
    }
} 
 
 