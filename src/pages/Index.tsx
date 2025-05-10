
import React, { useState } from 'react';
import { X, Heart, Phone } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length < 10) {
      toast({
        title: "Invalid mobile number",
        description: "Please enter a valid mobile number",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Login successful",
      description: "We'll contact you shortly",
    });
    setShowLoginModal(false);
    setMobileNumber('');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Heart className="text-primary h-8 w-8 mr-2" />
            <span className="text-xl font-bold text-primary">HealthCare</span>
          </div>
          <button
            onClick={() => setShowLoginModal(true)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 mb-6">
                Professional Healthcare <br />
                <span className="text-primary">At Your Doorstep</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                We bring quality healthcare services directly to your home, ensuring comfort and convenience for you and your loved ones.
              </p>
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-medium text-lg transition-colors"
              >
                Book a Service
              </button>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
                alt="Healthcare at home"
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Home Health Services</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Regular Health Checkups Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1518770660439-4636190af475"
                alt="Regular Health Checkups"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Regular Health Checkups</h3>
                <p className="text-gray-600 mb-4">
                  Our qualified healthcare professionals will visit your home to conduct comprehensive health assessments, monitor vital signs, and provide personalized health reports.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <Heart className="text-primary h-5 w-5 mr-2" />
                    <span>Vital signs monitoring</span>
                  </li>
                  <li className="flex items-center">
                    <Heart className="text-primary h-5 w-5 mr-2" />
                    <span>Blood tests and analysis</span>
                  </li>
                  <li className="flex items-center">
                    <Heart className="text-primary h-5 w-5 mr-2" />
                    <span>Personalized health plans</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Elderly Care Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1518005020951-eccb494ad742"
                alt="Elderly Care"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Caregivers for Elderly</h3>
                <p className="text-gray-600 mb-4">
                  Our compassionate caregivers provide personalized assistance to elderly individuals, ensuring they receive the attention, care, and companionship they deserve in the comfort of their homes.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <Heart className="text-primary h-5 w-5 mr-2" />
                    <span>Personal hygiene assistance</span>
                  </li>
                  <li className="flex items-center">
                    <Heart className="text-primary h-5 w-5 mr-2" />
                    <span>Medication management</span>
                  </li>
                  <li className="flex items-center">
                    <Heart className="text-primary h-5 w-5 mr-2" />
                    <span>Companionship and emotional support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Need Immediate Assistance?</h2>
              <p className="text-lg text-gray-600 mb-8">
                Our healthcare professionals are available 24/7 to assist you with any concerns or emergencies. Don't hesitate to reach out.
              </p>
              <div className="flex items-center mb-4">
                <Phone className="text-primary h-6 w-6 mr-3" />
                <span className="text-xl font-semibold">+1 (800) 123-4567</span>
              </div>
            </div>
            <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Request a Callback</h3>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Mobile Number</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your mobile number"
                />
              </div>
              <button className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium transition-colors">
                Request Callback
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Heart className="text-white h-8 w-8 mr-2" />
                <span className="text-xl font-bold">HealthCare</span>
              </div>
              <p className="text-gray-400">
                Providing quality healthcare services at the comfort of your home.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Services</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 HealthCare. All rights reserved.</p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Protected by our Security Operations Center (SOC) | HIPAA Compliant
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6">Login</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="mobile" className="block text-gray-700 font-medium mb-2">
                  Mobile Number
                </label>
                <input
                  id="mobile"
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your mobile number"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
