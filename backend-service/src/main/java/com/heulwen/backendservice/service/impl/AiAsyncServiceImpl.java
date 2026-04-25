package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.VocabDto;
import com.heulwen.backendservice.form.VocabIngestForm;
import com.heulwen.backendservice.model.Vocabulary;
import com.heulwen.backendservice.service.AiAsyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiAsyncServiceImpl implements AiAsyncService {
    private final RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Override
    @Async
    public void syncVocabToAi(Vocabulary vocab) {
        try {
            String url = aiServiceUrl + "/api/ai/rag/ingest/vocab";
            
            VocabDto data = VocabDto.builder()
                    .word(vocab.getWord())
                    .meaning(vocab.getMeaning())
                    .example(vocab.getPartOfSpeech())
                    .cefr(vocab.getLevel())
                    .build();
                    
            VocabIngestForm request = VocabIngestForm.builder()
                    .items(List.of(data))
                    .build();
                    
            restTemplate.postForEntity(url, request, String.class);

            log.info("Successfully synced vocab '{}' to AI RAG index", vocab.getWord());
        } catch (Exception e) {
            log.error("Failed to sync vocab to AI: {}", e.getMessage());
        }
    }
}
