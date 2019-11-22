import React, { Component, useState } from 'react';
import './App.css';
import getWeb3 from "./utils/getWeb3";
import 'semantic-ui-css/semantic.min.css';
import { Button, Input } from 'semantic-ui-react';
import Tx from 'ethereumjs-tx';
import ControllerContract from './contracts/Controller.json'
// web3 https://github.com/ethereum/wiki/wiki/JavaScript-API
const Web3 = require('web3');
// https://github.com/pubkey/eth-crypto/
const EthCrypto = require('eth-crypto');
const localIdentity = EthCrypto.createIdentity();

const Home = (props) => {
  
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [hashedMessage, setHashedMessage] = useState('');
  const [accountFromSignature, setAccountFromSignature] = useState('');

  const signMessage = () => {
    const hash = props.web3.sha3(message)
    props.web3.eth.sign(props.accounts[0], hash, (e,r) => {
      setSignature(r);
      setHashedMessage(hash);
      setAccountFromSignature('');
    });
  };
  
  const signLocalMessage = () => {
    const hash = EthCrypto.hash.keccak256(message)
    const signature = EthCrypto.sign(
      localIdentity.privateKey,
      hash
    );
    setSignature(signature);
    setHashedMessage(hash);
    setAccountFromSignature('');
  };
  
  const confirmMessage = async () => {
    props.controller.getAddressOfSigner(hashedMessage, signature, (err, account) => {
      console.log("account:", account);
      setAccountFromSignature(account);
    });
  };

  return(
    <>
      <h1>ethereum-controller (web3 {props.web3.version.api}v)</h1>
      <h3>Account: {props.accounts[0]}</h3>
      <h3>Local Identity: {localIdentity.address}</h3>
      <Input focus placeholder='Message...' onChange={e => setMessage(e.target.value)}/>
      <Button primary onClick={() => signMessage()}>Sign Message</Button>
      <Button secondary onClick={() => signLocalMessage()}>Sign Message Local</Button>
      <Button primary onClick={() => confirmMessage()}>Confirm Message</Button>
      <h3>Hash: {hashedMessage}</h3>
      <h3>Signature: {signature}</h3>
      <h3>Account from Signature: {accountFromSignature}</h3>
    </>
  );
};

class App extends Component {

  state = {web3: null, accounts: [], controller: null};
  
  handleChange(event, newValue) {
    this.setState({value: newValue});
  }

  componentDidMount = async () => {
    try {
      // Workaround for compatibility between web3 and truffle-contract
      Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;	
      
      const web3 = await getWeb3();
      const accounts = await web3.eth.accounts;
      const networkId = await web3.version.network;
      const deployedNetwork = ControllerContract.networks[networkId];
      console.log(networkId);
      console.log(ControllerContract);
      console.log(deployedNetwork);
      console.log(localIdentity);
      const contract  = web3.eth.contract(ControllerContract.abi);
      const instance = contract.at(deployedNetwork.address);

      this.setState({ web3:web3, accounts:accounts, controller:instance });
      
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );

      console.error(error);
    }
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contracts...</div>;
    }
    
    return (
      <>
        <Home {...this.state}/>
      </>
    );
  }
}

export default App;