import React, { useEffect, useRef, useState } from "react";
import { Select, Space, Button, Input, Typography } from 'antd';

import './App.css';

const { TextArea } = Input;
const { Title } = Typography;

function App() {
  const [text, setText] = useState(""); // Состояние для отображения текста
  const [isListening, setIsListening] = useState(false); // Состояние, показывающее, активно ли прослушивание
  const [language, setLanguage] = useState('ru-Ru')

  const recognition = useRef(null); // Храним экземпляр распознавания речи в useRef, чтобы он не пересоздавался при каждом рендере
  const lastFinal = useRef("");

  const handleChangeLanguage = (value) => {
    setLanguage(value)
  };

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
      recognition.current.lang = language; // Распознаем язык

      console.log(recognition.current.lang)

      // Обработчик события получения результата
      recognition.current.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];

          if (result.isFinal) {
            const finalTranscript = result[0].transcript.trim();

            setText((prevText) => {
              // Проверяем, добавляли ли уже этот фрагмент (или его часть)
              if (!prevText.endsWith(finalTranscript)) {
                return prevText + (prevText ? " " : "") + finalTranscript + ".";
              }
              return prevText;
            });
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
  }, [language]);

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
    <div className="container">
      <header><Title>Распознавание речи</Title></header>

      <Space wrap>
        <Title level={2}>Выберите язык</Title>
        <Select
          defaultValue="Russian"
          style={{ width: 120 }}
          onChange={handleChangeLanguage}
          disabled={isListening}
          options={[
            { value: 'ru-Ru', label: 'Russian' },
            { value: 'en-En', label: 'English' }
          ]}
        />
      </Space>
      <main>
        <TextArea value={text} rows={6} placeholder="Здесь появится распознанный текст">
        </TextArea>
        <div className="mt-4">
          {!isListening ? (
            <Button type="primary" onClick={startListening}>Начать запись</Button>
          ) : (
            <Button type="primary" onClick={stopListening}>Остановить запись</Button>
          )}
        </div>
      </main>


    </div>
  );
}

export default App
