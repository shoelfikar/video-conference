const videosGrid = document.getElementById("videos-grid")
const myVideo = document.createElement('video')
myVideo.classList.add("max-w-[700px]",  "max-h-[500px]",  "object-cover", "m-2", "border",  "border-white")

var getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "3000",
});

const connectToNewUser = (userId, streams) => {
    const call = peer.call(userId, streams);
    // console.log(call);
    const video = document.createElement("video");
    video.classList.add("max-w-[700px]",  "max-h-[500px]",  "object-cover", "m-2", "border",  "border-white")
    call.on("stream", (userVideoStream) => {
    //   console.log(userVideoStream);
      addVideoStream(video, userVideoStream);
    });
};

const addVideoStream = (videoEl, stream) => {
    videoEl.srcObject = stream;
    videoEl.addEventListener("loadedmetadata", () => {
      videoEl.play();
    });
  
    videosGrid.append(videoEl);
    let totalUsers = document.getElementsByTagName("video").length;
    if (totalUsers > 1) {
      for (let index = 0; index < totalUsers; index++) {
        document.getElementsByTagName("video")[index].style.width =
          100 / totalUsers + "%";
      }
    }
};


peer.on("open", (id)=> {
    console.log(id)
    socket.emit("join-room", ROOM_ID, id)
})

peer.on("close", (id)=> {
    socket.emit("left-room", ROOM_ID, id, "left the room")
})

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    currentStream = stream;
    addVideoStream(myVideo, stream);

    console.log("stream start")

    peer.on("call", (call) => {
        console.log("call someone")
      call.answer(stream);
      const video = document.createElement("video");
      video.classList.add("max-w-[700px]",  "max-h-[500px]",  "object-cover", "m-2", "border",  "border-white")

      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });

      call.on("close", ()=> {
        socket.emit("left-room", ROOM_ID, id, "left the room")
        console.log("user left conference")
      })
    });

    socket.on("user-connected", (userId) => {
        console.log("new user join")
        connectToNewUser(userId, stream);
    });

    const chatGroups = document.querySelector('.chat-groups')

    socket.on("createMessage", (msg) => {
        console.log(msg);
        const elem = `<div class="bg-gray-700 p-2 rounded-lg mb-2">
                        <p class="text-sm font-semibold">${msg.user}</p>
                        <p class="text-sm">${msg.message}</p>
                    </div>`
        chatGroups.innerHTML += elem
        // let li = document.createElement("li");
        // li.innerHTML = msg;
        // all_messages.append(li);
        // main__chat__window.scrollTop = main__chat__window.scrollHeight;
    });
  });;

peer.on("call", function (call) {
    getUserMedia(
      { video: true, audio: true },
      function (stream) {
        console.log("init video stream")
        call.answer(stream); // Answer the call with an A/V stream.
        const video = document.createElement("video");
        video.classList.add("max-w-[700px]",  "max-h-[500px]",  "object-cover", "m-2", "border",  "border-white")
        call.on("stream", function (remoteStream) {
          addVideoStream(video, remoteStream);
        });

        call.on("close", ()=> {
            socket.emit("left-room", ROOM_ID, id, "left the room")
            console.log("user left conference")
        })
      },
      function (err) {
        console.log("Failed to get local stream", err);
      }
    );
});



