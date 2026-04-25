package com.heulwen.backendservice.service;

import com.heulwen.backendservice.model.Vocabulary;

public interface AiAsyncService {
    void syncVocabToAi(Vocabulary vocab);
}
