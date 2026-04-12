package com.procare_system.tracker_maintenance_service.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Frontend sẽ dùng URL này để handshake kết nối WebSocket
        registry.addEndpoint("/ws-notifications")
                .setAllowedOriginPatterns("*") // Mở CORS cho Frontend gọi
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Nơi chứa các "kênh" để Frontend subscribe
        registry.enableSimpleBroker("/topic");

        registry.setApplicationDestinationPrefixes("/app");
    }
}