package com.dataCenter.adoptionCenter.services;

import com.dataCenter.adoptionCenter.entities.AdoptionApplication;
import com.dataCenter.adoptionCenter.entities.ApplicationStatus;
import com.dataCenter.adoptionCenter.entities.Dog;
import com.dataCenter.adoptionCenter.entities.DogStatus;
import com.dataCenter.adoptionCenter.entities.NotificationEventType;
import com.dataCenter.adoptionCenter.entities.Owner;
import com.dataCenter.adoptionCenter.kafka.AdoptionNotificationEvent;
import com.dataCenter.adoptionCenter.kafka.NotificationEventProducer;
import com.dataCenter.adoptionCenter.repositories.AdoptionApplicationRepository;
import com.dataCenter.adoptionCenter.repositories.DogRepository;
import com.dataCenter.adoptionCenter.repositories.OwnerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdoptionApplicationServiceTest {

	@Mock
	private AdoptionApplicationRepository applicationRepository;

	@Mock
	private DogRepository dogRepository;

	@Mock
	private OwnerRepository ownerRepository;

	@Mock
	private NotificationEventProducer notificationEventProducer;

	@InjectMocks
	private AdoptionApplicationService applicationService;

	private Owner owner;
	private Dog dog;

	@BeforeEach
	void setUp() {
		owner = new Owner().withId(1L).withName("Alice").withMoney(200.0);
		dog = new Dog().withId(10L).withName("Buddy").withAge(3).withFee(50.0).withStatus(DogStatus.AVAILABLE);
	}

	@Test
	void testCreateApplication_Success() {
		when(ownerRepository.findById(1L)).thenReturn(owner);
		when(dogRepository.findById(10L)).thenReturn(dog);
		when(applicationRepository.save(any(AdoptionApplication.class))).thenAnswer(invocation -> invocation.getArgument(0));

		AdoptionApplication app = applicationService.createApplication(1L, 10L);

		assertNotNull(app);
		assertEquals(ApplicationStatus.PENDING, app.getStatus());
		assertEquals(DogStatus.PENDING, dog.getStatus());
		verify(dogRepository).save(dog);
		verify(applicationRepository).save(any(AdoptionApplication.class));
		verifyNoInteractions(notificationEventProducer);
	}

	@Test
	void testCreateApplication_DogNotAvailable() {
		dog.setStatus(DogStatus.PENDING);
		when(ownerRepository.findById(1L)).thenReturn(owner);
		when(dogRepository.findById(10L)).thenReturn(dog);

		assertThrows(IllegalStateException.class, () -> applicationService.createApplication(1L, 10L));
		verifyNoInteractions(notificationEventProducer);
	}

	@Test
	void testApproveApplication_Success() {
		AdoptionApplication app = new AdoptionApplication()
				.withId(100L)
				.withOwner(owner)
				.withDog(dog)
				.withStatus(ApplicationStatus.PENDING);

		when(applicationRepository.findById(100L)).thenReturn(app);
		when(applicationRepository.save(any(AdoptionApplication.class))).thenAnswer(invocation -> invocation.getArgument(0));

		AdoptionApplication approved = applicationService.approveApplication(100L);

		assertEquals(ApplicationStatus.APPROVED, approved.getStatus());
		assertEquals(150.0, owner.getMoney());
		assertEquals(DogStatus.ADOPTED, dog.getStatus());
		assertEquals(owner, dog.getOwner());
		verify(ownerRepository).save(owner);
		verify(dogRepository).save(dog);

		ArgumentCaptor<AdoptionNotificationEvent> eventCaptor = ArgumentCaptor.forClass(AdoptionNotificationEvent.class);
		verify(notificationEventProducer).sendEvent(eventCaptor.capture());
		AdoptionNotificationEvent publishedEvent = eventCaptor.getValue();
		assertEquals(NotificationEventType.DOG_PURCHASE_COMPLETED, publishedEvent.eventType());
		assertEquals(100L, publishedEvent.applicationId());
		assertEquals(1L, publishedEvent.ownerId());
		assertEquals("Alice", publishedEvent.ownerName());
		assertEquals(10L, publishedEvent.dogId());
		assertEquals("Buddy", publishedEvent.dogName());
		assertEquals(50.0, publishedEvent.fee());
		assertEquals(150.0, publishedEvent.remainingMoney());
		assertNotNull(publishedEvent.occurredAt());
	}

	@Test
	void testApproveApplication_InsufficientFunds() {
		owner.setMoney(30.0);
		AdoptionApplication app = new AdoptionApplication()
				.withId(100L)
				.withOwner(owner)
				.withDog(dog)
				.withStatus(ApplicationStatus.PENDING);

		when(applicationRepository.findById(100L)).thenReturn(app);

		assertThrows(IllegalStateException.class, () -> applicationService.approveApplication(100L));
		verifyNoInteractions(notificationEventProducer);
	}

	@Test
	void testRejectApplication_Success() {
		dog.setStatus(DogStatus.PENDING);
		AdoptionApplication app = new AdoptionApplication()
				.withId(100L)
				.withOwner(owner)
				.withDog(dog)
				.withStatus(ApplicationStatus.PENDING);

		when(applicationRepository.findById(100L)).thenReturn(app);
		when(applicationRepository.save(any(AdoptionApplication.class))).thenAnswer(invocation -> invocation.getArgument(0));

		AdoptionApplication rejected = applicationService.rejectApplication(100L);

		assertEquals(ApplicationStatus.REJECTED, rejected.getStatus());
		assertEquals(DogStatus.AVAILABLE, dog.getStatus());
		verify(dogRepository).save(dog);
		verifyNoInteractions(notificationEventProducer);
	}
}
