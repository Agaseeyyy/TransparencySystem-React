package com.agaseeyyy.transparencysystem.events;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class EventService {
  private final EventRepository eventRepository;

  public EventService(EventRepository eventRepository) {
    this.eventRepository = eventRepository;
  }

  public List <Events> getAllEvents() {
    return eventRepository.findAll();
  }
  
  public Events addNewEvent(Events newEvent) {
    if (newEvent == null) {
      throw new RuntimeException("Failed to add new event!");
    }
    return eventRepository.save(newEvent);
  }

  public Events editEvent(Integer eventId, Events updatedEvent) {
    Events existingEvent = eventRepository.findById(eventId).orElse(null);

    if(existingEvent == null) {
      throw new RuntimeException("Event not found with id " + eventId);
    }
    existingEvent.setEventName(updatedEvent.getEventName());
    existingEvent.setAmountDue(updatedEvent.getAmountDue());
    existingEvent.setDueDate(updatedEvent.getDueDate());

    return eventRepository.save(existingEvent);
  }
  
  public void deleteEvent(Integer eventId) {
    if (!eventRepository.existsById(eventId)) {
      throw new RuntimeException("Event not found with id " + eventId);
    }
    eventRepository.deleteById(eventId);
  }
} 
