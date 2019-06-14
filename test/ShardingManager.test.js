/* global artifacts, contract, describe, it, beforeEach, web3 */
/* eslint no-unused-expressions: 0 */

const {
  mineNBlocks, EVMError, ether,
} = require('./utils/testUtils.js');

const ShardingManager = artifacts.require('ShardingManager');

contract('ShardingManager', (accounts) => {
  const nullAddress = '0x0000000000000000000000000000000000000000';
  const collatorAddress = accounts[1];
  const proposerAddress = accounts[2];

  const periodLength = 5;

  beforeEach('setup contract for each test', async () => {
    this.smc = await ShardingManager.new();
  });

  describe('Registration of Collator', () => {
    it('should register collator', async () => {
      // when
      await this.smc.registerCollator({ from: collatorAddress, value: ether(5) });

      // then
      (await this.smc.collatorPoolLen()).should.be.bignumber.equal(1);
      (await this.smc.collatorPool(0)).should.be.equal(collatorAddress);

      const collatorStruct = await this.smc.collatorRegistry(collatorAddress);
      (await collatorStruct[0]).should.be.bignumber.equal(0);
      (await collatorStruct[1]).should.be.bignumber.equal(0);
      (await collatorStruct[2]).should.be.true;
    });

    it('should not register registered collator', async () => {
      // given
      await this.smc.registerCollator({ from: collatorAddress, value: ether(5) });

      // when
      const collator = this.smc.registerCollator({ from: collatorAddress, value: ether(5) });

      // then
      await collator.should.be.rejectedWith(EVMError('revert'));
    });

    it('should fail when deposite below minimal deposit', async () => {
      // when
      const collator = this.smc.registerCollator({ from: collatorAddress, value: ether(4) });

      // then
      await collator.should.be.rejectedWith(EVMError('revert'));
    });
  });
  describe('Deregistration of Collator', () => {
    it('should deregister collator', async () => {
      // given
      await this.smc.registerCollator({ from: collatorAddress, value: ether(5) });

      // when
      await this.smc.deregisterCollator({ from: collatorAddress });

      // then
      (await this.smc.collatorPoolLen()).should.be.bignumber.equal(0);
      (await this.smc.collatorPool(0)).should.be.equal(nullAddress);
      const expectedDeregisterNumber = Math.floor(web3.eth.blockNumber / periodLength);
      const collatorStructDeregistered = await this.smc.collatorRegistry(collatorAddress);
      (await collatorStructDeregistered[0]).should.be.bignumber.equal(expectedDeregisterNumber);
    });

    it('should fail when deregistering non-existing collator', async () => {
      // when
      const deregister = this.smc.deregisterCollator({ from: collatorAddress });

      // then
      await deregister.should.be.rejectedWith(EVMError('revert'));
    });
  });

  describe('Registration of Proposer', () => {
    it('should register proposer', async () => {
      // when
      await this.smc.registerProposer({ from: proposerAddress, value: ether(1) });

      // then
      const proposerStruct = await this.smc.proposerRegistry(proposerAddress);
      (await proposerStruct[0]).should.be.bignumber.equal(0);
      (await proposerStruct[1]).should.be.true;
    });

    it('should not register registered proposer', async () => {
      // given
      await this.smc.registerProposer({ from: proposerAddress, value: ether(1) });

      // when
      const proposer = this.smc.registerProposer({ from: proposerAddress, value: ether(1) });

      // then
      await proposer.should.be.rejectedWith(EVMError('revert'));
    });

    it('should fail when deposite below minimal deposit', async () => {
      // when
      const proposer = this.smc.registerProposer({ from: proposerAddress, value: ether(0.1) });

      // then
      await proposer.should.be.rejectedWith(EVMError('revert'));
    });
  });

  describe('Degistration of Proposer', () => {
    it('should deregister proposer', async () => {
      // given
      await this.smc.registerProposer({ from: proposerAddress, value: ether(1) });

      // when
      await this.smc.deregisterProposer({ from: proposerAddress });

      // then
      const expectedDeregisterNumber = Math.floor(web3.eth.blockNumber / periodLength);
      const proposerStructDeregistered = await this.smc.proposerRegistry(proposerAddress);
      (await proposerStructDeregistered[0]).should.be.bignumber.equal(expectedDeregisterNumber);
    });

    it('should fail when deregistering non-existing proposer', async () => {
      // when
      const deregister = this.smc.deregisterProposer({ from: proposerAddress });

      // then
      await deregister.should.be.rejectedWith(EVMError('revert'));
    });
  });

  describe('Release of Proposer', () => {
    it('should release proposer', async () => {
      // given
      await this.smc.registerProposer({ from: proposerAddress, value: ether(1) });
      await this.smc.deregisterProposer({ from: proposerAddress });

      // when
      await mineNBlocks(49 * 5);
      const initBalance = await web3.eth.getBalance(proposerAddress);
      await this.smc.releaseProposer({ from: proposerAddress });

      // then
      (await web3.eth.getBalance(proposerAddress)).should.be.bignumber.greaterThan(initBalance);
    });
  });
});
