import $ from "jquery"
import R from "ramda"
import React, { Component } from "react"
import VisibilitySensor from "react-visibility-sensor"
import logo from "./logo.svg"
import "./App.css"

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      offset: 0,
      limit: 25,
      messages: [],
      loadingPrevious: false,
      allowedToLoadPrevious: false,
    }

    this.loadPrevious = this.loadPrevious.bind(this)
  }
  componentDidMount() {
    return this.loadData().then(() => {
      process.nextTick(() => {
        // scroll to the last message
        let messages = document.querySelector(".messages")
        let lastMessage = document.querySelector(".messages .message:last-of-type")
        let delay = 750
        if (lastMessage) {
          scrollToTopPosition(getTopPostion(lastMessage), messages, delay)
        }

        // after first set isloaded and user's scroll is set to the last message, allow to load previous messages
        this.setState({allowedToLoadPrevious: true})
      })
    })
  }

  loadData() {
    return loadData(this.state.offset, this.state.limit)
      .then(newMessages => {
        this.setState({messages: R.concat(R.reverse(newMessages), this.state.messages), offset: this.state.offset + this.state.limit})
      })
  }
  loadPrevious(isVisible) {
    if (!isVisible || !this.state.allowedToLoadPrevious || this.state.loadingPrevious) return

    // get current first message and its current top position
    let firstMessage = document.querySelectorAll(".messages .message")[0]
    let oldFirstMessageTopPosition = getTopPostion(firstMessage)

    this.setState({loadingPrevious: true})
    return this.loadData()
    .then(() => {
      process.nextTick(() => {
        // remain the viewport at the same position as before loading the new data
        let messages = document.querySelector(".messages")
        let newFirstMessageTopPosition = getTopPostion(firstMessage)
        let delay = 0
        if (firstMessage) {
          scrollToTopPosition(newFirstMessageTopPosition - oldFirstMessageTopPosition, messages, delay)
        }

        this.setState({loadingPrevious: false})
      })
    })
  }

  render() {
    let messages = this.state.messages
    return (
      <div className="app">
        <div className="header">
          <img src={logo} className="logo" alt="logo" />
        </div>
        <div className="intro">
          <p>The example shows how to maintain scroll position when loading new content above the old one.</p>
        </div>
        <div className="messages">
          <div className="loading">
            loading ...
            <VisibilitySensor onChange={this.loadPrevious} delay={0} containment={document.querySelector('.messages')}/>
          </div>
          {messages.map(message => <div className="message" key={message} dangerouslySetInnerHTML={{__html: message}}></div>)}
          <textarea className="send">send message</textarea>
        </div>
      </div>
    )
  }
}

export default App

// HELPERS
function loadData(offset, limit) {
  let delay = 2000
  return Promise.resolve(true).then(wait(1000)).then(() => generateData(offset, limit), delay)
}
function generateData(offset, limit) {
  return R.range(offset, offset + limit)
}
function wait(ms) {
  return function(x) {
    return new Promise(resolve => setTimeout(() => resolve(x), ms))
  }
}
function scrollToTopPosition(topPosition, parent, delay) {
  $(parent).animate({scrollTop: topPosition}, delay)
}
function getTopPostion(el) {
  return $(el).offset().top
}

