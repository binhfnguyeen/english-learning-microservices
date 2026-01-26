package com.heulwen.backendservice.service;

import com.heulwen.backendservice.dto.VocabularyDto;
import com.heulwen.backendservice.form.VocabularyCreateForm;

import java.util.List;

public interface VocabularyService {
    VocabularyDto createVocabulary(VocabularyCreateForm form);
    List<VocabularyDto> getAllVocabularies();
    List<VocabularyDto> searchVocabulary(String keyword);
}
