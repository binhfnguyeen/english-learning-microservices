package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.VocabularyDto;
import com.heulwen.backendservice.form.VocabularyCreateForm;
import com.heulwen.backendservice.model.Topic;
import com.heulwen.backendservice.model.Vocabulary;

import java.util.List;
import java.util.stream.Collectors;

public class VocabularyMapper {

    /**
     * CREATE
     * VocabularyCreateForm -> Vocabulary
     */
    public static Vocabulary map(VocabularyCreateForm form) {
        if (form == null) {
            return null;
        }

        Vocabulary vocab = new Vocabulary();
        vocab.setWord(form.getWord());
        vocab.setMeaning(form.getMeaning());
        vocab.setPartOfSpeech(form.getPartOfSpeech());
        vocab.setLevel(form.getLevel());
        vocab.setPicFile(form.getImageFile());

        return vocab;
    }

    /**
     * UPDATE
     * VocabularyCreateForm -> existing Vocabulary
     */
    public static void map(VocabularyCreateForm form, Vocabulary vocab) {
        if (form == null || vocab == null) {
            return;
        }

        vocab.setWord(form.getWord());
        vocab.setMeaning(form.getMeaning());
        vocab.setPartOfSpeech(form.getPartOfSpeech());
        vocab.setLevel(form.getLevel());

        // nếu client gửi ảnh mới
        if (form.getImageFile() != null && !form.getImageFile().isEmpty()) {
            vocab.setPicFile(form.getImageFile());
        }
    }

    /**
     * READ
     * Vocabulary -> VocabularyDto
     */
    public static VocabularyDto map(Vocabulary vocab) {
        if (vocab == null) {
            return null;
        }

        List<Long> topicIds = vocab.getTopics() != null
                ? vocab.getTopics().stream().map(Topic::getId).collect(Collectors.toList())
                : List.of();

        return VocabularyDto.builder()
                .id(vocab.getId())
                .word(vocab.getWord())
                .meaning(vocab.getMeaning())
                .partOfSpeech(vocab.getPartOfSpeech())
                .level(vocab.getLevel())
                .picture(vocab.getPicture())
                .topicIds(topicIds)
                .build();
    }
}
