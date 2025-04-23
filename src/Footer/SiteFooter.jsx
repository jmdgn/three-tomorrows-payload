"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SubscribeForm from '../components/Subscribers/SubscribeForm';

const WorkingFooter = () => {
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch footer data from Payload
    const fetchFooter = async () => {
      try {
        const response = await fetch('/api/globals/footer');
        if (!response.ok) throw new Error('Failed to fetch footer data');
        const data = await response.json();
        setFooterData(data);
        console.log("Footer data loaded:", data);
      } catch (error) {
        console.error('Error fetching footer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooter();
  }, []);

  // Function to safely render site pages
  const renderSitePages = () => {
    if (footerData?.sitePages && footerData.sitePages.length > 0) {
      return footerData.sitePages.map((page, index) => {
        // Safely access properties
        const url = page.url || '#';
        const label = page.label || 'Page';
        const newTab = page.newTab || false;
        
        return (
          <a 
            key={index} 
            href={url}
            target={newTab ? "_blank" : "_self"}
            rel={newTab ? "noopener noreferrer" : undefined}
          >
            <h6>{label}</h6>
          </a>
        );
      });
    } else {
      // Fallback content
      return (
        <>
          <a href="#"><h6>What we do</h6></a>
          <a href="#"><h6>Services</h6></a>
          <a href="#"><h6>About Us</h6></a>
          <a href="#"><h6>Blog</h6></a>
          <a href="#"><h6>Contact Us</h6></a>
        </>
      );
    }
  };

  // Function to safely render social links
  const renderSocialLinks = () => {
    if (footerData?.socialLinks && footerData.socialLinks.length > 0) {
      return footerData.socialLinks.map((social, index) => {
        // Safely access properties
        const url = social.url || '#';
        const platform = social.platform || 'Link';
        const openInNewTab = social.openInNewTab || false;
        
        return (
          <a 
            key={index}
            href={url}
            target={openInNewTab ? "_blank" : "_self"}
            rel={openInNewTab ? "noopener noreferrer" : undefined}
          >
            <h6>{platform}</h6>
          </a>
        );
      });
    } else {
      // Fallback content
      return (
        <>
          <a target="_blank" href="https://www.linkedin.com/company/three-tomorrows/" rel="noopener noreferrer">
            <h6>LinkedIn</h6>
          </a>
          <a href="#"><h6>Bluesky</h6></a>
        </>
      );
    }
  };

  return (
    <footer>
      <section id="footer" className="footer-panel">
        <div className="footerContent-outer">
          <div className="footerContent-inner">
            <div className="footerTop-container">
              <div className="footerColumn-left">
                <div className="emailSignup-content">
                  <p className="xsmall">{footerData?.emailSignupText || 'Get our latest insights'}</p>
                  
                  {/* Use the new SubscribeForm component */}
                  <SubscribeForm />
                </div>
                <div className="AOC-content">
                  <p className="xsmall">
                    {footerData?.acknowledgementText || 'Three Tomorrows respectfully acknowledges the Traditional Owners of the land, the Wurundjeri Woi-wurrung and Bunurong / Boon Wurrung peoples of the Kulin and pays respect to their Elders past and present.'}
                  </p>
                </div>
              </div>
              <div className="footerColumn-right">
                <div className="linkColumn-container">
                  <div className="linkColumn-left">
                    <p className="xsmall">Site pages</p>
                  </div>
                  <div className="linkColumn-right">
                    {renderSitePages()}
                  </div>
                </div>
                <div className="socialColumn-container">
                  <div className="socialColumn-left">
                    <p className="xsmall">Social</p>
                  </div>
                  <div className="socialColumn-right">
                    {renderSocialLinks()}
                  </div>
                </div>
              </div>
            </div>
            <div className="footerBottom-container">
              <div className="bottomLine-left">
                <div className="footerIcon-con">
                  {footerData?.footerLogo ? (
                    <img
                      className="logoIcon"
                      src={footerData.footerLogo.url}
                      width={40}
                      height={40}
                      alt="Three Tomorrows Icon"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      className="logoIcon"
                      src="/media/universal/logo-icon.svg"
                      width={40}
                      height={40}
                      alt="Three Tomorrows Icon"
                      loading="lazy"
                    />
                  )}
                </div>
              </div>
              <div className="bottomLine-right">
                <div className="copyright-textCon">
                  <p className="xsmall">
                    © {new Date().getFullYear()} Three Tomorrows. {footerData?.copyrightText || 'All rights reserved.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
};

export default WorkingFooter;