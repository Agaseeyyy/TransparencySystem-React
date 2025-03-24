package com.agaseeyyy.transparencysystem.services;

import com.agaseeyyy.transparencysystem.fees.FeeService;
import com.agaseeyyy.transparencysystem.payments.PaymentService;
import com.agaseeyyy.transparencysystem.remittances.RemittanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TransparencyService {
    
    private final FeeService feeService;
    private final PaymentService paymentService;
    private final RemittanceService remittanceService;
    
    public TransparencyService(
            FeeService feeService,
            PaymentService paymentService,
            RemittanceService remittanceService) {
        this.feeService = feeService;
        this.paymentService = paymentService;
        this.remittanceService = remittanceService;
    }
    
    // Public methods for both public and authenticated users
    public List<Map<String, Object>> getPublicFeeSummary() {
        List<Map<String, Object>> result = new ArrayList<>();
        
        // Get all fees
        feeService.getAllFees().forEach(fee -> {
            Map<String, Object> feeData = new HashMap<>();
            feeData.put("feeId", fee.getFeeId());
            feeData.put("feeType", fee.getFeeType());
            feeData.put("description", fee.getDescription());
            feeData.put("totalAmount", fee.getAmount());
            
            // Calculate totals from payments
            double collected = paymentService.calculateTotalCollectedByFeeType(fee.getFeeId());
            double remitted = remittanceService.calculateTotalRemittedByFeeType(fee.getFeeId());
            
            feeData.put("amountCollected", collected);
            feeData.put("amountRemitted", remitted);
            
            result.add(feeData);
        });
        
        return result;
    }
    
    public List<Map<String, Object>> getPublicRemittanceSummary() {
        List<Map<String, Object>> result = new ArrayList<>();
        
        // Get recent remittances with summarized data
        remittanceService.getRecentRemittances().forEach(remittance -> {
            Map<String, Object> remittanceData = new HashMap<>();
            remittanceData.put("remittanceId", remittance.getRemittanceId());
            remittanceData.put("feeType", remittance.getFee().getFeeType());
            remittanceData.put("amount", remittance.getAmountRemitted());
            remittanceData.put("remittanceDate", remittance.getRemittanceDate());
            remittanceData.put("program", remittance.getUser().getProgram());
            
            result.add(remittanceData);
        });
        
        return result;
    }
    
    // Admin-only methods
    public List<Map<String, Object>> getAdminFeeSummary() {
        List<Map<String, Object>> publicData = getPublicFeeSummary();
        
        // Add administrative data to the public data
        publicData.forEach(feeData -> {
            double totalAmount = (Double) feeData.get("totalAmount");
            double collected = (Double) feeData.get("amountCollected");
            double remitted = (Double) feeData.get("amountRemitted");
            
            feeData.put("expectedCollection", totalAmount * 1.1); // Example calculation
            feeData.put("collectionProgress", collected > 0 ? (collected / totalAmount) * 100 : 0);
            feeData.put("remittanceProgress", collected > 0 ? (remitted / collected) * 100 : 0);
            feeData.put("pendingRemittance", collected - remitted);
        });
        
        return publicData;
    }
}