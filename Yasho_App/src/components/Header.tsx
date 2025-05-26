import React, { useState } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"; // Adjust the path if needed

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightContent?: boolean;
  setIsAuthenticated?: (value: boolean) => void;
  setUser?: (value: any) => void;
  profile?: object;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  rightContent = false,
  setIsAuthenticated,
  setUser,
  profile,
}) => {
  const navigate = useNavigate();
  const [showImageDialog, setShowImageDialog] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("yasho");
    toast.success("Logged out successfully");
    setIsAuthenticated?.(false);
    setUser?.(null);
    navigate("/login", { replace: true });
  };

  const imageUrl =
    profile && typeof profile === "object" ? Object.values(profile)[0] : null;

  return (
    <>
      <div className="sticky top-0 z-30 bg-white h-16 border-b border-gray-200 shadow-sm flex items-center justify-between px-4">
        <div className="flex items-center">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => navigate("/")}
            >
              <FaArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Profile"
              className="h-9 w-9 rounded-full cursor-pointer object-cover border border-gray-300"
              onClick={() => setShowImageDialog(true)}
            />
          ) : (
            <FaUserCircle className="h-9 w-9 cursor-pointer text-gray-500" />
          )}
          <h1 className="text-xl font-medium text-healthcare-primary ml-2">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {rightContent && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <FaSignOutAlt className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-md sm:max-w-lg flex flex-col items-center">
          <DialogHeader>
            <DialogTitle>Profile Picture</DialogTitle>
          </DialogHeader>
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Full Profile"
              className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
