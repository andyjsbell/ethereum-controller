import React, { Component, useState } from 'react';
import './App.css';
import getWeb3 from "./utils/getWeb3";
import 'semantic-ui-css/semantic.min.css';
import { Button, Input } from 'semantic-ui-react';

// web3 https://github.com/ethereum/wiki/wiki/JavaScript-API
const Web3 = require('web3');

const Home = (props) => {
  
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');

  const signMessage = () => {
    console.log('sign message:' + message);
    const hashedMessage = props.web3.sha3(message);
    console.log(props.accounts[0]);
    props.web3.eth.sign(props.accounts[0], hashedMessage, (e,r) => {
      setSignature(r);
    });
  };

  return(
    <>
      <h1>ethereum-controller</h1>
      <h3>Account: {props.accounts[0]}</h3>
      <h3>Signature: {signature}</h3>
      <Input focus placeholder='Message...' onChange={e => setMessage(e.target.value)}/>
      <Button primary onClick={() => signMessage()}>Sign Message</Button>
    </>
  );
};

class App extends Component {

  state = {web3: null, accounts: []};
  
  handleChange(event, newValue) {
    this.setState({value: newValue});
  }

  componentDidMount = async () => {
    try {
      // Workaround for compatibility between web3 and truffle-contract
      
      Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;	
      
      const web3 = await getWeb3();
      const accounts = await web3.eth.accounts;
      this.setState({ web3:web3, accounts:accounts });
      
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