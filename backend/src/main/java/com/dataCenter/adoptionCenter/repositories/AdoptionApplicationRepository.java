package com.dataCenter.adoptionCenter.repositories;

import com.dataCenter.adoptionCenter.entities.AdoptionApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdoptionApplicationRepository extends JpaRepository<AdoptionApplication, Long> {
	AdoptionApplication findById(long id);

	List<AdoptionApplication> findByOwnerId(long ownerId);

	List<AdoptionApplication> findByDogId(long dogId);
}
