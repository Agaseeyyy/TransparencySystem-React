package com.agaseeyyy.transparencysystem.dto;

import java.util.List;
import java.util.Map;

import com.agaseeyyy.transparencysystem.expenses.Expenses.ExpenseCategory;

public class ExpenseSummaryDTO {
    
    private Double totalExpenses;
    private Double totalPaidExpenses;
    private Double totalPendingExpenses;
    private Integer totalExpenseCount;
    private Integer pendingApprovalCount;
    private Integer approvedCount;
    private Integer rejectedCount;
    private Integer paidCount;
    
    // Category breakdown
    private Map<ExpenseCategory, Double> expensesByCategory;
    private Map<ExpenseCategory, Integer> expenseCountByCategory;
    
    // Department breakdown
    private Map<String, Double> expensesByDepartment;
    private Map<String, Integer> expenseCountByDepartment;
    
    // Monthly breakdown
    private List<MonthlyExpenseData> monthlyExpenses;
    
    // Top categories
    private List<CategoryExpenseData> topCategories;
    
    // Academic year summary
    private String academicYear;
    private String semester;
    
    // Recent activity
    private List<ExpenseDTO> recentExpenses;
    private List<ExpenseDTO> pendingApprovals;
    private List<ExpenseDTO> expensesRequiringReview;
    
    // Constructor
    public ExpenseSummaryDTO() {}
    
    // Getters and Setters
    public Double getTotalExpenses() {
        return totalExpenses;
    }
    
    public void setTotalExpenses(Double totalExpenses) {
        this.totalExpenses = totalExpenses;
    }
    
    public Double getTotalPaidExpenses() {
        return totalPaidExpenses;
    }
    
    public void setTotalPaidExpenses(Double totalPaidExpenses) {
        this.totalPaidExpenses = totalPaidExpenses;
    }
    
    public Double getTotalPendingExpenses() {
        return totalPendingExpenses;
    }
    
    public void setTotalPendingExpenses(Double totalPendingExpenses) {
        this.totalPendingExpenses = totalPendingExpenses;
    }
    
    public Integer getTotalExpenseCount() {
        return totalExpenseCount;
    }
    
    public void setTotalExpenseCount(Integer totalExpenseCount) {
        this.totalExpenseCount = totalExpenseCount;
    }
    
    public Integer getPendingApprovalCount() {
        return pendingApprovalCount;
    }
    
    public void setPendingApprovalCount(Integer pendingApprovalCount) {
        this.pendingApprovalCount = pendingApprovalCount;
    }
    
    public Integer getApprovedCount() {
        return approvedCount;
    }
    
    public void setApprovedCount(Integer approvedCount) {
        this.approvedCount = approvedCount;
    }
    
    public Integer getRejectedCount() {
        return rejectedCount;
    }
    
    public void setRejectedCount(Integer rejectedCount) {
        this.rejectedCount = rejectedCount;
    }
    
    public Integer getPaidCount() {
        return paidCount;
    }
    
    public void setPaidCount(Integer paidCount) {
        this.paidCount = paidCount;
    }
    
    public Map<ExpenseCategory, Double> getExpensesByCategory() {
        return expensesByCategory;
    }
    
    public void setExpensesByCategory(Map<ExpenseCategory, Double> expensesByCategory) {
        this.expensesByCategory = expensesByCategory;
    }
    
    public Map<ExpenseCategory, Integer> getExpenseCountByCategory() {
        return expenseCountByCategory;
    }
    
    public void setExpenseCountByCategory(Map<ExpenseCategory, Integer> expenseCountByCategory) {
        this.expenseCountByCategory = expenseCountByCategory;
    }
    
    public Map<String, Double> getExpensesByDepartment() {
        return expensesByDepartment;
    }
    
    public void setExpensesByDepartment(Map<String, Double> expensesByDepartment) {
        this.expensesByDepartment = expensesByDepartment;
    }
    
    public Map<String, Integer> getExpenseCountByDepartment() {
        return expenseCountByDepartment;
    }
    
    public void setExpenseCountByDepartment(Map<String, Integer> expenseCountByDepartment) {
        this.expenseCountByDepartment = expenseCountByDepartment;
    }
    
    public List<MonthlyExpenseData> getMonthlyExpenses() {
        return monthlyExpenses;
    }
    
    public void setMonthlyExpenses(List<MonthlyExpenseData> monthlyExpenses) {
        this.monthlyExpenses = monthlyExpenses;
    }
    
    public List<CategoryExpenseData> getTopCategories() {
        return topCategories;
    }
    
    public void setTopCategories(List<CategoryExpenseData> topCategories) {
        this.topCategories = topCategories;
    }
    
    public String getAcademicYear() {
        return academicYear;
    }
    
    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }
    
    public String getSemester() {
        return semester;
    }
    
    public void setSemester(String semester) {
        this.semester = semester;
    }
    
    public List<ExpenseDTO> getRecentExpenses() {
        return recentExpenses;
    }
    
    public void setRecentExpenses(List<ExpenseDTO> recentExpenses) {
        this.recentExpenses = recentExpenses;
    }
    
    public List<ExpenseDTO> getPendingApprovals() {
        return pendingApprovals;
    }
    
    public void setPendingApprovals(List<ExpenseDTO> pendingApprovals) {
        this.pendingApprovals = pendingApprovals;
    }
    
    public List<ExpenseDTO> getExpensesRequiringReview() {
        return expensesRequiringReview;
    }
    
    public void setExpensesRequiringReview(List<ExpenseDTO> expensesRequiringReview) {
        this.expensesRequiringReview = expensesRequiringReview;
    }
    
    // Inner classes for structured data
    public static class MonthlyExpenseData {
        private Integer year;
        private Integer month;
        private String monthName;
        private Double totalAmount;
        private Integer count;
        
        public MonthlyExpenseData() {}
        
        public MonthlyExpenseData(Integer year, Integer month, String monthName, Double totalAmount, Integer count) {
            this.year = year;
            this.month = month;
            this.monthName = monthName;
            this.totalAmount = totalAmount;
            this.count = count;
        }
        
        // Getters and Setters
        public Integer getYear() { return year; }
        public void setYear(Integer year) { this.year = year; }
        
        public Integer getMonth() { return month; }
        public void setMonth(Integer month) { this.month = month; }
        
        public String getMonthName() { return monthName; }
        public void setMonthName(String monthName) { this.monthName = monthName; }
        
        public Double getTotalAmount() { return totalAmount; }
        public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
        
        public Integer getCount() { return count; }
        public void setCount(Integer count) { this.count = count; }
    }
    
    public static class CategoryExpenseData {
        private ExpenseCategory category;
        private String categoryName;
        private Double totalAmount;
        private Integer count;
        private Double percentage;
        
        public CategoryExpenseData() {}
        
        public CategoryExpenseData(ExpenseCategory category, String categoryName, Double totalAmount, Integer count, Double percentage) {
            this.category = category;
            this.categoryName = categoryName;
            this.totalAmount = totalAmount;
            this.count = count;
            this.percentage = percentage;
        }
        
        // Getters and Setters
        public ExpenseCategory getCategory() { return category; }
        public void setCategory(ExpenseCategory category) { this.category = category; }
        
        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
        
        public Double getTotalAmount() { return totalAmount; }
        public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
        
        public Integer getCount() { return count; }
        public void setCount(Integer count) { this.count = count; }
        
        public Double getPercentage() { return percentage; }
        public void setPercentage(Double percentage) { this.percentage = percentage; }
    }
}
