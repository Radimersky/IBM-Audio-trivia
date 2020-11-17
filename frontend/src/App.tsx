import React from 'react';

import './App.css';
import Speak from './components/Speak';
// @ts-ignore
import Recorder from 'react-mp3-recorder';
import { serverURL } from './config';
import he from 'he';
import { css } from "@emotion/core";
import BeatLoader from "react-spinners/BeatLoader";
import { recordScore } from "./utils/recordScore"
import { getLetter } from './utils/getLetter';


interface AppState {
    text: string,
    recordedText: string,
    recordedLetter: string,
    question: string,
    incorrectAnswers: string[],
    correctAnswer: string,
    mixedAnswers: string[],
    outcome: string,
    loading: boolean,
    recordingEnabled: boolean,
    playerName: string,
    hideResult: boolean,
    hideScoreboard: boolean,
}

enum AnswerState {
    Correct,
    Incorrect,
    Unaswered,
    Error
}

export class App extends React.Component<any, AppState> {
    private game: {
        containerClass: string;
        points: number,
        questionNumber: number,
        totalQuestions: number,
        answerState: AnswerState,
    };

    constructor(props: any) {
        super(props);
        this.input = React.createRef();
        this.state = {
            text: 'Say something',
            recordedText: '',
            recordedLetter: '',
            question: '',
            incorrectAnswers: [],
            correctAnswer: '',
            mixedAnswers: [],
            outcome: '',
            loading: false,
            recordingEnabled: true,
            playerName: 'unnamed',
            hideResult: true,
            hideScoreboard: true,
        };
        this.game = {
            containerClass: 'container',
            points: 0,
            questionNumber: 1,
            totalQuestions: 3,
            answerState: AnswerState.Unaswered,
        };
        this.sendResult = this.sendResult.bind(this);

    }

    input: React.RefObject<HTMLInputElement>;

    restartGame = (event: any) => {
        event.preventDefault();
        this.getQuestion();
        this.game.questionNumber = 1;
        this.game.points = 0;
        this.game.containerClass = 'container';
        this.game.answerState = AnswerState.Unaswered;
        this.setState({
            hideResult: true,
            hideScoreboard: true,
            recordingEnabled: true,
            outcome: '',
        });
    };

    showScoreboard = () => {
        this.setState({
            hideResult: true,
            hideScoreboard: false,
        });
    };

    sendResult(event: any) {
        event.preventDefault();
        recordScore(this.state.playerName, this.game.totalQuestions, this.game.points);
        this.showScoreboard();
    };

    changeNameHandler = (event: any) => {
        this.setState({ playerName: event.target.value });
    };

    evaluateGame = () => {
        if (this.game.answerState === AnswerState.Correct || this.game.answerState === AnswerState.Incorrect) {
            if (this.game.answerState === AnswerState.Correct) {
                this.game.points += 1;
                this.game.containerClass += ' correct_answer';
            } else if (this.game.answerState === AnswerState.Incorrect) {
                this.game.containerClass += ' incorrect_answer';
            }

            this.setState({
                recordingEnabled: false
            });
            setTimeout(() => {
                // If game over, show result. Else proceed to next question
                if (this.game.questionNumber === this.game.totalQuestions) {
                    this.game.containerClass += ' hidden';
                    //this.game.hideResult = false;
                    this.setState({
                        hideResult: false,
                    });
                } else {
                    this.getQuestion();
                    this.game.questionNumber += 1;
                    this.game.containerClass = 'container';
                    this.game.answerState = AnswerState.Unaswered;
                    this.setState({
                        recordingEnabled: true,
                        outcome: '',
                    });
                }

            }, 8000);
        }
    };

    //  Getne otazku - replace je kvůli tomu, že mi přijde &quot místo " a podobně,
    //  nevěděl jsem jak to rychle po par pokusech jednoduše rozkodovat, tak je to takto skarede
    //  takze to chce predelat
    getQuestion = () => {
        fetch('https://opentdb.com/api.php?amount=1&type=multiple')
            .then(response => response.json())
            .then(data => {
                let questionInfo = data.results[0];
                let question = he.decode(questionInfo.question);
                let correctAnswer = he.decode(questionInfo.correct_answer);
                let incorrectAnswers = questionInfo.incorrect_answers.map((answer: any) => he.decode(answer));
                let mixedAnswers = incorrectAnswers.concat(correctAnswer).sort(() => 0.5 - Math.random());
                this.setState({
                    recordedText: '',
                    recordedLetter: '',
                    question,
                    correctAnswer,
                    incorrectAnswers,
                    mixedAnswers,
                });
            })
    };

    _onRecordingComplete = (blob: string | Blob | null) => {
        console.log('recording', blob);
        if (blob !== null) {
            this.setState({
                loading: true
            });
            let fd = new FormData();
            fd.append('audio', blob);

            fetch(`${serverURL}/api/v1/recognize`, {
                headers: { Accept: "application/json" },
                method: "POST", body: fd
            }).then(response => response.json())
                .then(response => {
                    this.setState({
                        loading: false
                    });

                    if (response.status === 200 && response.result.results.length !== 0) {
                        let recordedText = response.result.results[response.result.results.length - 1].alternatives[0].transcript;
                        let recordedLetter = getLetter(recordedText)
                        this.setState(() => ({
                            recordedText,
                            recordedLetter,
                            outcome: this.getOutcome(recordedLetter),
                        }));
                        this.game.answerState = this.getOutcome2(recordedLetter);
                        this.evaluateGame();
                    }
                });
        }
    };

    getOutcome(recordedLetter: string) {
        switch (recordedLetter) {
            case "A":
                if (this.getIndex(this.state.correctAnswer, this.state.mixedAnswers) === 0)
                    return ("Correct!");
                else
                    return ("Incorrect!");
            case "B":
                if (this.getIndex(this.state.correctAnswer, this.state.mixedAnswers) === 1)
                    return ("Correct!");
                else
                    return ("Incorrect!");
            case "C":
                if (this.getIndex(this.state.correctAnswer, this.state.mixedAnswers) === 2)
                    return ("Correct!");
                else
                    return ("Incorrect!");
            case "D":
                if (this.getIndex(this.state.correctAnswer, this.state.mixedAnswers) === 3)
                    return ("Correct!");
                else
                    return ("Incorrect!");
            case "Question":
                {
                    this.getQuestion();
                    return ("");
                }
            default:
                return ('Unable to process! Please, try to record your answer again!');
        }
    }

    getOutcome2(recordedLetter: any) {
        switch (recordedLetter) {
            case "A":
                if (this.getIndex(this.state.correctAnswer, this.state.mixedAnswers) === 0)
                    return (AnswerState.Correct);
                else
                    return (AnswerState.Incorrect);
            case "B":
                if (this.getIndex(this.state.correctAnswer, this.state.mixedAnswers) === 1)
                    return (AnswerState.Correct);
                else
                    return (AnswerState.Incorrect);
            case "C":
                if (this.getIndex(this.state.correctAnswer, this.state.mixedAnswers) === 2)
                    return (AnswerState.Correct);
                else
                    return (AnswerState.Incorrect);
            case "D":
                if (this.getIndex(this.state.correctAnswer, this.state.mixedAnswers) === 3)
                    return (AnswerState.Correct);
                else
                    return (AnswerState.Incorrect);
            case "Question":
                {
                    this.getQuestion();
                    return (AnswerState.Unaswered);
                }
            default:
                return (AnswerState.Error);
        }
    }

    _onRecordingError = (err: any) => {
        console.log('recording error', err)
    };

    getIndex(value: any, arr: any) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === value) {
                return i;
            }
        }
        return -1;
    };

    getLetterOfCorrenctAnswer() {
        return ['A', 'B', 'C', 'D'][this.state.mixedAnswers.indexOf(this.state.correctAnswer)];
    }

    render() {
        let userAnswerIndex = ['A', 'B', 'C', 'D'].indexOf(this.state.recordedLetter);
        const answers = this.state.mixedAnswers.map((item, index) =>
            <li key={item} className={index === userAnswerIndex ? 'selected_answer' : ''}>{['A', 'B', 'C', 'D'][index]}) {item}</li>
        );
        const questionAudio = `${this.state.question} a) ${this.state.mixedAnswers[0]}, b) ${this.state.mixedAnswers[1]}, c) ${this.state.mixedAnswers[2]}, d) ${this.state.mixedAnswers[3]}`;

        const spinnerCss = css`
              display: block;
              margin: 0 auto;
              margin-top: 20px;
              border-color: red;
            `;

        return (
            <div className="App">
                <h1> Audio trivia game</h1>
                {this.state.question === '' &&
                    <div>
                        <button id="next_question" onClick={this.getQuestion}> Start game</button>
                    </div>
                }

                {this.state.question !== '' &&
                    <div className={this.game.containerClass} >
                        <div id='container_header'>
                            <p>Question: {this.game.questionNumber}/{this.game.totalQuestions}</p>
                            <p>Total points: {this.game.points}</p>
                        </div>

                        {this.state.question !== '' &&
                            <div id='container_question'>
                                <Speak text={questionAudio} />
                                <p><b>{this.state.question}</b></p>
                                <hr></hr>
                                <ol id='answer_list' type="A">
                                    {answers}
                                </ol>
                                <hr></hr>
                            </div>}


                        <div id='container_footer'>
                            {!this.state.loading &&
                                this.state.recordingEnabled &&
                                <div>
                                    <Recorder
                                        onRecordingComplete={this._onRecordingComplete}
                                        onRecordingError={this._onRecordingError}
                                    />
                                    <p><i> Click and Hold to record your answer (A,B,C or D)</i></p>
                                </div>}

                            {this.state.loading &&
                                <div>
                                    <BeatLoader
                                        css={spinnerCss}
                                        size={30}
                                        color={"#ff8c00"}
                                        loading={this.state.loading}
                                    />
                                </div>
                            }

                            {this.game.answerState === AnswerState.Correct &&
                                <div className='answered'>
                                    <p>Correct! The answer is {this.state.correctAnswer}.</p>
                                </div>}

                            {this.game.answerState === AnswerState.Incorrect &&
                                <div className='answered'>
                                    <p>Incorrect! The answer is {this.state.correctAnswer}.</p>
                                </div>}

                            {this.state.outcome === 'Unable to process! Please, try to record your answer again!' &&
                                <div className='answered_error'>
                                    <p>Unable to process! Please, try to record your answer again!</p>
                                    {<Speak text={this.state.outcome} />}
                                </div>}

                            {/* Correct answer: {this.state.correctAnswer} <br /> */}
                            {this.state.recordedText !== '' && (this.state.outcome === 'Correct!' || this.state.outcome === 'Incorrect!') &&
                                <div>
                                    {<Speak text={`${this.state.outcome} The answer is ${this.state.correctAnswer}.`} />}
                                </div>}
                        </div>

                    </div>}

                <div className={this.state.hideResult ? 'hidden' : ''}>
                    <div className='result'>
                        <div className='result_header'>
                            <p><b>Game over</b></p>
                        </div>
                        <div className='result_info'>
                            <hr></hr>
                            <p>Answered questions: {this.game.totalQuestions}</p>
                            <p>Total points: {this.game.points}</p>
                            <hr></hr>
                        </div>
                        <div id='result_form'>
                            <form onSubmit={this.sendResult}>
                                <label>
                                    Please enter your name:
                                </label>
                                <input className='result_form_input' type="text" name="name" onChange={this.changeNameHandler} />
                                <br></br>
                                <input type="submit" value="Submit" />
                            </form>
                        </div>
                    </div>
                </div>

                <div className={this.state.hideScoreboard ? 'hidden' : ''}>
                    <div className='result'>
                        <div className='result_header'>
                            <p><b>Thank you</b></p>
                        </div>
                        <div className='result_info'>
                            <hr></hr>
                            <a href="https://airtable.com/shrVrimG7knh2rs2x/tblu1pdeoNmDChudO/viw9kfdNc3Wo6APHF?blocks=hide" rel="noopener noreferrer" target="_blank">Click here to see scoreboard</a>
                            <br></br>
                            <button onClick={this.restartGame}>Restart game</button>
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}

export default App;