pragma solidity ^0.4.23;

import "./SMCFields.sol";

contract ShardingManager is SMCFields {

    // Collators
    function registerCollator() public payable {
        require(!collatorRegistry[msg.sender].deposited);
        require(msg.value >= COLLATOR_DEPOSIT);

        uint index = collatorPoolLen; 
        collatorPool.push(msg.sender);
        collatorPoolLen++;
        collatorRegistry[msg.sender] = Collator(0, index, true);
    }

    function deregisterCollator() public {
        require(collatorRegistry[msg.sender].deposited);
        
        uint index = collatorRegistry[msg.sender].poolIndex;
        collatorRegistry[msg.sender].deregistered = block.number / PERIOD_LENGTH;
        delete collatorPool[index];
        collatorPoolLen--;
    }

    function releaseCollator() public {
        require(collatorRegistry[msg.sender].deposited);
        require(collatorRegistry[msg.sender].deregistered != 0);
        require(((block.number / PERIOD_LENGTH) > collatorRegistry[msg.sender].deregistered + COLLATOR_LOCKUP_LENGTH));

        delete collatorRegistry[msg.sender];
        msg.sender.transfer(COLLATOR_DEPOSIT);
    }
    
    // Proposers

    function registerProposer() public payable {
        require(!proposerRegistry[msg.sender].deposited);
        require(msg.value >= PROPOSER_DEPOSIT);

        proposerRegistry[msg.sender] = Proposer(0, true);
    }

    function deregisterProposer() public {
        require(proposerRegistry[msg.sender].deposited);
        proposerRegistry[msg.sender].deregistered = block.number / PERIOD_LENGTH;
    }

    function releaseProposer() public {
        require(proposerRegistry[msg.sender].deposited);
        require(proposerRegistry[msg.sender].deregistered != 0);
        require(((block.number / PERIOD_LENGTH) > proposerRegistry[msg.sender].deregistered + PROPOSER_LOCKUP_LENGTH));

        msg.sender.transfer(PROPOSER_DEPOSIT);
    }

    function proposerAddBalance(uint _shardId) public payable {
        require(_shardId < SHARD_COUNT);
        require(((_shardId & NETWORK_ID) >> 7) == 1);
        require(proposerRegistry[msg.sender].deposited);

        proposerRegistry[msg.sender].balances[_shardId] = msg.value;
    }

    function proposerWithdrawBalance(uint _shardId) public {
        require(_shardId < SHARD_COUNT);
        require(((_shardId & NETWORK_ID) >> 7) == 1);
        require(proposerRegistry[msg.sender].deposited);
        
        uint balance = proposerRegistry[msg.sender].balances[_shardId];
        msg.sender.transfer(balance);
    }

}