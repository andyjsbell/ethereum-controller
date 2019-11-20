pragma solidity ^0.5.0;
import "./ContractI.sol";

contract DummyContract is ContractI {

    event PaidFor(address sender);

    constructor() public {

    }

    function paidFor() public {
        emit PaidFor(msg.sender);
    }
}