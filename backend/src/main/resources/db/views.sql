DROP VIEW IF EXISTS FeeSummaryView;

CREATE VIEW FeeSummaryView AS 
SELECT f.fee_id, f.fee_type, f.description, f.amount as fee_amount, 
    COALESCE(SUM(f.amount), 0) AS total_collected, -- Changed from p.amount to f.amount
    COALESCE((SELECT SUM(r.amount_remitted) FROM remittances r WHERE r.fee_id = f.fee_id), 0) AS total_remitted, 
    COUNT(p.payment_id) AS total_payments, 
    COALESCE(COUNT(p.payment_id) * f.amount, 0) - -- Changed calculation to use fee amount * payment count
    COALESCE((SELECT SUM(r.amount_remitted) FROM remittances r WHERE r.fee_id = f.fee_id), 0) AS remaining_balance, 
    CASE 
        WHEN f.amount > 0 THEN ROUND(COALESCE(COUNT(p.payment_id) * f.amount / f.amount * 100, 0), 1) -- Updated calculation
        ELSE 0 
    END AS collection_rate_value, 
    CASE 
        WHEN f.amount > 0 THEN CONCAT(ROUND(COALESCE(COUNT(p.payment_id), 0) * 100 / 
            (SELECT COUNT(*) FROM students WHERE status = 'Active'), 1), '%') -- Use percentage of students who paid
        ELSE '0%' 
    END AS collection_rate 
FROM fees f 
LEFT JOIN payments p ON f.fee_id = p.fee_id AND p.status = 'Paid' -- Only consider paid payments
GROUP BY f.fee_id, f.fee_type, f.description, f.amount;

DROP VIEW IF EXISTS ProgramSummaryView;

CREATE VIEW ProgramSummaryView AS 
SELECT p.program_id, p.program_name, 
    COUNT(DISTINCT pay.payment_id) AS total_payments, 
    IFNULL(SUM(f.amount), 0) AS total_collected, -- Changed from py.amount to f.amount 
    IFNULL((SELECT SUM(r.amount_remitted) FROM remittances r 
            JOIN payments p2 ON r.fee_id = p2.fee_id 
            JOIN students s2 ON p2.student_id = s2.student_id 
            WHERE s2.program_id = p.program_id), 0) AS total_remitted 
FROM programs p 
LEFT JOIN students s ON p.program_id = s.program_id 
LEFT JOIN payments pay ON s.student_id = pay.student_id AND pay.status = 'Paid' -- Only consider paid payments
LEFT JOIN fees f ON pay.fee_id = f.fee_id -- Join with fees to get the amount
GROUP BY p.program_id, p.program_name;

DROP VIEW IF EXISTS RecentRemittancesView;

CREATE VIEW RecentRemittancesView AS 
SELECT r.remittance_id, r.remittance_date, 
       CASE 
         WHEN s.student_id IS NOT NULL THEN CONCAT(COALESCE(s.first_name, ''), ' ', COALESCE(s.last_name, ''))
         ELSE 'Admin User'
       END AS remitted_by,
       f.fee_type, r.amount_remitted, r.status 
FROM remittances r 
JOIN fees f ON r.fee_id = f.fee_id 
JOIN accounts a ON r.account_id = a.account_id 
LEFT JOIN students s ON a.student_id = s.student_id
ORDER BY r.remittance_date DESC;








SELECT r.remittance_id, r.remittance_date, 
       CASE 
         WHEN s.student_id IS NOT NULL THEN CONCAT(COALESCE(s.first_name, ''), ' ', COALESCE(s.last_name, ''))
         ELSE 'Admin User'
       END AS remitted_by,
       f.fee_type, r.amount_remitted, r.status 
FROM remittances r 
JOIN fees f ON r.fee_id = f.fee_id 
JOIN accounts a ON r.account_id = a.account_id 
LEFT JOIN students s ON a.student_id = s.student_id
ORDER BY r.remittance_date DESC;
