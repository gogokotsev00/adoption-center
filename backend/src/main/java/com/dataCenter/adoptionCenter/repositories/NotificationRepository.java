package com.dataCenter.adoptionCenter.repositories;

import com.dataCenter.adoptionCenter.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
	Notification findById(long id);

	List<Notification> findAllByOrderByCreatedAtDesc();

	List<Notification> findByOwnerIdOrderByCreatedAtDesc(long ownerId);
}
