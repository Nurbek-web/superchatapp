import "./App.css";
import "antd/dist/antd.css";
import ReactTimeAgo from "react-time-ago";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

import firebaseConfig from "./firebase";
import { useRef, useState } from "react";

import { Input, Avatar, Comment, Button } from "antd";

const { Search } = Input;

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <section>{user ? <Chat user={user} /> : <SignIn auth={auth} />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <div className="container pt-3 text-center">
      <Button type="primary" className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </Button>
      <p>
        Do not violate the community guidelines or you will be banned for life!
      </p>
    </div>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <Button
        type="primary"
        className="sign-out"
        onClick={() => auth.signOut()}
      >
        Sign Out
      </Button>
    )
  );
}

function Chat({ user }) {
  const dummy = useRef();

  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt", "desc").limit(25);

  const [messages] = useCollectionData(query, { idField: "uid" });
  console.log(messages);

  console.log(dummy);

  return (
    <div className="container">
      <div
        style={{
          position: "fixed",
          backgroundColor: "#fafafa",
          zIndex: 9999,
          width: "100%",
        }}
      >
        <div className="row d-flex">
          <div className="col-6">
            <h2>Global Chat</h2>
          </div>
          <div className="col-6 pt-2 text-right">
            <SignOut />
          </div>
        </div>
      </div>
      <div style={{ paddingTop: 50, paddingBottom: 35 }}>
        {messages &&
          messages.reverse().map((message, index) => {
            return (
              <Comment
                key={index}
                author={message.name}
                avatar={<Avatar src={message.photoURL} alt={message.name} />}
                content={<p>{message.text}</p>}
                datetime={
                  <ReactTimeAgo date={message.createdAt} locale="en-US" />
                }
              />
            );
          })}
        <span ref={dummy}></span>
      </div>
      <div
        style={{
          position: "fixed",
          width: "100%",
          zIndex: 9998,
          bottom: 0,
        }}
      >
        <MsgForm user={user} messagesRef={messagesRef} dummy={dummy} />
      </div>
    </div>
  );
}

function MsgForm(props) {
  const [value, setValue] = useState("");
  const messagesRef = props.messagesRef;

  const sendMessage = async (text) => {
    await messagesRef.add({
      text: text,
      createdAt: Date.now(),
      uid: props.user.uid,
      photoURL: props.user.photoURL,
      name: props.user.displayName,
    });
    props.dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  const onChange = (e) => {
    setValue(e.target.value);
  };

  const onFinish = (values) => {
    if (values !== "") {
      console.log(values);
      sendMessage(values);
      setValue("");
    }
  };

  return (
    <div className="pb-3">
      <Search
        placeholder="input message text"
        onSearch={onFinish}
        onChange={onChange}
        value={value}
        enterButton={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-chevron-right"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
            />
          </svg>
        }
      />
    </div>
  );
}

export default App;
