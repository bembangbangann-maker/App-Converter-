import React from 'react';
import { AppConfig } from '../types';
import { Camera, Mic, MapPin, Bell, Maximize } from 'lucide-react';

interface PermissionSelectorProps {
  permissions: AppConfig['permissions'];
  onChange: (key: keyof AppConfig['permissions']) => void;
}

const PermissionItem = ({ 
    icon: Icon, 
    label, 
    active, 
    onClick 
}: { 
    icon: any, 
    label: string, 
    active: boolean, 
    onClick: () => void 
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center space-x-3 p-3 rounded-xl border transition-all duration-200 ${
      active 
        ? 'bg-primary/20 border-primary text-white' 
        : 'bg-card border-gray-700 text-gray-400 hover:border-gray-500'
    }`}
  >
    <Icon size={18} className={active ? 'text-primary' : 'text-gray-500'} />
    <span className="text-sm font-medium">{label}</span>
    <div className={`ml-auto w-4 h-4 rounded-full border ${active ? 'bg-primary border-primary' : 'border-gray-500'}`}>
        {active && <div className="w-full h-full flex items-center justify-center text-[10px] text-white">✓</div>}
    </div>
  </button>
);

export const PermissionSelector: React.FC<PermissionSelectorProps> = ({ permissions, onChange }) => {
  return (
    <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">Required Permissions</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PermissionItem 
                icon={Camera} 
                label="Camera Access" 
                active={permissions.camera} 
                onClick={() => onChange('camera')} 
            />
             <PermissionItem 
                icon={Mic} 
                label="Microphone" 
                active={permissions.microphone} 
                onClick={() => onChange('microphone')} 
            />
             <PermissionItem 
                icon={MapPin} 
                label="Geolocation" 
                active={permissions.geolocation} 
                onClick={() => onChange('geolocation')} 
            />
             <PermissionItem 
                icon={Bell} 
                label="Notifications" 
                active={permissions.notifications} 
                onClick={() => onChange('notifications')} 
            />
             <PermissionItem 
                icon={Maximize} 
                label="Start Fullscreen" 
                active={permissions.fullscreen} 
                onClick={() => onChange('fullscreen')} 
            />
        </div>
    </div>
  );
};
