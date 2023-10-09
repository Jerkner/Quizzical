import { useState, useEffect } from "react"
import blobYellow from "../assets/blobYellow.png"
import blobBlue from "../assets/blobBlue.png"
import he from "he"

export default function App() {
    // State variables
    const [questionsArray, setQuestionsArray] = useState([])
    const [showResult, setShowResult] = useState(false)
    const [allSelectedAnswers, setAllSelectedAnswers] = useState({})

    // Function to generate questions
    function generateQuestions() {
        fetch(`https://opentdb.com/api.php?amount=5&category=17`)
            .then((response) => response.json())
            .then((data) => {
                // Decoding question data
                const decodedQuestions = data.results.map((question) => ({
                    ...question,
                    question: he.decode(question.question),
                    correct_answer: he.decode(question.correct_answer),
                    incorrect_answers: question.incorrect_answers.map(
                        (answer) => he.decode(answer)
                    ),
                }))

                // Shuffling questions and answers
                const shuffledAnswers = decodedQuestions.map((question) => {
                    const answers = [
                        ...question.incorrect_answers,
                        question.correct_answer,
                    ]
                    durstenfeldShuffle(answers)
                    return {
                        ...question,
                        answers,
                    }
                })

                // Updating state variables
                setQuestionsArray(shuffledAnswers)
                setAllSelectedAnswers({})
                setShowResult(false)

                window.scrollTo(0, 0)
            })
    }

    // Function to shuffle an array using the Durstenfeld shuffle algorithm
    function durstenfeldShuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[array[i], array[j]] = [array[j], array[i]]
        }
        return array
    }

    // Event handler for answer selection
    function handleAnswerChange(event, questionIndex) {
        const { value } = event.target
        setAllSelectedAnswers((prevState) => ({
            ...prevState,
            [questionIndex]: value,
        }))
    }

    // Event handler for checking answers
    function checkAnswers() {
        setShowResult(true)
    }

    // Scroll to bottom when showResult changes
    useEffect(() => {
        if (showResult) {
            scrollToBottom()
        }
    }, [showResult])

    function scrollToBottom() {
        window.scrollTo(0, document.body.scrollHeight)
    }

    // Function to generate a single question element
    function generateQuestionElement(question, index) {
        return (
            <div key={index}>
                <h1 className="questions-question">{question.question}</h1>
                <div className="questions-answers">
                    {generateAnswerElements(question.answers, index)}
                </div>
                <hr />
            </div>
        )
    }

    // Function to generate all question elements
    function generateAllQuestionElements() {
        return questionsArray.map((question, index) =>
            generateQuestionElement(question, index)
        )
    }

    // Function to generate answer elements for a given question
    function generateAnswerElements(answersArray, questionIndex) {
        const selectedAnswer = allSelectedAnswers[questionIndex]
        const correctAnswer = questionsArray[questionIndex].correct_answer

        let groupedAnswers = []
        if (answersArray.length === 4) {
            groupedAnswers = [
                answersArray.slice(0, 2),
                answersArray.slice(2, 4),
            ]
        } else {
            groupedAnswers = [answersArray]
        }

        return groupedAnswers.map((group, groupIndex) => (
            <div
                key={groupIndex}
                className="answer-group"
            >
                {group.map((answer, answerIndex) => {
                    const isSelected = selectedAnswer === answer
                    const isCorrect = answer === correctAnswer

                    let className = "radio-container"

                    if (showResult) {
                        if (isSelected && isCorrect) {
                            className += " correct"
                        } else if (isSelected && !isCorrect) {
                            className += " incorrect"
                        } else if (!isSelected && isCorrect) {
                            className += " correct"
                        }
                    } else if (isSelected) {
                        className += " selected"
                    }

                    return (
                        <label
                            key={answerIndex}
                            className={className}
                        >
                            <input
                                type="radio"
                                name={`question-${questionIndex}-answer-${answerIndex}`}
                                value={answer}
                                checked={isSelected}
                                onChange={(event) =>
                                    handleAnswerChange(event, questionIndex)
                                }
                                onClick={(event) => {
                                    if (event.target.checked) {
                                        event.target.checked = false
                                    }
                                }}
                                disabled={showResult}
                            />
                            {answer}
                        </label>
                    )
                })}
            </div>
        ))
    }

    // Calculating the score
    const score = questionsArray.reduce((totalScore, question, index) => {
        const selectedAnswer = allSelectedAnswers[index]
        const isCorrect = selectedAnswer === question.correct_answer
        return isCorrect ? totalScore + 1 : totalScore
    }, 0)

    return (
        <main className="questions-main">
            {!questionsArray.length && !showResult ? (
                // Rendered when questionsArray is empty and showResult is false
                <div className="start-content">
                    <h1 className="start-title">Quizzical</h1>
                    <h2 className="start-instructions">
                        Press the button to generate your questions
                    </h2>
                    <button
                        onClick={generateQuestions}
                        className="start-button"
                    >
                        Start quiz
                    </button>
                </div>
            ) : !showResult ? (
                // Rendered when showResult is false
                <div className="questions-content">
                    {generateAllQuestionElements()}
                    <button
                        onClick={checkAnswers}
                        className="check-button"
                        disabled={showResult}
                    >
                        Check Answers
                    </button>
                </div>
            ) : (
                // Rendered when showResult is true
                <div className="questions-content">
                    {generateAllQuestionElements()}
                    <div className="result-content">
                        <div className="result-container">
                            <h3 className="result-text">
                                You scored {score}/{questionsArray.length}{" "}
                                correct answers
                            </h3>
                            <button
                                onClick={generateQuestions}
                                className="play-again-button"
                            >
                                Play Again
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <img
                src={blobYellow}
                className="start-blob-yellow"
            />
            <img
                src={blobBlue}
                className="start-blob-blue"
            />
        </main>
    )
}
