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

  const sendTransaction = () => {
    var rawTx = {
      nonce: '0x00',
      gasPrice: '0x09184e72a000', 
      gasLimit: '0x2710',
      to: '0x0000000000000000000000000000000000000000', 
      value: '0x00', 
      data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057'
     }
     var tx = new Tx(rawTx);
     tx.sign(localIdentity.privateKey);
     var serializedTx = tx.serialize();
     //console.log(serializedTx.toString('hex'));
     //f889808609184e72a00082271094000000000000000000000000000000000000000080a47f74657374320000000000000000000000000000000000000000000000000000006000571ca08a8bbf888cfa37bbf0bb965423625641fc956967b81d12e23709cead01446075a01ce999b56a8a88504be365442ea61239198e23d1fce7d00fcfc5cd3b44b7215f
     web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
      if (!err)
        console.log(hash); // "0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385"
      else 
        console.log(err);
    });     
  };

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
      <Button secondary onClick={() => sendTransaction()}>Send Transaction</Button>
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