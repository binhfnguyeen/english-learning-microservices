"use client";
import { useContext, useEffect, useState } from "react";
import styles from "@/components/VocabularyBlindBox.module.css";
import UserContext from "@/configs/UserContext";
import Apis from "@/configs/Apis";
import endpoints from "@/configs/Endpoints";
import MySpinner from "./MySpinner";
import useTTS from "@/utils/useTTS";
import Swal from "sweetalert2";

interface Word {
  id: number;
  word: string;
  meaning: string;
  example: string;
}

interface User {
  id: number;
  username: string;
}

interface Progress {
  userId: User;
  daysStudied: number;
  wordsLearned: number;
  level: string;
}

export default function VocabularyBlindBox() {
  const [words, setWords] = useState<Word[]>([]);
  const [progress, setProgress] = useState<Progress>();
  const [loading, setLoading] = useState<boolean>(false);

  const [flipped, setFlipped] = useState<boolean[]>([false, false, false]);
  const { speak } = useTTS();

  const [gameMode, setGameMode] = useState<"blindbox" | "quiz">("blindbox");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);

  const context = useContext(UserContext);
  const user = context?.user;

  const loadProgress = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await Apis.get(endpoints["progress"](user.id));
      setProgress(res.data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadWords = async (progress: Progress) => {
    try {
      setLoading(true);
      const res = await fetch("/api/blindbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress }),
      });

      if (!res.ok) throw new Error("Gemini API error");
      const allWords: Word[] = await res.json();
      const randomWords = allWords.sort(() => 0.5 - Math.random()).slice(0, 3);

      setWords(randomWords);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlip = (index: number, word: string) => {
    setFlipped((prev) => prev.map((f, i) => (i === index ? !f : f)));
    speak(word, "en-US");
  };

  const handleAnswer = (choice: string) => {
    setSelectedChoice(choice);

    setTimeout(() => {
      if (currentQuestion < words.length - 1) {
        setCurrentQuestion((q) => q + 1);
        setSelectedChoice(null);
      } else {
        Swal.fire({
          icon: "info",
          title: "Hoàn thành quiz!",
          text: "Bạn đã trả lời xong tất cả câu hỏi.",
        }).then(() => {
          setGameMode("blindbox");
          setCurrentQuestion(0);
          setSelectedChoice(null);
        });
      }
    }, 1000);
  };

  useEffect(() => {
    if (words.length > 0) {
      setFlipped(Array(words.length).fill(false));
    }
  }, [words]);

  useEffect(() => {
    if (user) loadProgress();
  }, [user]);

  useEffect(() => {
    if (progress) loadWords(progress);
  }, [progress]);

  if (!user) {
    return <p>Bạn cần đăng nhập để xem Blind Box.</p>;
  }

  return (
    <div className={styles.container}>
      {gameMode === "blindbox" && (
        <>
          {words.map((w, index) => (
            <div
              key={w.id}
              className={`${styles.card} ${flipped[index] ? styles.flipped : ""}`}
              onClick={() => toggleFlip(index, w.word)}
            >
              <div className={styles.inner}>
                <div className={styles.front}>
                  <h3>{w.word}</h3>
                </div>
                <div className={styles.back}>
                  <div className={styles.meaning}>
                    <span>Nghĩa:</span> {w.meaning}
                  </div>
                  <div className={styles.example}>
                    <span>Ví dụ:</span> {w.example}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {words.length > 0 && (
            <button
              className="btn btn-primary mt-3"
              onClick={() => setGameMode("quiz")}
            >
              Bắt đầu Quiz
            </button>
          )}
        </>
      )}

      {gameMode === "quiz" && words.length > 0 && (
        <div className={styles.quizContainer}>
          <h2>Vocabulary Quizz</h2>
          <span>Nghĩa của từ:</span>
          <h3>{words[currentQuestion].word}</h3>
          <div className="d-flex flex-column gap-2 mt-3">
            {shuffle([
              words[currentQuestion].meaning,
              ...words.filter((_, i) => i !== currentQuestion).map((w) => w.meaning),
            ]).map((choice, i) => {
              const isCorrect = choice === words[currentQuestion].meaning;
              const isSelected = choice === selectedChoice;

              let btnClass = "btn btn-outline-primary";
              if (isSelected) {
                btnClass = isCorrect ? "btn btn-success" : "btn btn-danger";
              }

              return (
                <button
                  key={i}
                  className={btnClass}
                  onClick={() => handleAnswer(choice)}
                  disabled={selectedChoice !== null}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading && <MySpinner />}
    </div>
  );
}

// Fisher–Yates (Knuth Shuffle)
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
