package com.agaseeyyy.transparencysystem.events;

import java.time.LocalDate;

import jakarta.persistence.*;

@Entity
@Table(name = "events")
public class Event {
  @Id
  private Integer eventId;

  @Column(name = "event_name", nullable = false)
  private String eventName;

  @Column(name = "amount_due", nullable = false)
  private Double amountDue;

  @Column(name = "due_date", nullable = false)
  private LocalDate dueDate;

  @Column(name = "created_at", nullable = false)
  private LocalDate createdAt = LocalDate.now();

  // Constructors
  public Event() {
  }

  public Event(Integer eventId, String eventName, Double amountDue, LocalDate dueDate) {
    this.eventId = eventId;
    this.eventName = eventName;
    this.amountDue = amountDue;
    this.dueDate = dueDate;
  }

  // Getters and Setters
  public Integer getEventId() {
    return this.eventId;
  }

  public void setEventId(Integer eventId) {
    this.eventId = eventId;
  }

  public String getEventName() {
    return this.eventName;
  }

  public void setEventName(String eventName) {
    this.eventName = eventName;
  }

  public Double getAmountDue() {
    return this.amountDue;
  }

  public void setAmountDue(Double amountDue) {
    this.amountDue = amountDue;
  }

  public LocalDate getDueDate() {
    return this.dueDate;
  }

  public void setDueDate(LocalDate dueDate) {
    this.dueDate = dueDate;
  }

  public LocalDate getCreatedAt() {
    return this.createdAt;
  }

  public void setCreatedAt(LocalDate createdAt) {
    this.createdAt = createdAt;
  }

}
