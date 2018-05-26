pragma solidity ^0.4.23;

import "./SMCFields.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
/**
 * @title ShardingManager
 * @author Adrian Hetman
 * @dev SMC for the Sharding Phase one from 10th of April
 * @notice For now SMC only implements registration of Collators and Proposers
 */
contract ShardingManager is SMCFields {
    
    using SafeMath for uint256;

    /**
    * @dev Adds an entry to collatorRegistry, updates the collator pool, locks a deposit of size COLLATOR_DEPOSIT.
    */
    function registerCollator() public payable {
        require(!collatorRegistry[msg.sender].deposited);
        require(msg.value == COLLATOR_DEPOSIT);

        uint index = collatorPoolLen; 
        collatorPool.push(msg.sender);
        collatorPoolLen = collatorPoolLen.add(1);
        collatorRegistry[msg.sender] = Collator(0, index, true);
    }

    /**
    * @dev Sets the deregistered period in the collatorRgistry entry, updates the collator pool.
    */
    function deregisterCollator() public {
        require(collatorRegistry[msg.sender].deposited);
        
        uint index = collatorRegistry[msg.sender].poolIndex;
        collatorRegistry[msg.sender].deregistered = block.number / PERIOD_LENGTH;
        delete collatorPool[index];
        collatorPoolLen = collatorPoolLen.sub(1);
    }

    /**
    * @dev Removes an entry from collatorRegistry, releases the collator deposit.
    */
    function releaseCollator() public {
        require(collatorRegistry[msg.sender].deposited);
        require(collatorRegistry[msg.sender].deregistered != 0);
        require(((block.number / PERIOD_LENGTH) > collatorRegistry[msg.sender].deregistered + COLLATOR_LOCKUP_LENGTH));

        delete collatorRegistry[msg.sender];
        msg.sender.transfer(COLLATOR_DEPOSIT);
    }

    /**
    * @dev Adds an entry to proposerRegistry, updates the proposer pool and locks a deposit of size PROPOSER_DEPOSIT.
    */
    function registerProposer() public payable {
        require(!proposerRegistry[msg.sender].deposited);
        require(msg.value >= PROPOSER_DEPOSIT);

        proposerRegistry[msg.sender] = Proposer(0, true);
    }

    /**
    * @dev Sets the deregistered period in the proposerRegistry entry.
    */
    function deregisterProposer() public {
        require(proposerRegistry[msg.sender].deposited);
        proposerRegistry[msg.sender].deregistered = block.number / PERIOD_LENGTH;
    }

    /**
    * @dev Removes an entry from proposerRegistry, releases the proposer deposit.
    */
    function releaseProposer() public {
        require(proposerRegistry[msg.sender].deposited);
        require(proposerRegistry[msg.sender].deregistered != 0);
        require(((block.number / PERIOD_LENGTH) > (proposerRegistry[msg.sender].deregistered + PROPOSER_LOCKUP_LENGTH)));

        msg.sender.transfer(PROPOSER_DEPOSIT);
    }

    /**
    * @param _shardId A 32-byte identifier for shards made of a 1-byte network ID, 30 reserved bytes set to 0x00, and a 1-byte shard number.
    * @dev Adds msg.value to the balance of the proposer on shardId.
    */
    function proposerAddBalance(uint _shardId) public payable {
        require(_shardId < SHARD_COUNT);
        require((((_shardId) & NETWORK_ID) >> 7) == 1);
        require(proposerRegistry[msg.sender].deposited);

        proposerRegistry[msg.sender].balances[_shardId] = msg.value;
    }

    /**
    * @param _shardId A 32-byte identifier for shards made of a 1-byte network ID, 30 reserved bytes set to 0x00, and a 1-byte shard number.
    * @dev Withdraws the balance of a proposer on shardId.
    */
    function proposerWithdrawBalance(uint _shardId) public {
        require(_shardId < SHARD_COUNT);
        require(((_shardId & NETWORK_ID) >> 7) == 1);
        require(proposerRegistry[msg.sender].deposited);
        
        uint balance = proposerRegistry[msg.sender].balances[_shardId];
        msg.sender.transfer(balance);
    }

}