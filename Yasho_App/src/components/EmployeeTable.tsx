import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import auth from "../api/user/auth";

export const EmployeeTable = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    sex: "",
    dob: "",
    guard_name: "",
    guard_mobile: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [documentImages, setDocumentImages] = useState([]);
  const [documentsConfirmed, setDocumentsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePhotoChange = (e) => {
    if (e.target.files.length > 0) {
      setProfilePhoto(e.target.files[0]);
    }
  };

  const handleDocumentsChange = (e) => {
    const files = Array.from(e.target.files);
    setDocumentImages((prevImages) => [...prevImages, ...files]);
    setDocumentsConfirmed(false);
  };

  const handleConfirmDocuments = () => {
    if (documentImages.length === 0) {
      toast.error("Please upload at least one document");
      return;
    }
    setDocumentsConfirmed(true);
    toast.success("Documents confirmed!");
  };

  const handleAddEmployee = async () => {
    const { name, email, mobile, dob, sex, guard_name, guard_mobile } =
      formData;

    if (
      !name ||
      !email ||
      !mobile ||
      !dob ||
      !sex ||
      !guard_name ||
      !guard_mobile ||
      !profilePhoto ||
      !documentsConfirmed
    ) {
      toast.error("Please complete all fields and confirm documents");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    data.append("photo", profilePhoto);
    documentImages.forEach((doc) => data.append("id_proof", doc));

    try {
      setIsSubmitting(true);
      const response = await auth.registerEmployee(data);
      if (response.data) {
        toast.success("Employee added successfully!");
        const newEmployee = {
          ...response.data,
          profilePhoto,
          documentImages,
        };
        setEmployees((prevEmployees) => [...prevEmployees, newEmployee]);

        setFormData({
          name: "",
          email: "",
          mobile: "",
          address: "",
          sex: "",
          dob: "",
          guard_name: "",
          guard_mobile: "",
        });
        setProfilePhoto(null);
        setDocumentImages([]);
        setDocumentsConfirmed(false);
      } else {
        toast.error("Failed to add employee");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await auth.getAllUsers();
        if (response.status_code === 0 && Array.isArray(response.data)) {
          const employeeList = response.data.filter(
            (user) => user.entity_type === "employee"
          );
          setEmployees(employeeList);
        } else {
          toast.error("Failed to load employees");
        }
      } catch (error) {
        toast.error("Error fetching employee list");
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!showAddForm) {
      setFormData({
        name: "",
        email: "",
        mobile: "",
        address: "",
        sex: "",
        dob: "",
        guard_name: "",
        guard_mobile: "",
      });
      setProfilePhoto(null);
      setDocumentImages([]);
      setDocumentsConfirmed(false);
    }
  }, [showAddForm]);

  const isFormComplete =
    formData.name &&
    formData.email &&
    formData.mobile &&
    formData.dob &&
    formData.sex &&
    formData.guard_name &&
    formData.guard_mobile &&
    profilePhoto &&
    documentsConfirmed;

  return (
    <>
      {/* Employee Table */}
      <div className="rounded-md border mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-muted-foreground"
                >
                  No employees added
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp, index) => (
                <TableRow key={index}>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell className="max-w-[130px] whitespace-pre-wrap break-words">
                    {emp.address}
                  </TableCell>
                  <TableCell>{emp.mobile}</TableCell>
                  <TableCell>
                    <span
                      className={
                        emp.is_active ? "text-green-600" : "text-red-600"
                      }
                    >
                      {emp.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setModalOpen(true);
                      }}
                    >
                      More Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 max-w-5xl mx-auto">
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="outline"
          className="mb-6"
        >
          {showAddForm ? "Hide Form" : "Add New User"}
        </Button>
      </div>

      {/* Add Employee Form */}
      {showAddForm && (
        <div className="space-y-6 p-4 max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold">Add Employee</h2>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <Input
              placeholder="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full sm:w-1/3"
            />
            <Input
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full sm:w-1/3"
            />
            <Input
              placeholder="Mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full sm:w-1/3"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-6">
            <Input
              placeholder="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full sm:w-1/3"
            />
            <Input
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              className="w-full sm:w-1/3"
            />
            <div className="w-full sm:w-1/3">
              <Select
                value={formData.sex}
                onValueChange={(value) =>
                  setFormData({ ...formData, sex: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-6">
            <Input
              placeholder="Guardian Name"
              name="guard_name"
              value={formData.guard_name}
              onChange={handleChange}
              className="w-full sm:w-1/3"
            />
            <Input
              placeholder="Guardian Mobile"
              name="guard_mobile"
              value={formData.guard_mobile}
              onChange={handleChange}
              className="w-full sm:w-1/3"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-6">
            <div className="w-full sm:w-1/2">
              <label className="block">
                Upload Profile Photo:
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                />
                {profilePhoto && (
                  <img
                    src={URL.createObjectURL(profilePhoto)}
                    alt="Profile Preview"
                    className="mt-2 h-32 w-32 object-cover rounded-full border"
                  />
                )}
              </label>
            </div>

            <div className="w-full sm:w-1/2">
              <label className="block">
                Upload Required Documents:
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleDocumentsChange}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {documentImages.map((file, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(file)}
                      alt={`Document ${idx + 1}`}
                      className="h-24 w-24 object-cover rounded border"
                    />
                  ))}
                </div>
              </label>
            </div>
          </div>

          {!documentsConfirmed && documentImages.length > 0 && (
            <div className="mt-4">
              <Button variant="outline" onClick={handleConfirmDocuments}>
                Add Documents
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            onClick={handleAddEmployee}
            className="w-full md:w-auto mt-6"
            disabled={!isFormComplete || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Add Employee"}
          </Button>
        </div>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="text-sm space-y-2">
              <div>
                <strong>Name:</strong> {selectedEmployee.name}
              </div>
              <div>
                <strong>Email:</strong> {selectedEmployee.email}
              </div>
              <div>
                <strong>Mobile:</strong> {selectedEmployee.mobile}
              </div>
              <div>
                <strong>Address:</strong> {selectedEmployee.address}
              </div>
              <div>
                <strong>Sex:</strong> {selectedEmployee.sex}
              </div>
              <div>
                <strong>DOB:</strong> {selectedEmployee.dob}
              </div>
              <div>
                <strong>Guardian:</strong> {selectedEmployee.guard_name} (
                {selectedEmployee.guard_mobile})
              </div>

              <div>
                <strong>Profile Photo:</strong>
                {selectedEmployee.profilePhoto ? (
                  <img
                    src={URL.createObjectURL(selectedEmployee.profilePhoto)}
                    alt="Profile"
                    className="mt-2 h-32 rounded border"
                  />
                ) : (
                  <p>No profile photo available</p>
                )}
              </div>

              <div>
                <strong>Documents:</strong>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(selectedEmployee.documentImages || []).map((file, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(file)}
                      alt={`Document ${idx + 1}`}
                      className="h-24 rounded border"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
