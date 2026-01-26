/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.heulwen.backendservice.dto.request.VocabularyCreationRequest;
import com.heulwen.backendservice.dto.response.VocabularyResponse;
import com.heulwen.backendservice.exceptions.AppException;
import com.heulwen.backendservice.exceptions.ErrorCode;
import com.heulwen.backendservice.mapper.VocabularyMapper;
import com.heulwen.backendservice.model.Vocabulary;
import com.heulwen.backendservice.repositories.VocabularyRepository;
import java.io.IOException;
import java.util.Map;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 * @author Dell
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VocabularyService {

    VocabularyRepository vocabularyRepository;
    VocabularyMapper vocabularyMapper;
    Cloudinary cloudinary;

    public VocabularyResponse addOrUpdateVocabulary(VocabularyCreationRequest request, MultipartFile picture) throws IOException {
        Vocabulary vocab;

        if (request.getId() != null) {
            vocab = vocabularyRepository.findById(request.getId()).orElseThrow(() -> new AppException(ErrorCode.VOCAB_NOT_FOUND));
            vocabularyMapper.updateVocabularyFromRequest(request, vocab);
        } else {
            vocab = vocabularyMapper.toVocabulary(request);
        }

        if (picture != null && !picture.isEmpty()) {
            Map res = cloudinary.uploader().upload(picture.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
            vocab.setPicture(res.get("secure_url").toString());
        }

        Vocabulary saved = vocabularyRepository.save(vocab);
        return vocabularyMapper.toVocabularyResponse(saved);
    }

    public Page<VocabularyResponse> getVocabularies(String keyword, Pageable pageable) {
        Page<Vocabulary> pageResult;

        if (keyword != null && !keyword.isEmpty()) {
            pageResult = vocabularyRepository.findByWordContainingIgnoreCase(keyword, pageable);
        } else {
            pageResult = vocabularyRepository.findAll(pageable);
        }
        return pageResult.map(vocabularyMapper::toVocabularyResponse);
    }

    public VocabularyResponse getVocabularyById(int id) {
        Vocabulary vocab = vocabularyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VOCAB_NOT_FOUND));
        return vocabularyMapper.toVocabularyResponse(vocab);
    }

    public void deleteVocabulary(int id) {
        vocabularyRepository.deleteById(id);
    }
}
