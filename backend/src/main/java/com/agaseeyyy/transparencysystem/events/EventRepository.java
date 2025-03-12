package com.agaseeyyy.transparencysystem.events;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRepository extends JpaRepository <Events, Integer> {

  
}
