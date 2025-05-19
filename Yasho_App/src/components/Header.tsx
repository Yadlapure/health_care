import React from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSignOutAlt } from "react-icons/fa";
import { toast } from "react-toastify";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightContent?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  rightContent = false,
  setIsAuthenticated,
  setUser,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("yasho");
    toast.success("Logged out successfully")
    setIsAuthenticated(false);
    setUser(null);
    navigate("/login", { replace: true });
  };

  return (
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
        <h1 className="text-xl font-medium text-healthcare-primary">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {rightContent &&  (
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
  );
};

export default Header;
