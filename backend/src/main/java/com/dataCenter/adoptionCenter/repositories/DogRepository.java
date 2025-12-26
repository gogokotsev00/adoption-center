package com.dataCenter.adoptionCenter.repositories;

import com.dataCenter.adoptionCenter.entities.Dog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DogRepository extends JpaRepository<Dog, Long> {
	Dog findById(long id);

	List<Dog> findByOwnerId(long id);
}
