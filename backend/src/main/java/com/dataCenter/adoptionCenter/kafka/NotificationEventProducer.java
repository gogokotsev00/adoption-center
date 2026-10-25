package com.dataCenter.adoptionCenter.kafka;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationEventProducer {

	private final KafkaTemplate<String, AdoptionNotificationEvent> kafkaTemplate;
	private final String topic;

	public NotificationEventProducer(
			KafkaTemplate<String, AdoptionNotificationEvent> kafkaTemplate,
			@Value("${adoption.events.topic:adoption-events}") String topic) {
		this.kafkaTemplate = kafkaTemplate;
		this.topic = topic;
	}

	public void sendEvent(AdoptionNotificationEvent event) {
		kafkaTemplate.send(topic, String.valueOf(event.ownerId()), event);
	}
}
