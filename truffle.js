const HDWalletProvider = require('truffle-hdwallet-provider');

const infuraApiKey = '85CnflqLM9kt0PaeGeSv';
const mnemonic = 'endless flash neutral online local culture tackle describe grunt major speak nothing';


const createProvider = (net) => {
  if (!process.env.SOLIDITY_COVERAGE) {
    return new HDWalletProvider(mnemonic, `https://${net}.infura.io/${infuraApiKey}`);
  }
};

module.exports = {
  networks: {
    ropsten: {
      provider: createProvider('ropsten'),
      network_id: 3,
      gas: 3290337,
    },
    rinkeby: {
      provider: createProvider('rinkeby'),
      network_id: 4,
      gas: 4700000,
    },
    ganache: {
      host: '127.0.0.1',
      port: 8555,
      network_id: '*', // Match any network id
    },
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
};
