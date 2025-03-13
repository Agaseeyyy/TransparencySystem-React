package com.agaseeyyy.transparencysystem.remittances;

import java.time.LocalDate;
import jakarta.persistence.*;
import com.agaseeyyy.transparencysystem.payments.Payments;
import com.agaseeyyy.transparencysystem.users.Users;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "remittances")
public class Remittances {
    @Id
    @Column(name = "remittance_id", columnDefinition = "VARCHAR(40)")
    private String remittanceId;

    @ManyToOne
    @JoinColumn(name = "payment_id", nullable = false)
    private Payments payment;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Column(name = "amount_remitted", nullable = false)
    private Double amountRemitted;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "remittance_date", nullable = false)
    private LocalDate remittanceDate = LocalDate.now();

    // Enum for Status
    public enum Status {
        Completed, Pending, Overdue
    }

    // Constructors
    public Remittances() {}

    // Getters and Setters
    public String getRemittanceId() {
        return remittanceId;
    }

    public void setRemittanceId(String remittanceId) {
        this.remittanceId = remittanceId;
    }

    @JsonProperty("paymentId")
    public String getPaymentId() {
        return payment != null ? payment.getPaymentId() : null;
    }

    public Payments getPayment() {
        return payment;
    }

    public void setPayment(Payments payment) {
        this.payment = payment;
    }

    @JsonProperty("userId")
    public Integer getUserId() {
        return user != null ? user.getUserId() : null;
    }

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public Double getAmountRemitted() {
        return amountRemitted;
    }

    public void setAmountRemitted(Double amountRemitted) {
        this.amountRemitted = amountRemitted;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDate getRemittanceDate() {
        return remittanceDate;
    }

    public void setRemittanceDate(LocalDate remittanceDate) {
        this.remittanceDate = remittanceDate;
    }
}
