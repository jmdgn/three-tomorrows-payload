import React, { useState } from 'react';
import { useConfig } from 'payload/components/utilities';
import { Button } from 'payload/components/elements';

const AdvancedExportCSV = () => {
  const { routes: { api } } = useConfig();
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  
  // Helper function to fetch paginated subscribers
  const fetchSubscriberPage = async (page = 1, limit = 100) => {
    const response = await fetch(`${api}/subscribers?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch subscribers page ${page}: ${response.status}`);
    }
    
    return response.json();
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setProgress(0);
    
    try {
      // First get total count to calculate pages
      const initialResponse = await fetchSubscriberPage(1, 1);
      const totalDocs = initialResponse.totalDocs;
      
      if (totalDocs === 0) {
        setError('No subscribers to export');
        setExporting(false);
        return;
      }
      
      // Set up CSV headers
      const headers = ['Email', 'Subscription Date', 'Status', 'Source', 'Notes'];
      let csvRows = [headers.join(',')];
      
      // Calculate number of pages to fetch (100 subscribers per page)
      const pageSize = 100;
      const totalPages = Math.ceil(totalDocs / pageSize);
      
      // Fetch all pages
      for (let page = 1; page <= totalPages; page++) {
        const result = await fetchSubscriberPage(page, pageSize);
        
        // Add this page's subscribers to CSV rows
        result.docs.forEach(subscriber => {
          csvRows.push([
            `"${subscriber.email || ''}"`,
            subscriber.subscriptionDate ? new Date(subscriber.subscriptionDate).toISOString().split('T')[0] : '',
            subscriber.status || '',
            `"${subscriber.source || ''}"`,
            `"${(subscriber.notes || '').replace(/"/g, '""')}"` // Handle quotes in text
          ].join(','));
        });
        
        // Update progress
        setProgress(Math.round((page / totalPages) * 100));
      }
      
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
      
      console.log(`Exported ${totalDocs} subscribers to CSV`);
    } catch (err) {
      console.error('Error exporting to CSV:', err);
      setError(err.message || 'Failed to export subscribers');
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  return (
    <div className="export-csv-container">
      <Button 
        onClick={handleExport} 
        disabled={exporting}
      >
        {exporting ? `Exporting... ${progress}%` : 'Export All Subscribers to CSV'}
      </Button>
      
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default AdvancedExportCSV;