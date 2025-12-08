import { AdComponent } from '@admiraltyio/admiralty-ads';

const AdBanner = ({ type = 'horizontal', position = 'top' }) => {
  const bannerStyles = {
    horizontal: 'h-24 w-full',
    vertical: 'w-full h-96',
    square: 'w-64 h-64'
  };

  const colors = {
    top: 'bg-gradient-to-r from-yellow-400 to-orange-400',
    bottom: 'bg-gradient-to-r from-blue-400 to-purple-400',
    left: 'bg-gradient-to-b from-green-400 to-emerald-400',
    right: 'bg-gradient-to-b from-pink-400 to-red-400'
  };

  return (
    <div 
      className={`
        ${bannerStyles[type]} 
        ${colors[position]}
        rounded-lg flex items-center justify-center
        text-gray-900 font-bold text-lg
        shadow-lg hover:shadow-xl transition-shadow
      `}
    >
      <AdComponent
        placementId="your-placement-id"
        format={type === 'horizontal' ? 'banner' : 'rectangle'}
      />
      <div className="text-center">
        <div className="text-3xl mb-2">🎯</div>
        <div>РЕКЛАМНЕ МІСЦЕ</div>
        <div className="text-sm opacity-75">
          {type === 'horizontal' ? 'Banner 728x90' : 'Sidebar 300x600'}
        </div>
        <div className="text-xs mt-1">Google AdSense</div>
      </div>
    </div>
  );
};

export default AdBanner;