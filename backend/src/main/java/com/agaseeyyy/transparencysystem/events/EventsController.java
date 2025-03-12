package com.agaseeyyy.transparencysystem.events;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;



@RestController
@RequestMapping(path = "/api/v1/events")
public class EventsController {
  private final EventService eventService;

  public EventsController(EventService eventService) {
    this.eventService = eventService;
  }

  @GetMapping
  public List <Events> displayAllEvents() {
    return eventService.getAllEvents();
  }

  @PostMapping
  public Events addNewEvent(@RequestBody Events newEvent) {      
      return eventService.addNewEvent(newEvent);
  }

  @PutMapping("/{eventId}")
  public Events putMethodName(@PathVariable Integer eventId, @RequestBody Events updatedEvent) {
      return eventService.editEvent(eventId, updatedEvent);
  }
  
  @DeleteMapping("/{eventId}")
  public void deleteEvent(@PathVariable Integer eventId) {
    eventService.deleteEvent(eventId);
  }

}