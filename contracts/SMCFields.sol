pragma solidity ^0.4.23;

/**
 * @title SMC Fields
 * @author Adrian Hetman
 * @dev SMC for the Sharding Phase one from 10th of April. Not all fields are currently used.
 * @notice Required fields for the SMC
 */
contract SMCFields {

    struct CollationHeader {
        uint shardId;
        bytes32 parentHash;
        bytes32 chunkRoot;
        uint period;
        uint height;
        address proposerAddress;
        uint proposerBid;
        bytes proposerSignature;
    }
    
    struct Collator {
        uint deregistered;
        uint poolIndex;
        bool deposited;
    }

    struct Proposer {
        uint deregistered;
        bool deposited;
        mapping(uint => uint) balances;
    }

    address[] public collatorPool;
    uint public collatorPoolLen;
    address[] public proposerPool;
    uint public proposerPoolLen;
    uint[] public emptySlotsStack;
    uint public emptySlotsStackTop;
    
    mapping(address => Collator) public collatorRegistry;
    mapping(address => Proposer) public proposerRegistry;

    mapping (uint => mapping (bytes32 => bytes32)) public collationTrees;

    // Shards
    uint constant SHARD_COUNT = 100;
    uint constant NETWORK_ID = 0x81;
    uint constant PERIOD_LENGTH = 5;
    uint constant LOOKAHEAD_LENGTH = 4;

    // Collations
    uint constant COLLATION_SIZE = 2 ** 20;
    uint constant COLLATOR_SUBSIDY = 0.001 ether;
    
    // Registries
    uint constant COLLATOR_DEPOSIT = 5 ether;
    uint constant PROPOSER_DEPOSIT = 1 ether;
    uint constant MIN_PROPOSER_BALANCE = 0.1 ether;
    uint constant COLLATOR_LOCKUP_LENGTH = 16128;
    uint constant PROPOSER_LOCKUP_LENGTH = 48;

}