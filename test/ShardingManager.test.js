/* global artifacts, contract, it, beforeEach, web3 */
/* eslint no-unused-expressions: 0 */

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')())
  .should();
  
const ShardingManager = artifacts.require('ShardingManager');
  
contract('ShardingManager', () => {

    describe('Collators Registration', () => {
        beforeEach('setup contract for each test', async () => {
            this.smc = await ShardingManager.new();
        })

        it('should register collator', async () => {
            const collator = this.smc.registerCollator();
            collator.should.be.true;
        });

    });
});