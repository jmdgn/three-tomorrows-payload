import React, { useState, useEffect } from 'react';
import { useConfig } from 'payload/components/utilities';
import { Button } from 'payload/components/elements';
import { Eyebrow } from 'payload/components/elements';
import { Card } from 'payload/components/elements';

const SubscribersDashboard = () => {
  const { routes: { api } } = useConfig();
  const [subscriberStats, setSubscriberStats] = useState({
    total: 0,
    active: 0,
    unsubscribed: 0,
    recentSubscribers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        const totalResponse = await fetch(`${api}/subscribers?limit=0`);
        const totalData = await totalResponse.json();
        
        const activeResponse = await fetch(`${api}/subscribers?where[status][equals]=active&limit=0`);
        const activeData = await activeResponse.json();
        
        const unsubscribedResponse = await fetch(`${api}/subscribers?where[status][equals]=unsubscribed&limit=0`);
        const unsubscribedData = await unsubscribedResponse.json();
        
        const recentResponse = await fetch(`${api}/subscribers?sort=-subscriptionDate&limit=5`);
        const recentData = await recentResponse.json();
        
        setSubscriberStats({
          total: totalData.totalDocs,
          active: activeData.totalDocs,
          unsubscribed: unsubscribedData.totalDocs,
          recentSubscribers: recentData.docs
        });
      } catch (err) {
        console.error('Error fetching subscriber stats:', err);
        setError('Failed to load subscriber statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [api]);

  // Simple export function built directly into the component
  const handleExport = async () => {
    setExporting(true);
    
    try {
      console.log('Starting export...');
      
      // Fetch subscribers
      const response = await fetch(`${api}/subscribers?limit=1000`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch subscribers: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.docs || result.docs.length === 0) {
        alert('No subscribers to export');
        return;
      }
      
      console.log(`Found ${result.docs.length} subscribers to export`);
      
      // Convert to CSV
      const headers = ['Email', 'Subscription Date', 'Status', 'Source', 'Notes'];
      
      const csvRows = [
        headers.join(','),
        ...result.docs.map(subscriber => [
          `"${subscriber.email || ''}"`,
          subscriber.subscriptionDate ? new Date(subscriber.subscriptionDate).toISOString().split('T')[0] : '',
          subscriber.status || '',
          `"${subscriber.source || ''}"`,
          `"${subscriber.notes || ''}"`
        ].join(','))
      ];
      
      const csvContent = csvRows.join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `subscribers-${new Date().toISOString().split('T')[0]}.csv`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Export completed successfully');
    } catch (err) {
      console.error('Export error:', err);
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div>Loading subscriber statistics...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Eyebrow>Subscribers Overview</Eyebrow>
        
        {/* Simple export button directly in the component */}
        <Button 
          onClick={handleExport}
          disabled={exporting}
          style={{ backgroundColor: '#0070f3', color: 'white' }}
        >
          {exporting ? 'Exporting...' : 'Export Subscribers CSV'}
        </Button>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <Card title="Total Subscribers">
          <h2>{subscriberStats.total}</h2>
        </Card>
        
        <Card title="Active Subscribers">
          <h2>{subscriberStats.active}</h2>
        </Card>
        
        <Card title="Unsubscribed">
          <h2>{subscriberStats.unsubscribed}</h2>
        </Card>
      </div>
      
      <Card title="Recent Subscribers">
        {subscriberStats.recentSubscribers.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                {subscriberStats.recentSubscribers[0].source && (
                  <th style={{ textAlign: 'left', padding: '8px' }}>Source</th>
                )}
              </tr>
            </thead>
            <tbody>
              {subscriberStats.recentSubscribers.map((subscriber) => (
                <tr key={subscriber.id}>
                  <td style={{ padding: '8px' }}>{subscriber.email}</td>
                  <td style={{ padding: '8px' }}>
                    {new Date(subscriber.subscriptionDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '8px' }}>
                    <span style={{ 
                      color: subscriber.status === 'active' ? 'green' : 'red',
                      fontWeight: 'bold'
                    }}>
                      {subscriber.status}
                    </span>
                  </td>
                  {subscriberStats.recentSubscribers[0].source && (
                    <td style={{ padding: '8px' }}>{subscriber.source}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No subscribers yet.</p>
        )}
      </Card>
      
      {/* Add View All Subscribers button if there are more than shown */}
      {subscriberStats.total > subscriberStats.recentSubscribers.length && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Button 
            onClick={() => window.location.href = `/admin/collections/subscribers`}
          >
            View All Subscribers
          </Button>
        </div>
      )}
    </div>
  );
};

export default SubscribersDashboard;