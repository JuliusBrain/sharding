/* global artifacts, contract, it, beforeEach, web3 */
/* eslint no-unused-expressions: 0 */

const { mineBlock, mineNBlocks, addSeconds, EVMError, ether} = require('./utils/testUtils.js');
const ShardingManager = artifacts.require('ShardingManager');

contract('ShardingManager', (accounts) => {

    const nullAddress = '0x0000000000000000000000000000000000000000';
    const shardId = '0x1000000000000000000000000000000000000001';
    const ownerAddress = accounts[0];
    const collatorAddress = accounts[1];
    const proposerAddress = accounts[2];

    const periodLength = 5;

    beforeEach('setup contract for each test', async () => {
        smc = await ShardingManager.new();
    })

    describe('Registration of Collator', () => {
        it('should register collator', async () => {
            // when
            await smc.registerCollator({from: collatorAddress, value: ether(5)});

            // then
            (await smc.collatorPoolLen()).should.be.bignumber.equal(1);
            (await smc.collatorPool(0)).should.be.equal(collatorAddress);
            
            const collatorStruct = await smc.collatorRegistry(collatorAddress);
            (await collatorStruct[0]).should.be.bignumber.equal(0);
            (await collatorStruct[1]).should.be.bignumber.equal(0);
            (await collatorStruct[2]).should.be.true;
        });

        it('should not register registered collator', async () => {
            // given
            await smc.registerCollator({from: collatorAddress, value: ether(5)});
            
            // when
            const collator = smc.registerCollator({from: collatorAddress, value: ether(5)});

            // then
            await collator.should.be.rejectedWith(EVMError('revert'));
        });

        it('should fail when deposite below minimal deposit', async () => {
            // when
            const collator = smc.registerCollator({from: collatorAddress, value: ether(4)});

            // then
            await collator.should.be.rejectedWith(EVMError('revert'));
        });
    });
    describe('Deregistration of Collator', () => {
        it('should deregister collator', async () => {
            // given
            await smc.registerCollator({from: collatorAddress, value: ether(5)});
            
            // when
            await smc.deregisterCollator({from: collatorAddress});
            
            // then
            (await smc.collatorPoolLen()).should.be.bignumber.equal(0);
            (await smc.collatorPool(0)).should.be.equal(nullAddress);
            const expectedDeregisterNumber = parseInt(web3.eth.blockNumber / periodLength);
            const collatorStructDeregistered = await smc.collatorRegistry(collatorAddress);
            (await collatorStructDeregistered[0]).should.be.bignumber.equal(expectedDeregisterNumber);
        });

        it('should fail when deregistering non-existing collator', async () => { 
            // when
            const deregister = smc.deregisterCollator({from: collatorAddress});

            // then
            await deregister.should.be.rejectedWith(EVMError('revert'));
        });
    });

    describe('Registration of Proposer', () => {
        it('should register proposer', async () => {
            // when
            await smc.registerProposer({from: proposerAddress, value: ether(1)});

            // then
            const proposerStruct = await smc.proposerRegistry(proposerAddress);
            (await proposerStruct[0]).should.be.bignumber.equal(0);
            (await proposerStruct[1]).should.be.true;
        });

        it('should not register registered proposer', async () => {
            // given
            await smc.registerProposer({from: proposerAddress, value: ether(1)});

            // when
            const proposer = smc.registerProposer({from: proposerAddress, value: ether(1)});

            // then
            await proposer.should.be.rejectedWith(EVMError('revert'));
        });

        it('should fail when deposite below minimal deposit', async () => {
            // when
            const proposer = smc.registerProposer({from: proposerAddress, value: ether(0.1)});

            // then
            await proposer.should.be.rejectedWith(EVMError('revert'));
        });
    });

    describe('Degistration of Proposer', () => {
        it('should deregister proposer', async () => {
            // given
            await smc.registerProposer({from: proposerAddress, value: ether(1)});
            
            // when
            await smc.deregisterProposer({from: proposerAddress});

            // then
            const expectedDeregisterNumber = parseInt(web3.eth.blockNumber / periodLength);
            const proposerStructDeregistered = await smc.proposerRegistry(proposerAddress);
            (await proposerStructDeregistered[0]).should.be.bignumber.equal(expectedDeregisterNumber); 
        });

        it('should fail when deregistering non-existing proposer', async () => { 
            // when
            const deregister = smc.deregisterProposer({from: proposerAddress});

            // then
            await deregister.should.be.rejectedWith(EVMError('revert'));
        });
    });

    describe('Release of Proposer', () => {
        it('should release proposer', async () => {
            // given
            await smc.registerProposer({from: proposerAddress, value: ether(1)});
            await smc.deregisterProposer({from: proposerAddress});

            // when
            await mineNBlocks(49*5);
            const initBalance = await web3.eth.getBalance(proposerAddress);
            await smc.releaseProposer({from: proposerAddress}); 
            
            // then
            (await web3.eth.getBalance(proposerAddress)).should.be.bignumber.greaterThan(initBalance);  
        });
    });

});