import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialIcons';  // Importing icons

// Validation Schemas
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const SignUpSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  retypePassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please retype your password'),
});

// Login Form Component
const LoginForm = ({ onLoginSuccess }) => {
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const handleLogin = async (values) => {
    try {
      // Retrieve registered users from AsyncStorage
      const registeredUsers = await AsyncStorage.getItem('users');
      const users = registeredUsers ? JSON.parse(registeredUsers) : [];

      // Find user by email
      const user = users.find((user) => user.email === values.email);

      if (user && user.password === values.password) {
        // Login successful
        if (rememberMe) {
          await AsyncStorage.setItem('rememberedEmail', values.email);
        } else {
          await AsyncStorage.removeItem('rememberedEmail');
        }
        onLoginSuccess(values.email);
      } else {
        // Invalid login credentials
        Alert.alert('Login Error', 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error', error);
      Alert.alert('Login Error', 'Unable to process login');
    }
  };

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={LoginSchema}
      onSubmit={handleLogin}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <View>
          <View style={styles.inputContainer}>
            <Icon name="email" size={24} color="#4A90E2" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {touched.email && errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}

          <View style={styles.inputContainer}>
            <Icon name="lock" size={24} color="#4A90E2" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              secureTextEntry={!showPassword} // Toggle secureTextEntry
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)} // Toggle password visibility
            >
              <Icon
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={24}
                color="#4A90E2"
              />
            </TouchableOpacity>
          </View>
          {touched.password && errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          <View style={styles.rememberContainer}>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
            />
            <Text style={styles.rememberText}>Remember Me</Text>
          </View>

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleSubmit}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      )}
    </Formik>
  );
};

// SignUp Form Component
const SignUpForm = ({ onSignUpSuccess }) => {
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const handleSignUp = async (values) => {
    try {
      // Retrieve existing users from AsyncStorage
      const registeredUsers = await AsyncStorage.getItem('users');
      const users = registeredUsers ? JSON.parse(registeredUsers) : [];

      // Check if the email is already registered
      if (users.some((user) => user.email === values.email)) {
        Alert.alert('Signup Error', 'Email is already registered');
        return;
      }

      // Add new user to the users array
      users.push({ email: values.email, password: values.password });

      // Save the updated users list to AsyncStorage
      await AsyncStorage.setItem('users', JSON.stringify(users));

      Alert.alert('Signup Success', 'You have successfully signed up!');
      onSignUpSuccess(); // Switch to login screen after successful signup
    } catch (error) {
      console.error('Signup error', error);
      Alert.alert('Signup Error', 'Unable to process signup');
    }
  };

  return (
    <Formik
      initialValues={{ email: '', password: '', retypePassword: '' }}
      validationSchema={SignUpSchema}
      onSubmit={handleSignUp}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <View>
          <View style={styles.inputContainer}>
            <Icon name="email" size={24} color="#4A90E2" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {touched.email && errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}

          <View style={styles.inputContainer}>
            <Icon name="lock" size={24} color="#4A90E2" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              secureTextEntry={!showPassword} // Toggle secureTextEntry
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)} // Toggle password visibility
            >
              <Icon
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={24}
                color="#4A90E2"
              />
            </TouchableOpacity>
          </View>
          {touched.password && errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          <View style={styles.inputContainer}>
            <Icon name="lock" size={24} color="#4A90E2" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Retype Password"
              onChangeText={handleChange('retypePassword')}
              onBlur={handleBlur('retypePassword')}
              value={values.retypePassword}
              secureTextEntry={!showPassword} // Toggle secureTextEntry
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)} // Toggle password visibility
            >
              <Icon
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={24}
                color="#4A90E2"
              />
            </TouchableOpacity>
          </View>
          {touched.retypePassword && errors.retypePassword && (
            <Text style={styles.errorText}>{errors.retypePassword}</Text>
          )}

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleSubmit}
          >
            <Text style={styles.loginButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      )}
    </Formik>
  );
};

// Main App Component
const App = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleLoginSuccess = (email) => {
    setUserEmail(email);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
  };

  const handleSignUpSuccess = () => {
    setIsLogin(true); // After signup, switch back to login screen
  };

  if (isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.welcomeText}>Welcome, {userEmail}</Text>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Text style={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</Text>
      
      <View style={styles.glassmorphismContainer}>
        {isLogin ? (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        ) : (
          <SignUpForm onSignUpSuccess={handleSignUpSuccess} />
        )}
      </View>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.switchText}>
          {isLogin 
            ? "Don't have an account? Sign Up" 
            : "Already have an account? Login"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#4A90E2',
  },
  glassmorphismContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)', // Frosted glass effect
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#B0C4DE',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  loginButtonText: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 18,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  rememberText: {
    fontSize: 14,
    marginLeft: 5,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
  },
  switchText: {
    color: '#4A90E2',
    textAlign: 'center',
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    color: '#4A90E2',
  },
  logoutButton: {
    backgroundColor: '#ff6f61',
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutButtonText: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 18,
  },
});

export default App;
