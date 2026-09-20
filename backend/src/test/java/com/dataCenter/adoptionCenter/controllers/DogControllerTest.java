package com.dataCenter.adoptionCenter.controllers;

import com.dataCenter.adoptionCenter.entities.Dog;
import com.dataCenter.adoptionCenter.entities.DogStatus;
import com.dataCenter.adoptionCenter.services.DogService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DogControllerTest {

	@Mock
	private DogService dogService;

	@InjectMocks
	private DogController dogController;

	@Test
	void testCreateDog_WithoutOwner() {
		when(dogService.createDog(any(Dog.class))).thenAnswer(invocation -> invocation.getArgument(0));

		Dog result = dogController.createDog("Rex", 4, 150.0, null);

		assertNotNull(result);
		assertEquals("Rex", result.getName());
		assertEquals(4, result.getAge());
		assertEquals(150.0, result.getFee());
		assertEquals(DogStatus.AVAILABLE, result.getStatus());
		assertNull(result.getOwner());

		ArgumentCaptor<Dog> captor = ArgumentCaptor.forClass(Dog.class);
		verify(dogService).createDog(captor.capture());
		Dog captured = captor.getValue();
		assertEquals("Rex", captured.getName());
		assertEquals(DogStatus.AVAILABLE, captured.getStatus());
		assertNull(captured.getOwner());
	}
}
