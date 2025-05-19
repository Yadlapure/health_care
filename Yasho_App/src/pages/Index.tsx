import React, { useEffect, useState } from 'react'
import auth from '../api/user/auth';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const getMe = async () => {
    const response = await auth.getMe();
    setIsAuthenticated(true);
  };
  useEffect(() => {
    getMe();
  }, []);
  return (
    <div>Index</div>
  )
}

export default Index