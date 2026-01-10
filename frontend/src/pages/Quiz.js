import QuizSidebar from '../components/quiz/QuizSidebar';
import QuestionIndicator from '../components/quiz/QuestionIndicator';
import QuizQCard from '../components/quiz/QuizQCard';
import './Quiz.css';
import React, { useState } from 'react';

const Quiz = () => {
  // Sample quiz data - Take from API
  const quizData = {
    title: "Data Structures Quiz",
    questions: [
      {
        text: "What is the time complexity of searching in a balanced Binary Search Tree?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"]
      },
      {
        text: "Which data structure uses LIFO (Last In First Out) principle?",
        options: ["Queue", "Stack", "Array", "Linked List"]
      },
      {
        text: "What is the maximum number of nodes at level 'L' in a binary tree?",
        options: ["2^L", "2^(L-1)", "L^2", "2L"]
      },
      {
        text: "Which sorting algorithm has the best average time complexity?",
        options: ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"]
      },
      {
        text: "What is a hash collision?",
        options: [
          "When two keys hash to the same index",
          "When a hash function fails",
          "When a hash table is full",
          "When hash values are negative"
        ]
      },
      {
        text: "Which traversal visits the root node first?",
        options: ["Inorder", "Preorder", "Postorder", "Level Order"]
      },
      {
        text: "What is the space complexity of a recursive fibonacci function?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n²)"]
      },
      {
        text: "Which data structure is best for implementing a priority queue?",
        options: ["Array", "Linked List", "Heap", "Stack"]
      }
    ]
  };

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(quizData.questions.length).fill(null));
  const [reviewFlags, setReviewFlags] = useState(Array(quizData.questions.length).fill(false));
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0])); // Track visited questions, start with question 0

  // Calculate question status
  const getQuestionStatus = (index) => {
    if (reviewFlags[index]) return 'review';
    if (answers[index] !== null) return 'answered';
    if (visitedQuestions.has(index)) return 'unattempted'; // Visited but not answered
    return 'unvisited'; // Never visited
  };

  const questionStatuses = quizData.questions.map((_, index) => getQuestionStatus(index));

  const handleAnswerSelect = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleMarkReview = () => {
    const newReviewFlags = [...reviewFlags];
    newReviewFlags[currentQuestion] = !newReviewFlags[currentQuestion];
    setReviewFlags(newReviewFlags);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      setVisitedQuestions(prev => new Set([...prev, nextQuestion])); // Mark as visited
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      const prevQuestion = currentQuestion - 1;
      setCurrentQuestion(prevQuestion);
      setVisitedQuestions(prev => new Set([...prev, prevQuestion])); // Mark as visited
    }
  };

  const handleSubmit = () => {
    const unanswered = answers.filter(a => a === null).length;
    if (unanswered > 0) {
      if (window.confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
        alert('Quiz submitted! (In real app, this would save results)');
      }
    } else {
      alert('Quiz submitted! (In real app, this would save results)');
    }
  };

  return (
    <div className="quiz-page-layout">
      <QuizSidebar
        questions={quizData.questions}
        currentQuestion={currentQuestion}
        onQuestionSelect={(index) => {
          setCurrentQuestion(index);
          setVisitedQuestions(prev => new Set([...prev, index])); // Mark as visited when clicked
        }}
        questionStatuses={questionStatuses}
      />

      <div className="quiz-main-content">
        <div className="quiz-header">
          <h1>{quizData.title}</h1>
          <div className="quiz-progress">
            Question {currentQuestion + 1} of {quizData.questions.length}
          </div>
        </div>

        <QuizQCard
          question={quizData.questions[currentQuestion]}
          selectedAnswer={answers[currentQuestion]}
          onAnswerSelect={handleAnswerSelect}
          onMarkReview={handleMarkReview}
          isMarkedReview={reviewFlags[currentQuestion]}
        />

        <div className="quiz-navigation-buttons">
          <button
            className="nav-btn btn-previous"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>

          {currentQuestion === quizData.questions.length - 1 ? (
            <button className="nav-btn btn-submit" onClick={handleSubmit}>
              Submit Quiz
            </button>
          ) : (
            <button className="nav-btn btn-next" onClick={handleNext}>
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;