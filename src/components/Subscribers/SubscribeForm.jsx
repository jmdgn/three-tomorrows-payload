import React, { useState } from 'react';
import { getClientSideURL } from '@/utilities/getURL';

const SubscribeForm = () => {
  const [email, setEmail] = useState('');
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (submitStatus.message) {
      setSubmitStatus({ type: '', message: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setSubmitStatus({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Submitting email:', email);
      
      const baseUrl = getClientSideURL();
      const apiUrl = `${baseUrl}/api/subscribe`;
      
      console.log('Using API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      console.log('Response status:', response.status);
      
      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (err) {
        console.error('Error parsing response:', err);
        throw new Error('Invalid server response');
      }
      
      if (!response.ok) {
        throw new Error(data?.error || 'Subscription failed');
      }
      
      setSubmitStatus({ 
        type: 'success', 
        message: data?.message || 'Thank you for subscribing!' 
      });
      setEmail('');
    } catch (error) {
      console.error('Error subscribing:', error);
      setSubmitStatus({ 
        type: 'error', 
        message: 'Could not subscribe at this time. Please try again later.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="email-signup-form">
      <div className="form-group">
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="Your email address"
          aria-label="Email address"
          className="email-input"
          disabled={loading}
          required
        />
        <button 
          type="submit" 
          className="signup-button"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Subscribe'}
        </button>
      </div>
      {submitStatus.message && (
        <p className={`status-message ${submitStatus.type}`}>
          {submitStatus.message}
        </p>
      )}
    </form>
  );
};

export default SubscribeForm;