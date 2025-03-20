package com.agaseeyyy.transparencysystem.remittances;

import java.time.LocalDate;
import jakarta.persistence.*;

import com.agaseeyyy.transparencysystem.fees.Fees;
import com.agaseeyyy.transparencysystem.users.Users;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "remittances")
@JsonIgnoreProperties({"user", "fee"})
public class Remittances {
    @Id
    @Column(name = "remittance_id", columnDefinition = "VARCHAR(40)")
    private String remittanceId;

    @ManyToOne
    @JoinColumn(name = "fee_id", nullable = false)
    private Fees fee;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Column(name = "amount_remitted", nullable = false)
    private Double amountRemitted;

    @Column(name = "status", nullable = false)
    private Boolean status = true;

    @Column(name = "remittance_date", nullable = false)
    private LocalDate remittanceDate = LocalDate.now();

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

    @JsonProperty("lastName")
    public String getRemittedFor() {
        return user != null ? user.getLastName() : null;
    }
    
    @JsonProperty("firstName")
    public String getRemittedBy() {
        return user != null ? user.getFirstName() : null;
    }

    @JsonProperty("middleInitial")
    public Character getMiddleInitial() {
        return user != null ? user.getMiddleInitial() : null;
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

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public LocalDate getRemittanceDate() {
        return remittanceDate;
    }

    public void setRemittanceDate(LocalDate remittanceDate) {
        this.remittanceDate = remittanceDate;
    }
}
