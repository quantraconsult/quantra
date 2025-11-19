// ... imports remain the same

interface HubProps {
  companyName: string;
  isAdmin: boolean;
  onAdminClick: () => void; // New prop
}

// ... AppCard component remains the same

const Hub: React.FC<HubProps> = ({ companyName, isAdmin, onAdminClick }) => {
  return (
    // ... layout remains the same until the Admin Card ...

        {/* Admin Console */}
        {isAdmin && (
          <div onClick={onAdminClick} className="cursor-pointer">
             <AppCard 
               title="Admin Console"
               desc="Manage users, permissions, and global workspace settings."
               href="#" // Prevent default link
               icon={<ShieldCheckIcon className="w-8 h-8" />}
             />
          </div>
        )}

    // ... rest of file
  );
};
export default Hub;