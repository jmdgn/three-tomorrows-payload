import React, { useState } from 'react';
import { useConfig } from 'payload/components/utilities';
import { Button } from 'payload/components/elements';

const ExportCSV = () => {
  const { routes: { api } } = useConfig();
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    
    try {
      // Fetching all subscribers
      // Note: This is a simple implementation that works for a few hundred subscribers
      // For production with thousands of subscribers, you would want to implement pagination
      const response = await fetch(`${api}/subscribers?limit=1000`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch subscribers: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.docs || result.docs.length === 0) {
        setError('No subscribers to export');
        return;
      }
      
      // Convert subscribers data to CSV format
      const headers = ['Email', 'Subscription Date', 'Status', 'Source', 'Notes'];
      
      const csvRows = [
        // Headers row
        headers.join(','),
        
        // Data rows
        ...result.docs.map(subscriber => [
          // Escape emails that might contain commas
          `"${subscriber.email || ''}"`,
          // Format date
          subscriber.subscriptionDate ? new Date(subscriber.subscriptionDate).toISOString().split('T')[0] : '',
          subscriber.status || '',
          // Escape text fields that might contain commas
          `"${subscriber.source || ''}"`,
          `"${subscriber.notes || ''}"`
        ].join(','))
      ];
      
      // Join rows with newlines to create the CSV content
      const csvContent = csvRows.join('\n');
      
      // Create a Blob with the CSV content
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create a download link and trigger the download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Set the link attributes
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `subscribers-${date}.csv`);
      
      // Append the link to the document, click it, and then remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Exported ${result.docs.length} subscribers to CSV`);
    } catch (err) {
      console.error('Error exporting to CSV:', err);
      setError(err.message || 'Failed to export subscribers');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="export-csv-container">
      <Button 
        onClick={handleExport} 
        disabled={exporting}
      >
        {exporting ? 'Exporting...' : 'Export Subscribers to CSV'}
      </Button>
      
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default ExportCSV;