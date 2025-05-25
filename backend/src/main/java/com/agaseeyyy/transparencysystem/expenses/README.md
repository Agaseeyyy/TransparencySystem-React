# Expense Tracking System Documentation

## Overview
The Expense Tracking System is a comprehensive module for the JPCS Transparency System that enables tracking, approval, and reporting of office expenses. This system is designed to improve financial transparency and provide accurate auditing capabilities.

## Features

### Core Features
1. **Expense Management**
   - Create, update, delete expenses
   - Track expense details (vendor, amount, category, etc.)
   - Support for recurring expenses
   - File attachment support for receipts/invoices

2. **Approval Workflow**
   - Multi-level approval process
   - Approval/rejection with remarks
   - Email notifications for approvals
   - Role-based approval authority

3. **Financial Tracking**
   - Real-time expense monitoring
   - Budget allocation tracking
   - Tax calculation (inclusive/exclusive)
   - Payment method tracking

4. **Transparency & Reporting**
   - Public expense reports
   - Category-wise breakdowns
   - Monthly/yearly summaries
   - Department-wise expenses

5. **Dashboard Analytics**
   - Visual charts and graphs
   - Expense trends analysis
   - Top spending categories
   - Real-time KPIs

## Database Schema

### Expenses Table
```sql
CREATE TABLE expenses (
    expense_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    expense_reference VARCHAR(50) UNIQUE NOT NULL,
    expense_title VARCHAR(255) NOT NULL,
    expense_category VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_description TEXT,
    vendor_supplier VARCHAR(255),
    receipt_invoice_number VARCHAR(100),
    expense_date DATE NOT NULL,
    payment_date DATE,
    payment_method VARCHAR(50),
    expense_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_by_account_id INT,
    approval_date DATETIME,
    approval_remarks TEXT,
    created_by_account_id INT NOT NULL,
    department_id VARCHAR(10),
    related_fee_id INT,
    budget_allocation VARCHAR(100),
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurring_frequency VARCHAR(20),
    academic_year VARCHAR(10),
    semester VARCHAR(20),
    documentation_path VARCHAR(500),
    tax_amount DECIMAL(10,2),
    is_tax_inclusive BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    remarks TEXT,
    
    FOREIGN KEY (created_by_account_id) REFERENCES accounts(account_id),
    FOREIGN KEY (approved_by_account_id) REFERENCES accounts(account_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (related_fee_id) REFERENCES fees(fee_id)
);
```

## Entity Structure

### Expenses Entity
The main entity with comprehensive expense tracking capabilities:

#### Key Fields
- `expenseId`: Primary key
- `expenseReference`: Unique reference number (auto-generated)
- `expenseTitle`: Brief description of the expense
- `expenseCategory`: Categorized expense type (enum)
- `amount`: Expense amount
- `expenseStatus`: Current status (PENDING, PAID, CANCELLED, etc.)
- `approvalStatus`: Approval workflow status

#### Relationships
- `createdByAccount`: ManyToOne relationship with Accounts
- `approvedByAccount`: ManyToOne relationship with Accounts
- `department`: ManyToOne relationship with Departments
- `relatedFee`: ManyToOne relationship with Fees

#### Enumerations
1. **ExpenseCategory**: 21 categories including OFFICE_SUPPLIES, UTILITIES, MAINTENANCE, etc.
2. **ExpenseStatus**: PENDING, PAID, CANCELLED, REFUNDED, DISPUTED
3. **ApprovalStatus**: PENDING, APPROVED, REJECTED, REQUIRES_REVIEW
4. **PaymentMethod**: CASH, CHECK, BANK_TRANSFER, CREDIT_CARD, etc.
5. **RecurringFrequency**: DAILY, WEEKLY, MONTHLY, QUARTERLY, etc.

## API Endpoints

### Expense Management
- `POST /api/expenses` - Create new expense
- `GET /api/expenses` - Get all expenses (with filtering and pagination)
- `GET /api/expenses/{id}` - Get expense by ID
- `GET /api/expenses/reference/{reference}` - Get expense by reference
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

### Approval Workflow
- `POST /api/expenses/{id}/approve` - Approve expense
- `POST /api/expenses/{id}/reject` - Reject expense
- `POST /api/expenses/{id}/pay` - Mark expense as paid
- `GET /api/expenses/pending-approval` - Get pending approval expenses

### Analytics & Reporting
- `GET /api/expenses/analytics/by-category` - Total expenses by category
- `GET /api/expenses/analytics/monthly` - Monthly expenses summary
- `GET /api/expenses/analytics/academic-year/{year}` - Total for academic year
- `GET /api/expenses/analytics/department/{id}` - Total by department
- `GET /api/expenses/analytics/top-categories` - Top expense categories

### Transparency
- `GET /api/expenses/transparency/report` - Generate transparency report

### Utility Endpoints
- `GET /api/expenses/categories` - Get all expense categories
- `GET /api/expenses/statuses` - Get all expense statuses
- `GET /api/expenses/generate-reference` - Generate unique reference

## Service Layer

### ExpenseService
Main business logic service with the following key methods:

#### Expense Management
- `createExpense()`: Creates new expense with validation
- `updateExpense()`: Updates existing expense with business rules
- `deleteExpense()`: Soft delete with validation
- `generateExpenseReference()`: Auto-generates unique reference

#### Approval Workflow
- `approveExpense()`: Handles approval with authority validation
- `rejectExpense()`: Handles rejection with remarks
- `markAsPaid()`: Updates payment status

#### Analytics
- `getTotalExpensesByCategory()`: Category-wise totals
- `getMonthlyExpensesSummary()`: Monthly breakdown
- `generateTransparencyReport()`: Comprehensive transparency report

## Repository Layer

### ExpenseRepository
JPA repository with custom queries for:

#### Basic Operations
- Standard CRUD operations via JpaRepository
- Specification-based filtering via JpaSpecificationExecutor

#### Custom Queries
- Financial calculations (totals by category, department, date range)
- Dashboard analytics queries
- Transparency reporting queries
- Audit trail queries

#### Query Examples
```java
// Get total expenses by category
@Query("SELECT SUM(e.amount) FROM Expenses e WHERE e.expenseCategory = :category AND e.expenseStatus = 'PAID'")
Double getTotalExpensesByCategory(@Param("category") ExpenseCategory category);

// Get monthly summary
@Query("SELECT YEAR(e.expenseDate), MONTH(e.expenseDate), SUM(e.amount) FROM Expenses e WHERE e.expenseStatus = 'PAID' GROUP BY YEAR(e.expenseDate), MONTH(e.expenseDate)")
List<Object[]> getMonthlyExpensesSummary();
```

## Specification Pattern

### ExpenseSpecification
Dynamic query building using JPA Criteria API for:

#### Filtering Capabilities
- Category, status, approval status filtering
- Date range filtering
- Amount range filtering
- Department and user filtering
- Text search across multiple fields

#### Complex Queries
- Multi-criteria filtering
- Join-based filtering
- Dynamic specification building

## Security & Authorization

### Role-Based Access
1. **Admin**: Full access to all expenses
2. **Org_Treasurer**: Can approve/reject expenses, view all
3. **Class_Treasurer**: Can create expenses, view own expenses

### Business Rules
1. Only approved expenses can be marked as paid
2. Paid expenses cannot be modified or deleted
3. Only authorized roles can approve/reject expenses
4. Expense reference numbers are auto-generated and unique

## Data Transfer Objects (DTOs)

### ExpenseDTO
Simplified expense representation for frontend:
- All expense fields
- Related entity information (names instead of IDs)
- Calculated fields (total amount, net amount)

### ExpenseSummaryDTO
Dashboard summary with:
- Aggregate statistics
- Category breakdowns
- Monthly trends
- Recent activity

## Integration Points

### Existing System Integration
1. **Accounts**: User management and approval workflow
2. **Departments**: Departmental expense allocation
3. **Fees**: Linking expenses to fee collections
4. **Students**: Indirect relationship through accounts

### External Integrations
1. **Email Service**: Approval notifications
2. **File Storage**: Receipt/invoice attachments
3. **Reporting Service**: PDF generation for reports

## Usage Examples

### Creating an Expense
```java
// Create new expense
Expenses expense = new Expenses();
expense.setExpenseTitle("Office Supplies Purchase");
expense.setExpenseCategory(ExpenseCategory.OFFICE_SUPPLIES);
expense.setAmount(1500.00);
expense.setExpenseDate(LocalDate.now());
expense.setVendorSupplier("ABC Supplies Inc.");

// Save via service
Expenses created = expenseService.createExpense(expense, createdByAccountId);
```

### Approving an Expense
```java
// Approve expense
Expenses approved = expenseService.approveExpense(
    expenseId, 
    approverAccountId, 
    "Approved for office supplies budget"
);
```

### Generating Reports
```java
// Generate transparency report
Map<String, Object> report = expenseService.generateTransparencyReport(
    "2024-2025", 
    "First Semester"
);
```

## Frontend Integration

### React Components
Recommended components for frontend:
1. **ExpenseList**: Paginated expense listing with filters
2. **ExpenseForm**: Create/edit expense form
3. **ExpenseDetail**: Detailed expense view
4. **ApprovalQueue**: Pending approvals management
5. **ExpenseDashboard**: Analytics and charts
6. **TransparencyReport**: Public expense reports

### State Management
Use React Query or Redux for:
- Expense data caching
- Real-time updates
- Optimistic updates

## Testing Strategy

### Unit Tests
- Service layer business logic
- Repository custom queries
- Specification building
- DTO mappings

### Integration Tests
- API endpoint testing
- Database integration
- Role-based access control
- Approval workflow

### End-to-End Tests
- Complete expense lifecycle
- Multi-user approval scenarios
- Reporting functionality

## Performance Considerations

### Database Optimization
1. Indexes on frequently queried fields
2. Pagination for large datasets
3. Efficient join queries
4. Caching for analytics

### API Optimization
1. DTO projections for large datasets
2. Lazy loading for relationships
3. Response compression
4. API rate limiting

## Deployment & Configuration

### Environment Variables
```properties
# Database configuration
spring.datasource.url=jdbc:mysql://localhost:3306/transparency_system
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# File upload configuration
expense.file.upload.path=${EXPENSE_UPLOAD_PATH:/uploads/expenses}
expense.file.max.size=10MB

# Email configuration (for notifications)
spring.mail.host=${MAIL_HOST}
spring.mail.port=${MAIL_PORT}
```

### Docker Configuration
```dockerfile
# Application configuration
COPY target/transparency-system.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

## Future Enhancements

### Planned Features
1. **Automated Recurring Expenses**: Auto-generation based on frequency
2. **Budget Management**: Budget limits and alerts
3. **Mobile App**: Mobile expense reporting
4. **AI-Powered Analytics**: Predictive spending analysis
5. **Integration APIs**: Third-party accounting software integration

### Technical Improvements
1. **Microservices**: Split into separate expense service
2. **Event Sourcing**: Complete audit trail
3. **Real-time Updates**: WebSocket notifications
4. **Advanced Security**: OAuth2 integration

## Support & Maintenance

### Monitoring
1. Application logs for expense operations
2. Database performance monitoring
3. API response time tracking
4. Error rate monitoring

### Backup Strategy
1. Daily database backups
2. File attachment backups
3. Configuration backups
4. Disaster recovery procedures

## Conclusion

The Expense Tracking System provides a comprehensive solution for managing JPCS office expenses with full transparency and audit capabilities. The system is designed to be scalable, secure, and user-friendly while maintaining strict financial controls and approval workflows.

For additional support or feature requests, please contact the development team or refer to the project's issue tracking system.
