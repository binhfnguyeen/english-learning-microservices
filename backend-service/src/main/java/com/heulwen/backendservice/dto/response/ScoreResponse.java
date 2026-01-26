/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.dto.response;

import java.util.List;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 *
 * @author Dell
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ScoreResponse {

    List<ProvidedDataWrapper> provided_data;
    List<OverallResultWrapper> overall_result_data;
    List<WordResult> word_result_data;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class ProvidedDataWrapper {
        String audio_provided;
        String post_provided;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class OverallResultWrapper {
        String ai_reading;
        Double length_of_recording_in_sec;
        Integer number_of_recognized_words;
        Integer number_of_words_in_post;
        Double overall_points;
        Integer post_language_id;
        String post_language_name;
        String score_id;
        String user_recording_transcript;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class WordResult {
        String points;
        String speed;
        String word;
    }
}
