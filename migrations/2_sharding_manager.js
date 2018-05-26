/* global artifacts */

const ShardingManager = artifacts.require('./ShardingManager.sol');

module.exports = (deployer) => {
  deployer.deploy(ShardingManager);
};

