package com.heulwen.backendservice.service;

import com.heulwen.backendservice.dto.VocabularyDto;
import com.heulwen.backendservice.form.VocabularyCreateForm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface VocabularyService {
    VocabularyDto createVocabulary(VocabularyCreateForm form, MultipartFile image);
    VocabularyDto updateVocabulary(Long id, VocabularyCreateForm form, MultipartFile image);
    Page<VocabularyDto> getVocabularies(String keyword, Pageable pageable);
    VocabularyDto getVocabularyById(Long id);
    void deleteVocabulary(Long id);
}
