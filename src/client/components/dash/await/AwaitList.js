import React, { Component } from 'react'
import { connect } from 'react-redux'
import { SingleAwait} from '../../index'
import { createChat } from '../../../store/reducers/chat'
import { getLikes } from '../../../store/reducers/likes'

class AwaitList extends Component {
  constructor(){
    super()
    this.createChat = this.createChat.bind(this)
  }
  componentDidMount(){
    const userId = this.props.auth.user;
    this.props.getCurrentUser(userId);
    this.props.getLikes(userId);
  }

  createChat(prospect) {

    let newChat = {
      chatId: prospect.userId ,
      name: prospect.name,
      people: {
        prospect: {
          name: prospect.name
        },
        user: {
          name: "Daphe"
        }
      },
      image: prospect.image
    }
    console.log("TCL: AwaitList -> createChat -> newChat ", newChat )
    this.props.createChatRoom(newChat)
  }


  render() {
    const prospects = [ {
      userId: "1",
      name: "Johnny",
      age: 24,
      gemder: 'male',
      image:  "https://pbs.twimg.com/profile_images/1005956021087547393/RdD7s-Gb_400x400.jpg"
    },{
      userId: "2",
      name: "Freddy",
      age: 24,
      gemder: 'male',
      image: "https://cdn.images.express.co.uk/img/dynamic/35/590x/Freddie-Mercury-final-pictures-1208447.jpg?r=1574537671789"
    }]
    console.log('CHAT', this.props.chats)
    return (
      <section className="section">
        <div className='container'>
          <h1 className="title is-1">Await</h1>
          <hr />
          {prospects.map(prospect => {
            return <SingleAwait key={prospect.userId} prospect={prospect} createChat={this.createChat} />
          })}
        </div>
      </section>

    );
  }
}

const mapStateToProps = state =>  {
  return {
    chats: state.chat.chats,
    prospects: state.likes.likes,
    user: state.users.user,
    auth: state.auth,
  }
}

const mapDispatchToProps = dispatch =>  {
  return {
    createChatRoom: (newChat) => dispatch(createChat(newChat)),
    getLikes: (userId) => dispatch(getLikes(userId))
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(AwaitList);
