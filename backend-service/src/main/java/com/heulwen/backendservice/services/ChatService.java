/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.services;

import com.heulwen.backendservice.dto.request.ChatRequest;
import com.heulwen.backendservice.dto.request.PostRequest;
import com.heulwen.backendservice.dto.response.PostResponse;
import com.heulwen.backendservice.dto.response.ScoreResponse;
import jakarta.annotation.PostConstruct;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.chat.memory.repository.jdbc.JdbcChatMemoryRepository;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

/**
 *
 * @author Dell
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private ChatClient chatClient;
    private final ChatClient.Builder builder;
    private final JdbcChatMemoryRepository jdbcChatMemoryRepository;
    private final FluentMeService fluentMeService;

    @PostConstruct
    public void init() {
        ChatMemory chatMemory = MessageWindowChatMemory.builder()
                .chatMemoryRepository(jdbcChatMemoryRepository)
                .maxMessages(30)
                .build();

        chatClient = builder
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .build();
    }

    public String speak(ChatRequest request, String conversationId) {
        SystemMessage systemMessage = new SystemMessage("""
               {
                 "messages": [
                   {
                     "role": "system",
                     "content": "You are Heulwen, an English teacher. Your task is to generate one clear English practice sentence for the student. 
                                 Rules:
                                 1. The sentence must be natural, useful in daily life, and easy to pronounce.
                                 2. The length must be between 3 and 1000 characters.
                                 3. Respond ONLY with the single practice sentence in plain text, no explanation, no formatting."
                   }
                 ],
                 "response_format": { "type": "text" }
               }
                """);

        UserMessage userMessage = new UserMessage(request.message());

        Prompt prompt = new Prompt(systemMessage, userMessage);
        return chatClient
                .prompt(prompt)
                .advisors((t) -> {
                    t.param(ChatMemory.CONVERSATION_ID, conversationId);
                })
                .call()
                .content();
    }
    
    public String assisstant(ChatRequest request, String conversationId) {
        SystemMessage systemMessage = new SystemMessage("""
                {
                  "messages": [
                    {
                      "role": "system",
                      "content": "You are Heulwen, an assistant that helps students with learning, practicing English, and searching for information.
                                  Your main tasks are:
                                  1. Provide short and clear answers to questions.
                                  2. Support learning by giving concise explanations and useful examples when needed.
                                  3. Help users quickly look up or understand information without unnecessary details.
                                  4. Keep responses practical and easy to follow.
                                  Respond in a simple, conversational, and supportive tone.
                                  Always keep answers brief and to the point.
                                  Do not use Markdown, HTML tags, bold, italic, backticks, or special bullet symbols.
                                  Use only plain text with normal line breaks or simple numbering if needed."
                    }
                  ],
                  "response_format": { "type": "text" }
                }
                """);

        UserMessage userMessage = new UserMessage(request.message());

        Prompt prompt = new Prompt(systemMessage, userMessage);
        return chatClient
                .prompt(prompt)
                .advisors((t) -> {
                    t.param(ChatMemory.CONVERSATION_ID, conversationId);
                })
                .call()
                .content();
    }
    
    public PostResponse createPost(PostRequest request) {
        return fluentMeService.createPost(request);
    }

    public PostResponse getPostById(String postId) {
        return fluentMeService.getPostById(postId);
    }

    public List<ScoreResponse> scorePronunciation(String postId, String audioUrl) {
        return fluentMeService.scorePronunciation(postId, audioUrl);
    }
}
