package com.agaseeyyy.transparencysystem.remittances;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;

import jakarta.persistence.*;

import com.agaseeyyy.transparencysystem.accounts.Accounts;
import com.agaseeyyy.transparencysystem.remittances.RemittanceStatus;
import com.agaseeyyy.transparencysystem.fees.Fees;
import com.agaseeyyy.transparencysystem.payments.Payments;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "remittances")
@JsonIgnoreProperties({"account", "fee", "hibernateLazyInitializer", "handler"})
public class Remittances {
    @Id
    @Column(name = "remittance_id", columnDefinition = "VARCHAR(40)")
    private String remittanceId;

    @ManyToOne
    @JoinColumn(name = "fee_id", nullable = false)
    private Fees fee;

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Accounts account;

    @Column(name = "amount_remitted", nullable = false, precision = 10, scale = 2)
    private BigDecimal amountRemitted;

    @Enumerated(EnumType.STRING)    
    @Column(name = "status", nullable = false)
    private RemittanceStatus status = RemittanceStatus.PARTIAL;

    @Column(name = "remittance_date", nullable = false)
    private LocalDate remittanceDate = LocalDate.now();

    @OneToMany
    @JoinTable(
        name = "remittance_payments",
        joinColumns = @JoinColumn(name = "remittance_id"),
        inverseJoinColumns = @JoinColumn(name = "payment_id")
    )
    private List<Payments> payments;

    // Constructors
    public Remittances() {}

    // Getters and Setters
    public String getRemittanceId() {
        return remittanceId;
    }

    public void setRemittanceId(String remittanceId) {
        this.remittanceId = remittanceId;
    }

    @JsonProperty("feeType")
    public String getFeeType() {
        return fee != null ? fee.getFeeType() : null;
    }

    public Fees getFee() {
        return fee;
    }

    public void setFee(Fees fee) {
        this.fee = fee;
    }

    @JsonProperty("accountId")
    public Integer getAccountId() {
        return account != null ? account.getAccountId() : null;
    }

    @JsonProperty("lastName")
    public String getRemittedFor() {
        return account != null ? account.getLastName() : null;
    }
    
    @JsonProperty("firstName")
    public String getRemittedBy() {
        return account != null ? account.getFirstName() : null;
    }

    @JsonProperty("middleInitial")
    public Character getMiddleInitial() {
        return account != null ? account.getMiddleInitial() : null;
    }

    @JsonProperty("yearLevel")
    public Year getYearLevel() {
        return account != null ? account.getStudent().getYearLevel() : null;
    }

    @JsonProperty("section") 
    public Character getSection() {
        return account != null ? account.getStudent().getSection() : null;
    }

    @JsonProperty("programCode")
    public String getProgram() {
        return account != null ? account.getStudent().getProgramId() : null;
    }

    public Accounts getAccount() {
        return account;
    }

    public void setAccount(Accounts account) {
        this.account = account;
    }

    public BigDecimal getAmountRemitted() {
        return amountRemitted;
    }

    public void setAmountRemitted(BigDecimal amountRemitted) {
        this.amountRemitted = amountRemitted;
    }

    public RemittanceStatus getStatus() {
        return status;
    }

    public void setStatus(RemittanceStatus status) {
        this.status = status;
    }

    public LocalDate getRemittanceDate() {
        return remittanceDate;
    }

    public void setRemittanceDate(LocalDate remittanceDate) {
        this.remittanceDate = remittanceDate;
    }

    public List<Payments> getPayments() {
        return payments;
    }

    public void setPayments(List<Payments> payments) {
        this.payments = payments;
    }
}
