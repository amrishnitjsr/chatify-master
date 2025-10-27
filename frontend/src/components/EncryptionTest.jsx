// =====================================
// ENCRYPTION TEST COMPONENT
// =====================================
// This component helps verify that encryption is working correctly

import { useState, useEffect } from 'react';
import { encryptMessage, decryptMessage, testEncryption } from '../lib/encryption.js';
import { devUtils } from '../lib/config.js';

const EncryptionTest = () => {
  const [testResults, setTestResults] = useState({});
  const [customTest, setCustomTest] = useState({
    message: 'Hello! This is a test message 🔐',
    senderId: 'user123',
    receiverId: 'user456',
    encrypted: '',
    decrypted: '',
  });

  // Run automatic tests on component mount
  useEffect(() => {
    runAutomaticTests();
  }, []);

  const runAutomaticTests = async () => {
    const results = {};

    try {
      // Test 1: Basic encryption/decryption
      devUtils.log('🧪 Running encryption tests...');
      
      const basicTest = testEncryption('test1', 'test2');
      results.basicTest = {
        passed: basicTest,
        description: 'Basic encryption/decryption test'
      };

      // Test 2: Different user pairs
      const testMessage = 'Test message for different users';
      const encrypted1 = encryptMessage(testMessage, 'user1', 'user2');
      const encrypted2 = encryptMessage(testMessage, 'user3', 'user4');
      
      results.differentUsers = {
        passed: encrypted1 !== encrypted2,
        description: 'Different users should produce different encryptions',
        details: { encrypted1: encrypted1?.substring(0, 20) + '...', encrypted2: encrypted2?.substring(0, 20) + '...' }
      };

      // Test 3: Same users, different order should work
      const encrypted_AB = encryptMessage(testMessage, 'userA', 'userB');
      const decrypted_BA = decryptMessage(encrypted_AB, 'userB', 'userA');
      
      results.sameUsersReversed = {
        passed: decrypted_BA === testMessage,
        description: 'Same users in different order should decrypt correctly',
        details: { original: testMessage, decrypted: decrypted_BA }
      };

      // Test 4: Empty/null handling
      const nullTest = encryptMessage(null, 'user1', 'user2');
      const emptyTest = encryptMessage('', 'user1', 'user2');
      
      results.nullHandling = {
        passed: nullTest === null && (emptyTest === null || emptyTest === ''),
        description: 'Should handle null/empty messages gracefully',
        details: { nullResult: nullTest, emptyResult: emptyTest }
      };

      setTestResults(results);
      
    } catch (error) {
      devUtils.error('Test execution failed:', error);
      setTestResults({
        error: {
          passed: false,
          description: 'Test execution failed',
          details: error.message
        }
      });
    }
  };

  const runCustomTest = () => {
    try {
      const encrypted = encryptMessage(customTest.message, customTest.senderId, customTest.receiverId);
      const decrypted = decryptMessage(encrypted, customTest.senderId, customTest.receiverId);
      
      setCustomTest(prev => ({
        ...prev,
        encrypted: encrypted || 'Encryption failed',
        decrypted: decrypted || 'Decryption failed'
      }));
      
    } catch (error) {
      devUtils.error('Custom test failed:', error);
      setCustomTest(prev => ({
        ...prev,
        encrypted: 'Error: ' + error.message,
        decrypted: 'Error: ' + error.message
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-900 rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">🔐 Encryption Test Suite</h2>
        <p className="text-slate-400">Verify that end-to-end encryption is working correctly</p>
      </div>

      {/* Automatic Test Results */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Automatic Test Results</h3>
        <div className="space-y-3">
          {Object.entries(testResults).map(([key, result]) => (
            <div key={key} className={`p-3 rounded-lg ${result.passed ? 'bg-green-900/30 border-green-500' : 'bg-red-900/30 border-red-500'} border`}>
              <div className="flex items-center gap-2">
                <span className={`text-lg ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                  {result.passed ? '✅' : '❌'}
                </span>
                <span className="text-white font-medium">{result.description}</span>
              </div>
              {result.details && (
                <pre className="text-xs text-slate-300 mt-2 overflow-x-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
        
        <button 
          onClick={runAutomaticTests}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Re-run Tests
        </button>
      </div>

      {/* Custom Test */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Custom Encryption Test</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-white mb-2">Message to encrypt:</label>
            <textarea
              value={customTest.message}
              onChange={(e) => setCustomTest(prev => ({ ...prev, message: e.target.value }))}
              className="w-full p-2 bg-slate-800 text-white rounded border border-slate-600"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <div>
              <label className="block text-white mb-1">Sender ID:</label>
              <input
                type="text"
                value={customTest.senderId}
                onChange={(e) => setCustomTest(prev => ({ ...prev, senderId: e.target.value }))}
                className="w-full p-2 bg-slate-800 text-white rounded border border-slate-600"
              />
            </div>
            <div>
              <label className="block text-white mb-1">Receiver ID:</label>
              <input
                type="text"
                value={customTest.receiverId}
                onChange={(e) => setCustomTest(prev => ({ ...prev, receiverId: e.target.value }))}
                className="w-full p-2 bg-slate-800 text-white rounded border border-slate-600"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={runCustomTest}
          className="mb-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Test Encryption
        </button>

        {customTest.encrypted && (
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Encrypted Message:</label>
              <textarea
                value={customTest.encrypted}
                readOnly
                className="w-full p-2 bg-slate-800 text-green-400 rounded border border-slate-600 font-mono text-sm"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-white mb-2">Decrypted Message:</label>
              <textarea
                value={customTest.decrypted}
                readOnly
                className={`w-full p-2 rounded border border-slate-600 ${
                  customTest.decrypted === customTest.message 
                    ? 'bg-green-900/30 text-green-400 border-green-500' 
                    : 'bg-red-900/30 text-red-400 border-red-500'
                }`}
                rows={3}
              />
            </div>
            <div className="text-center">
              {customTest.decrypted === customTest.message ? (
                <span className="text-green-400 font-bold">✅ Encryption/Decryption Successful!</span>
              ) : (
                <span className="text-red-400 font-bold">❌ Encryption/Decryption Failed!</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EncryptionTest;