package com.agaseeyyy.transparencysystem.programs;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProgramRepository extends JpaRepository<Programs, String> {

}
