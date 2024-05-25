import React, { useState } from 'react';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { View, StyleSheet, TouchableOpacity, Text, TextInput } from 'react-native';

const BOT_USER = {
  _id: 2,
  name: 'ChatBot',
  avatar: 'images/ChatBot.png',
};

const App = () => {
  const [messages, setMessages] = useState([
    {
      _id: 1,
      text: 'Hello! How can I assist you today?',
      createdAt: new Date(),
      user: BOT_USER,
    },
  ]);
  const [messageInput, setMessageInput] = useState('');

  const handleSend = () => {
    if (messageInput.trim().length > 0) {
      const userMessage = messageInput.trim();
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, [{
          _id: Math.round(Math.random() * 1000000),
          text: userMessage,
          createdAt: new Date(),
          user: { _id: 1 },
        }])
      );
  
      // Send the user's message to the server for sentiment analysis
      fetch('http://192.168.1.101:5000/classify_sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sentence: userMessage }),
      })
      .then(response => {
        console.log(response); // Log the raw response
        return response.json();
      })
      .then(data => {
        // Handle the response from the server
        const botMessage = {
          _id: Math.round(Math.random() * 1000000),
          text: `Sentiment analysis result: ${data.sentiment}`,
          createdAt: new Date(),
          user: BOT_USER,
        };
        setMessages(previousMessages => GiftedChat.append(previousMessages, botMessage));
      })
      .catch(error => {
        // Handle the error
        console.error(error);
      });

      setMessageInput('');
    }
  };

  const handleKeyPress = (event) => {
    if (event.nativeEvent.key === 'Enter' && !event.nativeEvent.shiftKey) {
      handleSend();
    }
  };

  // Customizing the bubble styles for the bot's responses
  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#E0E0E0', // Background color for bot's messages
          },
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={handleSend}
        user={{ _id: 1 }}
        placeholder="Type a message..."
        textInputProps={{
          style: styles.input,
          onChangeText: setMessageInput,
          value: messageInput,
          onKeyPress: handleKeyPress // Handle key press events
        }}
        renderSend={(props) => (
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: messageInput.trim().length > 0 ? '#0084FF' : '#CCCCCC' }]}
            onPress={handleSend}
            disabled={messageInput.trim().length === 0}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        )}
        renderBubble={renderBubble} // Apply the custom bubble rendering
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    width: 60,
    height: 40,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default App;
