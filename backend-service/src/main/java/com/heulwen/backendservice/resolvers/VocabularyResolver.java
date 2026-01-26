/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.resolvers;

import com.heulwen.backendservice.exceptions.AppException;
import com.heulwen.backendservice.exceptions.ErrorCode;
import com.heulwen.backendservice.model.Vocabulary;
import com.heulwen.backendservice.repositories.VocabularyRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

/**
 *
 * @author Dell
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VocabularyResolver {

    VocabularyRepository vocabularyRepository;

    public Vocabulary fromId(Integer id) {
        return id == null ? null
                : vocabularyRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.VOCAB_NOT_FOUND));
    }
}
