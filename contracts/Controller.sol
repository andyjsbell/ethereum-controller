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

    function getAddressOfSigner(bytes32 hash, bytes memory signature)
        public
        pure
        returns(address) {
        bytes32 r;
        bytes32 s;
        uint8 v;

        require(signature.length == 65, 'Invalid length of signature');

        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }

        require(v > 1, 'Invalid v');

        if (v < 27) {
            v += 27;
        }

        return ecrecover(hash, v, r, s);
    }
}