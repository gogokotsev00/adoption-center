package com.dataCenter.adoptionCenter.repositories;

import com.dataCenter.adoptionCenter.entities.Owner;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

@Repository
public interface OwnerRepository extends JpaRepository<Owner, Long> {
	Owner findById(long id);

	@Transactional
	@Modifying
	int deleteOwnerById(long id);
}
