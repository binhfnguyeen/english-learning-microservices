/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.controllers;

import com.heulwen.backendservice.dto.request.ChatRequest;
import com.heulwen.backendservice.dto.request.PostRequest;
import com.heulwen.backendservice.dto.response.PostResponse;
import com.heulwen.backendservice.services.ChatService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 *
 * @author Dell
 */
@Controller
@RequiredArgsConstructor
public class WebSocketChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/speak/{conversationId}")
    public void speak(@DestinationVariable String conversationId, ChatRequest request) {
        String aiSentence = chatService.speak(request, conversationId);
        
        PostRequest postRequest = PostRequest.builder()
                .post_language_id("22")
                .post_title("Practice Sentence")
                .post_content(aiSentence) // câu bot gửi
                .build();

        PostResponse postResponse = chatService.createPost(postRequest);

        Map<String, Object> payload = Map.of(
                "type", "practice",
                "postId", postResponse.getPost_id(),
                "content", postResponse.getPost_content()
        );

        messagingTemplate.convertAndSend("/topic/conversation/practice/" + conversationId, payload);
    }

    @MessageMapping("/assisstant/{conversationId}")
    public void assisstant(@DestinationVariable String conversationId, ChatRequest request) {
        String reply = chatService.assisstant(request, conversationId);
        messagingTemplate.convertAndSend("/topic/conversation/assisstant/" + conversationId, reply);
    }
}
