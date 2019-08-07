import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import { createStructuredSelector } from 'reselect';
import { toastr } from 'react-redux-toastr';
import { Card } from 'material-ui/Card';

import injectReducer from 'utils/injectReducer';
import reducer from './reducer';
import Clarifai from 'clarifai';

import 'styles/containers/home.css';

class Home extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  constructor(props) {
    super(props);

    this.begin = this.begin.bind(this);

    this.state = {
      mainImage: null,
      width: 0,
      height: 0,
      regions: []
    };
  }

  componentWillReceiveProps(nextProps) {
    const { history } = this.props;
    const { loading: newLoading, error: newError, questions: newQuestions } = nextProps;
    if (newError) {
      return toastr.error('Questions Loading Error', 'Error occurred while trying to load questions! Try again later!');
    }
    if (!newLoading && newQuestions) {
      if (newQuestions.length === 0) {
        return toastr.error('Empty Questions Error', 'No questions fetched! Try again later!');
      }
      return history.push('/game');
    }
  }

  begin(event) {
    // this.props.loadQuestions();
    const input = event.target.files;
    const _this = this;

    if (input && input[0]) {
      var reader = new FileReader();
      var file = input[0];

      reader.onload = function (e) {
        var _URL = window.URL || window.webkitURL;
        var img = new Image();
        var src = e.target.result;
    
        img.src = _URL.createObjectURL(file);
        img.onload = function() {
          console.log('onload');
          _this.setState({
            mainImage: src,
            width: this.width,
            height: this.height
          });

          const app = new Clarifai.App({apiKey: 'e9b4ecf02eef4a3fabe4cc9bdf64ce9f'});
          const input = src.replace(/^data:image\/[a-z]+;base64,/, "");

          app.models.predict('a403429f2ddf4b49b307e318f00e528b', {base64: input}).then(
            function(response) {
              // do something with response
              console.log(response);
              if (response.outputs && response.outputs[0]) {
                _this.setState({ regions: response.outputs[0].data.regions });
              }
            },
            function(err) {
              console.log(err);
            }
          );

        }
      };

      reader.readAsDataURL(file);
    }
  }

  render() {
    const { 
      mainImage,
      regions
    } = this.state;

    return (
      <Card className="card home">
        <label className="title">
          Choose an Image to Detect Faces
          <input type="file" name="file" onChange={this.begin} accept="image/jpg, image/jpeg, image/png"/>
        </label>
        
        <div className="wrapper">
          <div id="preview">
            <img id="preview-img" src={mainImage} />
          </div>

          <section className="model-section">
            {regions.length > 0 && (
              <div>
                <ul className="model-container-tag-list face-model-list">
                  {regions.map((concept, index) => {
                    let {
                      top_row: topRow,
                      left_col: leftCol,
                      bottom_row: bottomRow,
                      right_col: rightCol
                    } = concept.region_info.bounding_box;
                    const liStyle = {
                      top: `${topRow * 100}%`,
                      left: `${leftCol * 100}%`,
                      bottom: `${(1 - bottomRow) * 100}%`,
                      right: `${(1 - rightCol) * 100}%`
                    };
                    const regionId = `${topRow}-${bottomRow}-${leftCol}-${rightCol}`.replace(
                      /\./g,
                      ''
                    );
                    return (
                      <li
                        key={`face-model-${concept.id}`}
                        data-region-id={regionId}
                        style={liStyle}
                      >
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
        </div>

        {regions.length > 0 && (
          <div>
            <h5 className="region-thumbs-header">
              {regions.length} face
              {regions.length > 1 ? 's' : ''} detected
            </h5>
          </div>
        )}

      </Card>
    );
  }

}

Home.propTypes = {
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool
  ])
};

const mapStateToProps = createStructuredSelector({
});

export function mapDispatchToProps(dispatch) {
  return {
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);
const withReducer = injectReducer({ key: 'home', reducer });

export default compose(
  withRouter,
  withReducer,
  withConnect
)(Home);
