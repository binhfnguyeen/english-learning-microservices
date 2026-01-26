/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.controllers;

import com.heulwen.backendservice.dto.request.ChatRequest;
import com.heulwen.backendservice.services.ChatService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author Dell
 */

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApiChatController {
    ChatService chatService;
    
    @PostMapping("/speak/{conversationId}")
    String speak(@RequestBody ChatRequest request, @PathVariable("conversationId") String conversationId) {
        return chatService.speak(request, conversationId);
    }
    
    @PostMapping("/assisstant/{conversationId}")
    String assisstant(@RequestBody ChatRequest request, @PathVariable("conversationId") String conversationId) {
        return chatService.assisstant(request, conversationId);
    }
}
