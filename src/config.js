const configurationPeerConnection = {
  iceServers: [
    {
      urls: "turn:na.relay.metered.ca:80",
      username: "a9771e697028c08786af0d5e",
      credential: "YtkNt/ARwHi5hXLZ",
    },
  ],
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
