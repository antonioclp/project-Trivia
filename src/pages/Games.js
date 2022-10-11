import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Header from '../components/Header';
import { scoreAct } from '../Redux/actions';

class Games extends React.Component {
  state = {
    questions: {},
    score: 0,
    assertions: 0,
    nQuestion: 0,
    isLoading: true,
  };

  async componentDidMount() {
    this.callQuestionsApi();
  }

  callQuestionsApi = async () => {
    const { history } = this.props;
    const token = localStorage.getItem('token');
    const FIVE = 5;
    const THREE = 3;
    const url = `https://opentdb.com/api.php?amount=${FIVE}&token=${token}`;
    let response;
    try {
      const data = await fetch(url);
      response = await data.json();
      if (response.response_code === THREE) {
        throw error;
      }
    } catch (error) {
      console.error('Expired Token, please re-send request in login');
      history.push('/');
    }
    const newAnswers = this.randomAnswers(response);
    this.setState({ questions: newAnswers, isLoading: false });
  };

  randomAnswers = (response) => {
    const FIVE = 5;
    const TWO = 2;
    let ans = [];
    response.results.forEach((res) => {
      if (res.type === 'multiple') {
        const randomN = Math.floor(Math.random() * FIVE);
        ans = [...res.incorrect_answers];
        ans.splice(randomN, 0, res.correct_answer);
      } else {
        const randomN = Math.floor(Math.random() * TWO);
        ans = [...res.incorrect_answers];
        ans.splice(randomN, 0, res.correct_answer);
      }
      res.newAnswers = ans;
    });
    return response;
  };

  handleClickIncorrect = () => {

  };

  handleClickCorrect = ({ target }, difficulty) => {
    const { /* timer */ score, assertions } = this.state;
    const { dispatch } = this.props;
    let levelDif;
    const THREE = 3;
    if (difficulty === 'hard') {
      levelDif = THREE;
    } else if (difficulty === 'medium') {
      levelDif = 2;
    } else {
      levelDif = 1;
    }
    const TEN = 10;
    const plusScore = TEN + (/* timer  * */ levelDif);
    this.setState((prevState) => ({
      assertions: prevState.assertions + 1,
      score: prevState.score + plusScore,
    }));
    const payload = {
      score,
      assertions,
    };
    dispatch(scoreAct(payload));
  };

  render() {
    const { questions, nQuestion, isLoading, score } = this.state;
    return (
      <div>
        <Header />
        <h1>Trivia</h1>
        <h2>
          Score:
          {score}
        </h2>
        {
          (!isLoading) && (
            <div>
              <h3 data-testid="question-category">
                {questions?.results[nQuestion].category}
              </h3>
              <h4 data-testid="question-text">
                {questions?.results[nQuestion].question}
              </h4>
              <div data-testid="answer-options">
                {
                  questions?.results[nQuestion].newAnswers.map((elem, index) => (
                    (questions.results[nQuestion].incorrect_answers
                      .some((e) => e === elem)) ? (
                        <button
                          key={ index }
                          className="incorrect unColor"
                          type="button"
                          data-testid={ `wrong-answer-${index}` }
                          onClick={ this.handleClickIncorrect }
                        >
                          {elem}
                        </button>
                      ) : (
                        <button
                          key={ index }
                          className="correct unColor"
                          type="button"
                          data-testid="correct-answer"
                          onClick={ (e) => this
                            .handleClickCorrect(e, questions
                              .results[nQuestion].difficulty) }
                        >
                          {elem}
                        </button>
                      )
                  ))
                }
              </div>
            </div>
          )
        }
      </div>
    );
  }
}

Games.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

export default connect()(Games);
