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

  function generate_token(length) {
    //edit the token allowed characters
    var a =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split(
        ""
      );
    var b = [];
    for (var i = 0; i < length; i++) {
      var j = (Math.random() * (a.length - 1)).toFixed(0);
      b[i] = a[j];
    }
    return b.join("");
  }

  const signInWithGithub = () => {
    const provider = new firebase.auth.GithubAuthProvider();
    auth.signInWithPopup(provider).then(() => {
      localStorage.setItem("username", `user${generate_token(7)}`);
    });
  };

  return (
    <div className="container pt-3 text-center">
      <div className="pb-2">
        <Button className="sign-in" onClick={signInWithGoogle}>
          Sign in with Google 
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-google"
            viewBox="0 0 16 16"
          >
            <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
          </svg>
        </Button>
      </div>
      <div>
        <Button
          type="primary"
          style={{ backgroundColor: "black" }}
          className="sign-in"
          onClick={signInWithGithub}
        >
          Sign in with Github 
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-github"
            viewBox="0 0 16 16"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </Button>
      </div>

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
  console.log(user);

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
      name:
        props.user.displayName !== null
          ? props.user.displayName
          : localStorage.getItem("username"),
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
