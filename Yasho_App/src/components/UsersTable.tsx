import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { toast } from "react-toastify";
import { FaSearch, FaShieldAlt, FaUser, FaUserCheck } from "react-icons/fa";
import auth from "../api/user/auth";


export const UsersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // This would normally come from your API
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const fetchUsers = await auth.getAllUsers();
      if (fetchUsers.status_code !== 0) {
        toast.error(fetchUsers.error);
        return;
      }
      setUsers(fetchUsers.data);
    };

    fetchData();
  }, []);  
  
  const handleRoleChange = async (
    userId: string,
    newRole: "client" | "pract" | "admin"
  ) => {
    try {
      setLoading(true);
      // This is where you would make a call to your backend API
      // Example: await api.updateUserRole(userId, newRole)

      // For now, we'll update the local state to simulate the change
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      toast("User role has been updated successfully.");
    } catch (error) {
      toast("Could not update user role");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (
    userId: string,
    newStatus: "active" | "inactive"
  ) => {
    try {
      setLoading(true);
      // This is where you would make a call to your backend API
      // Example: await api.updateUserStatus(userId, newStatus)

      // For now, we'll update the local state to simulate the change
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );

      toast( `User is now ${newStatus}.`);
    } catch (error) {
      toast("Could not update user status");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <FaShieldAlt className="h-4 w-4 text-red-500" />;
      case "pract":
        return <FaUserCheck className="h-4 w-4 text-blue-500" />;
      default:
        return <FaUser className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <FaSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.entity_type)}
                      <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.mobile}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={user.entity_type}
                      onValueChange={(value) =>
                        handleRoleChange(
                          user.user_id,
                          value as "client" | "pract" | "admin"
                        )
                      }
                      disabled={loading || user.entity_type === "admin"}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="pract">Pract</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.is_active === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.is_active === true ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleStatusToggle(
                          user.user_id,
                          user.is_active === true ? "inactive" : "active"
                        )
                      }
                      disabled={loading}
                    >
                      {user.is_active === true ? "Deactivate" : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
