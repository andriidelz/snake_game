import { useEffect } from 'react';

const AdBanner = ({ type = 'horizontal' }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }, []);

  const bannerStyles = {
    horizontal: 'h-24 w-full',
    vertical: 'w-64 h-96',
    square: 'w-64 h-64'
  };

  return (
    <ins
      className={`adsbygoogle ${bannerStyles[type]} flex items-center justify-center rounded-lg shadow-lg`}      
      style={{ display: 'block' }}
      data-ad-client="ca-pub-5811327077406599" // ← замінив на свій реальний!
      data-ad-slot="9086971079"               // ← замінив тоже на свій слот!
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
};

export default AdBanner;