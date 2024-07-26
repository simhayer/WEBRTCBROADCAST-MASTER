const configurationPeerConnection = {
  iceServers: [
    {
      urls: "stun:147.182.214.128:3478",
    },
    {
      urls: "stun:147.182.214.128:3478",
      username: "user1",
      credential: "key1",
    },
  ],
  // iceServers: [
  //   {
  //     urls: "stun:stun.relay.metered.ca:80",
  //   },
  //   {
  //     urls: "turn:global.relay.metered.ca:80",
  //     username: "aca60fb4568ea274f8245009",
  //     credential: "Zi/jzkiJuI2fmwLx",
  //   },
  //   {
  //     urls: "turn:global.relay.metered.ca:80?transport=tcp",
  //     username: "aca60fb4568ea274f8245009",
  //     credential: "Zi/jzkiJuI2fmwLx",
  //   },
  //   {
  //     urls: "turn:global.relay.metered.ca:443",
  //     username: "aca60fb4568ea274f8245009",
  //     credential: "Zi/jzkiJuI2fmwLx",
  //   },
  //   {
  //     urls: "turns:global.relay.metered.ca:443?transport=tcp",
  //     username: "aca60fb4568ea274f8245009",
  //     credential: "Zi/jzkiJuI2fmwLx",
  //   },
  // ],
};

const offerSdpConstraints = {
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true,
  },
  optional: [],
};

module.exports = {
  configurationPeerConnection,
  offerSdpConstraints,
};
