require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url:'https://polygon-mumbai.g.alchemy.com/v2/ysNiaflQRIxmbDEY06sdesZVitDVlm6r',
      accounts: ['78a14779c5093945541d10e5f9fc93005656fe97efda828ea50ea19370f97bd3']
    }
  }
};
 