const Controller = artifacts.require("Controller");
const DummyContract = artifacts.require("DummyContract");

module.exports = async function(deployer) {
    await deployer.deploy(DummyContract);
    let dummyContractInstance = await DummyContract.deployed();
  
    await deployer.deploy(Controller, dummyContractInstance.address);
};
