package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.VocabularyDto;
import com.heulwen.backendservice.form.VocabularyCreateForm;
import com.heulwen.backendservice.model.Vocabulary;

public class VocabularyMapper {

    public static Vocabulary map(VocabularyCreateForm form) {
        var vocab = new Vocabulary();
        vocab.setWord(form.getWord());
        vocab.setMeaning(form.getMeaning());
        vocab.setPartOfSpeech(form.getPartOfSpeech());
        return vocab;
    }

    public static VocabularyDto map(Vocabulary vocab) {
        if (vocab == null) return null;

        var dto = new VocabularyDto();
        dto.setId(vocab.getId());
        dto.setWord(vocab.getWord());
        dto.setMeaning(vocab.getMeaning());
        dto.setPartOfSpeech(vocab.getPartOfSpeech());
        dto.setPicture(vocab.getPicture());
        return dto;
    }
}