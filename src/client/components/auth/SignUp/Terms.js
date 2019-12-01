import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default class Terms extends Component {
  constructor(props) {
    super(props);
    this.back = this.back.bind(this);
  }

  back(e) {
    e.preventDefault();
    this.props.prevStep();
  }

  render() {
    return (
      <section className="section">
        <div className="container">
          <h1 className="title">Terms & Conditions</h1>
          <progress class="progress is-small is-info" value="90" max="100">
            90%
          </progress>
          <p>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsum,
            possimus vero. Tenetur autem laboriosam fuga? Quam, ea itaque. Quas
            tempora sed cupiditate mollitia maiores voluptate blanditiis labore
            rem consectetur ipsa.Lorem ipsum dolor sit amet consectetur
            adipisicing elit. Debitis quam corrupti sed pariatur aliquid
            repudiandae veritatis, necessitatibus numquam earum nostrum
            aspernatur eveniet qui accusantium, et provident assumenda est
            perferendis harum.Lorem ipsum dolor sit amet consectetur adipisicing
            elit. Debitis quam corrupti sed pariatur aliquid repudiandae
            veritatis, necessitatibus numquam earum nostrum aspernatur eveniet
            qui accusantium, et provident assumenda est perferendis harum.Lorem
            ipsum dolor sit amet consectetur adipisicing elit. Debitis quam
            corrupti sed pariatur aliquid repudiandae veritatis, necessitatibus
            numquam earum nostrum aspernatur eveniet qui accusantium, et
            provident assumenda est perferendis harum.Lorem ipsum dolor sit amet
            consectetur adipisicing elit. Debitis quam corrupti sed pariatur
            aliquid repudiandae veritatis, necessitatibus numquam earum nostrum
            aspernatur eveniet qui accusantium, et provident assumenda est
            perferendis harum.
          </p>
          <br />
          {/* BUTTONS */}
          <div className="buttons">
            <button className="button is-danger" onClick={this.back}>
              Back
            </button>
            <button
              className="button is-info"
              onClick={this.props.handleSignUp}
            >
              Agree and Register
            </button>
          </div>
        </div>
      </section>
    );
  }
}
