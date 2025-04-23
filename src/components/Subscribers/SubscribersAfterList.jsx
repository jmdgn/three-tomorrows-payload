import React, { useState } from 'react';
import { useConfig } from 'payload/components/utilities';
import { Button } from 'payload/components/elements';

const SubscribersAfterList = () => {
  const { routes: { api } } = useConfig();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    
    try {
      console.log('Starting CSV export...');
      
      // Fetch all subscribers (up to 1000)
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
      
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `subscribers-${date}.csv`);
      
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

  return (
    <div style={{ margin: '20px 0', padding: '0 24px' }}>
      <Button 
        onClick={handleExport}
        disabled={exporting}
      >
        {exporting ? 'Exporting...' : 'Export Subscribers to CSV'}
      </Button>
    </div>
  );
};

export default SubscribersAfterList;