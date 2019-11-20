import React, { Component, useState } from 'react';
import './App.css';
import getWeb3 from "./utils/getWeb3";

const Web3 = require('web3');

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
      const accounts = await web3.eth.getAccounts();
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
      <div className="App">
        Connected to Web3 :-)
      </div>
    );
  }
}


export default App;
