package com.heulwen.backendservice.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.heulwen.backendservice.dto.VocabularyDto;
import com.heulwen.backendservice.exception.AppException;
import com.heulwen.backendservice.exception.ErrorCode;
import com.heulwen.backendservice.form.VocabularyCreateForm;
import com.heulwen.backendservice.mapper.VocabularyMapper;
import com.heulwen.backendservice.model.Vocabulary;
import com.heulwen.backendservice.repository.VocabularyRepository;
import com.heulwen.backendservice.service.VocabularyService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VocabularyServiceImpl implements VocabularyService {

    VocabularyRepository vocabularyRepository;
    Cloudinary cloudinary;

    @Override
    @Transactional
    public VocabularyDto createVocabulary(VocabularyCreateForm form, MultipartFile image) {
        Vocabulary vocab = VocabularyMapper.map(form);
        uploadImageIfExists(vocab, image);
        return VocabularyMapper.map(vocabularyRepository.save(vocab));
    }

    @Override
    @Transactional
    public VocabularyDto updateVocabulary(Long id, VocabularyCreateForm form, MultipartFile image) {
        Vocabulary vocab = vocabularyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VOCAB_NOT_FOUND));
        VocabularyMapper.map(form, vocab);
        uploadImageIfExists(vocab, image);
        return VocabularyMapper.map(vocabularyRepository.save(vocab));
    }

    @Override
    public Page<VocabularyDto> getVocabularies(String keyword, Pageable pageable) {
        Page<Vocabulary> pageResult;

        if (keyword != null && !keyword.isEmpty()) {
            pageResult = vocabularyRepository.findByWordContainingIgnoreCase(keyword, pageable);
        } else {
            pageResult = vocabularyRepository.findAll(pageable);
        }
        return pageResult.map(VocabularyMapper::map);
    }

    @Override
    public VocabularyDto getVocabularyById(Long id) {
        Vocabulary vocab = vocabularyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VOCAB_NOT_FOUND));
        return VocabularyMapper.map(vocab);
    }

    @Override
    @Transactional
    public void deleteVocabulary(Long id) {
        if (!vocabularyRepository.existsById(id)) {
            throw new AppException(ErrorCode.VOCAB_NOT_FOUND);
        }
        vocabularyRepository.deleteById(id);
    }

    /**
     * Helper method để upload ảnh lên Cloudinary
     */
    private void uploadImageIfExists(Vocabulary vocab, MultipartFile image) {
        if (image != null && !image.isEmpty()) {
            try {
                Map res = cloudinary.uploader().upload(image.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                vocab.setPicture(res.get("secure_url").toString());
            } catch (IOException ex) {
                log.error("Cloudinary upload failed", ex);
            }
        }
    }
}