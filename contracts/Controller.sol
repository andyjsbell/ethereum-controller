pragma solidity ^0.5.0;
import "./ContractI.sol";

contract Controller {

    ContractI public theContract;

    constructor(ContractI _contract) public {
        theContract = _contract;
    }

    function callTheContract() public {
        theContract.paidFor();
    }

}