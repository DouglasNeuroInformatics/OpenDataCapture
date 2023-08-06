import React from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

import { StatusBar } from 'expo-status-bar';

const styles = StyleSheet.create({
  app: {
    padding: 32
  },
  inputContainer: {
    flexDirection: 'row'
  },
  textInput: {
    borderWidth: 1,
    flexGrow: 1,
    padding: 4
  }
});

const App = () => {
  return (
    <View style={styles.app}>
      <View>
        <Text>My App</Text>
        <Text>Hello World</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput placeholder="Item..." style={styles.textInput} />
        <Button title="Append Goal" />
      </View>
      <StatusBar />
    </View>
  );
};

export default App;
