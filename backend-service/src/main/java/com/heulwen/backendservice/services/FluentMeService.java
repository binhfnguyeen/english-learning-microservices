/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.services;

import com.heulwen.backendservice.dto.request.PostRequest;
import com.heulwen.backendservice.dto.response.PostResponse;
import com.heulwen.backendservice.dto.response.ScoreResponse;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

/**
 *
 * @author Dell
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FluentMeService {

    private final WebClient.Builder webClientBuilder;
    
    @Value("${rapidapi.key}")
    private String rapidApiKey;

    @Value("${rapidapi.host}")
    private String rapidApiHost;
    
    private WebClient client() {
        return webClientBuilder
                .baseUrl("https://thefluentme.p.rapidapi.com")
                .defaultHeader("x-rapidapi-key", rapidApiKey)
                .defaultHeader("x-rapidapi-host", rapidApiHost)
                .build();
    }

    public PostResponse createPost(PostRequest request) {
        return client().post()
                .uri("/post")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(PostResponse.class)
                .block();
    }

    public PostResponse getPostById(String postId) {
        return client().get()
                .uri("/post/" + postId)
                .retrieve()
                .bodyToMono(PostResponse.class)
                .block();
    }

    public List<ScoreResponse> scorePronunciation(String postId, String audioUrl) {
        log.info("Scoring postId={} with audio={}", postId, audioUrl);
        return client().post()
                .uri("/score/" + postId)
                .bodyValue(Map.of("audio_provided", audioUrl))
                .retrieve()
                .onStatus(HttpStatusCode::isError, resp -> resp.bodyToMono(String.class)
                .map(err -> new RuntimeException("API error: " + err)))
                .bodyToFlux(ScoreResponse.class)
                .collectList()
                .block();
    }
}
