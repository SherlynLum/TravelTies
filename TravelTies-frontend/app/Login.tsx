import { View, Text } from 'react-native'
import React, { useState } from 'react';
import { FIREBASE_AUTH } from '../firebaseConfig';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = FIREBASE_AUTH;

  return (
    <View style>
      <Text>Login</Text>
    </View>
  )
}

export default login;