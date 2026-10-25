package com.dataCenter.adoptionCenter.kafka;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.*;
import org.springframework.kafka.support.serializer.JacksonJsonDeserializer;
import org.springframework.kafka.support.serializer.JacksonJsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

	@Value("${spring.kafka.bootstrap-servers:localhost:9092}")
	private String bootstrapServers;

	@Value("${spring.kafka.consumer.group-id:adoption-notification-group}")
	private String groupId;

	@Value("${spring.kafka.consumer.auto-offset-reset:earliest}")
	private String autoOffsetReset;

	@Value("${spring.kafka.listener.auto-startup:true}")
	private boolean listenerAutoStartup;

	@Value("${adoption.events.topic:adoption-events}")
	private String topicName;

	@Bean
	public NewTopic adoptionEventsTopic() {
		return TopicBuilder.name(topicName)
				.partitions(1)
				.replicas(1)
				.build();
	}

	@Bean
	public ProducerFactory<String, AdoptionNotificationEvent> producerFactory() {
		Map<String, Object> configProps = new HashMap<>();
		configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
		configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
		configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JacksonJsonSerializer.class);
		return new DefaultKafkaProducerFactory<>(configProps);
	}

	@Bean
	public KafkaTemplate<String, AdoptionNotificationEvent> kafkaTemplate() {
		return new KafkaTemplate<>(producerFactory());
	}

	@Bean
	public ConsumerFactory<String, AdoptionNotificationEvent> consumerFactory() {
		JacksonJsonDeserializer<AdoptionNotificationEvent> deserializer =
				new JacksonJsonDeserializer<>(AdoptionNotificationEvent.class);
		deserializer.addTrustedPackages("com.dataCenter.adoptionCenter.*");

		Map<String, Object> props = new HashMap<>();
		props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
		props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
		props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, autoOffsetReset);

		return new DefaultKafkaConsumerFactory<>(props, new StringDeserializer(), deserializer);
	}

	@Bean
	public ConcurrentKafkaListenerContainerFactory<String, AdoptionNotificationEvent> kafkaListenerContainerFactory() {
		ConcurrentKafkaListenerContainerFactory<String, AdoptionNotificationEvent> factory =
				new ConcurrentKafkaListenerContainerFactory<>();
		factory.setConsumerFactory(consumerFactory());
		factory.setAutoStartup(listenerAutoStartup);
		return factory;
	}
}
