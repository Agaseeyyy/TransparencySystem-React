-- Create expenses table for tracking JPCS office expenses
CREATE TABLE IF NOT EXISTS expenses (
    expense_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    expense_reference VARCHAR(50) UNIQUE NOT NULL,
    expense_title VARCHAR(255) NOT NULL,
    expense_category VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    expense_description TEXT,
    vendor_supplier VARCHAR(255),
    receipt_invoice_number VARCHAR(100),
    expense_date DATE NOT NULL,
    payment_date DATE,
    payment_method VARCHAR(50),
    expense_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_by_account_id BIGINT,
    approval_date DATETIME,
    approval_remarks TEXT,
    created_by_account_id BIGINT NOT NULL,
    department_id BIGINT,
    related_fee_id BIGINT,
    budget_allocation VARCHAR(100),
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurring_frequency VARCHAR(20),
    academic_year VARCHAR(10),
    semester VARCHAR(20),
    tax_amount DECIMAL(10, 2),
    net_amount DECIMAL(10, 2),
    receipt_file_path VARCHAR(500),
    tags VARCHAR(255),
    priority_level VARCHAR(20),
    is_emergency BOOLEAN NOT NULL DEFAULT FALSE,
    reimbursement_status VARCHAR(20),
    reimbursement_date DATE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_expenses_approved_by FOREIGN KEY (approved_by_account_id) REFERENCES accounts(account_id),
    CONSTRAINT fk_expenses_created_by FOREIGN KEY (created_by_account_id) REFERENCES accounts(account_id),
    CONSTRAINT fk_expenses_department FOREIGN KEY (department_id) REFERENCES departments(department_id),
    CONSTRAINT fk_expenses_fee FOREIGN KEY (related_fee_id) REFERENCES fees(fee_id),
    
    -- Check constraints
    CONSTRAINT chk_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_tax_amount_non_negative CHECK (tax_amount >= 0),
    CONSTRAINT chk_net_amount_positive CHECK (net_amount > 0),
    CONSTRAINT chk_expense_date_not_future CHECK (expense_date <= CURDATE())
);

-- Create indexes for better query performance
CREATE INDEX idx_expenses_category ON expenses(expense_category);
CREATE INDEX idx_expenses_status ON expenses(expense_status);
CREATE INDEX idx_expenses_approval_status ON expenses(approval_status);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_created_by ON expenses(created_by_account_id);
CREATE INDEX idx_expenses_department ON expenses(department_id);
CREATE INDEX idx_expenses_academic_year ON expenses(academic_year);
CREATE INDEX idx_expenses_amount ON expenses(amount);
CREATE INDEX idx_expenses_reference ON expenses(expense_reference);

-- Create view for expense summary and analytics
CREATE VIEW ExpenseSummaryView AS
SELECT 
    e.expense_category,
    COUNT(*) as total_expenses,
    SUM(e.amount) as total_amount,
    AVG(e.amount) as average_amount,
    MIN(e.amount) as min_amount,
    MAX(e.amount) as max_amount,
    SUM(CASE WHEN e.approval_status = 'APPROVED' THEN e.amount ELSE 0 END) as approved_amount,
    SUM(CASE WHEN e.approval_status = 'PENDING' THEN e.amount ELSE 0 END) as pending_amount,
    SUM(CASE WHEN e.approval_status = 'REJECTED' THEN e.amount ELSE 0 END) as rejected_amount,
    COUNT(CASE WHEN e.approval_status = 'APPROVED' THEN 1 END) as approved_count,
    COUNT(CASE WHEN e.approval_status = 'PENDING' THEN 1 END) as pending_count,
    COUNT(CASE WHEN e.approval_status = 'REJECTED' THEN 1 END) as rejected_count
FROM expenses e
GROUP BY e.expense_category;

-- Create view for monthly expense summary
CREATE VIEW MonthlyExpenseSummaryView AS
SELECT 
    YEAR(e.expense_date) as expense_year,
    MONTH(e.expense_date) as expense_month,
    MONTHNAME(e.expense_date) as month_name,
    e.expense_category,
    COUNT(*) as total_expenses,
    SUM(e.amount) as total_amount,
    AVG(e.amount) as average_amount
FROM expenses e
WHERE e.approval_status = 'APPROVED'
GROUP BY YEAR(e.expense_date), MONTH(e.expense_date), e.expense_category
ORDER BY expense_year DESC, expense_month DESC;

-- Create view for department expense summary
CREATE VIEW DepartmentExpenseSummaryView AS
SELECT 
    d.department_name,
    d.department_id,
    COUNT(e.expense_id) as total_expenses,
    SUM(e.amount) as total_amount,
    AVG(e.amount) as average_amount,
    SUM(CASE WHEN e.approval_status = 'APPROVED' THEN e.amount ELSE 0 END) as approved_amount,
    COUNT(CASE WHEN e.approval_status = 'APPROVED' THEN 1 END) as approved_count
FROM departments d
LEFT JOIN expenses e ON d.department_id = e.department_id
GROUP BY d.department_id, d.department_name;
