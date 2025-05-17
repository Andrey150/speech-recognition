import React, { useEffect, useRef, useState } from "react";

function App() {
  const [text, setText] = useState(""); // Состояние для отображения текста
  const [isListening, setIsListening] = useState(false); // Состояние, показывающее, активно ли прослушивание

  const recognition = useRef(null); // Храним экземпляр распознавания речи в useRef, чтобы он не пересоздавался при каждом рендере
  const lastFinal = useRef("");

  // useEffect вызывается один раз при монтировании компонента
  useEffect(() => {
    // Проверяем, поддерживается ли API распознавания речи в браузере
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      // Получаем конструктор распознавания речи
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition(); // Создаем экземпляр и сохраняем его в ref
      recognition.current.continuous = true; // Постоянное прослушивание, а не остановка после каждого высказывания
      recognition.current.interimResults = true; // Включаем промежуточные результаты (незаконченные фразы)
      recognition.current.lang = "ru-RU"; // Распознаем русский язык

      // Обработчик события получения результата
      recognition.current.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];

          if (result.isFinal) {
            const finalTranscript = result[0].transcript.trim();

            // Сравнение с последним добавленным фрагментом
            if (finalTranscript !== lastFinal.current) {
              lastFinal.current = finalTranscript;

              setText((prevText) => {
                return prevText + (prevText ? " " : "") + finalTranscript + ".";
              });
            }
          }
        }
      };

      // Обработчик ошибок распознавания
      recognition.current.onerror = (event) => {
        console.error("Ошибка распознавания:", event.error);
      };
    } else {
      // Если API не поддерживается — выводим предупреждение
      alert("Ваш браузер не поддерживает Web Speech API");
    }
  }, []);

  // Функция запуска распознавания речи
  const startListening = () => {
    if (recognition.current) {
      recognition.current.start(); // Начинаем прослушивание
      setIsListening(true); // Устанавливаем флаг активности
    }
  };

  // Функция остановки распознавания речи
  const stopListening = () => {
    if (recognition.current) {
      recognition.current.stop(); // Останавливаем прослушивание
      setIsListening(false); // Сбрасываем флаг активности
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Распознавание речи</h1>
      <p className="mt-2">
        <strong>Распознанный текст:</strong> {text || "Говорите что-нибудь..."}
      </p>
      <div className="mt-4">
        {!isListening ? (
          <button className="p-2 bg-green-500 text-white rounded" onClick={startListening}>
            Начать запись
          </button>
        ) : (
          <button className="p-2 bg-red-500 text-white rounded" onClick={stopListening}>
            Остановить запись
          </button>
        )}
      </div>
    </div>
  );
}

export default App
