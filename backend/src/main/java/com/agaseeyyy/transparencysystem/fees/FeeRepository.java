package com.agaseeyyy.transparencysystem.fees;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeeRepository extends JpaRepository<Fees, Integer> {
    boolean existsByFeeType(String feeType);
    boolean existsByFeeTypeAndFeeIdNot(String feeType, Integer feeId);
}
