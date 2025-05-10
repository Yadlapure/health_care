import React, { useState } from 'react';
import { X, Menu, Heart, Phone, Calendar, Hospital, BriefcaseMedical, Monitor, Users, User, Bed, CreditCard, FileText, Settings, Info, Wrench } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

const Index = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [activeSection, setActiveSection] = useState('home');
  const { toast } = useToast();
  const isMobile = useIsMobile();

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

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: <Hospital className="h-5 w-5" /> },
    { id: 'about', label: 'About Us', icon: <Info className="h-5 w-5" /> },
    { id: 'services', label: 'Services', icon: <Settings className="h-5 w-5" /> },
    { id: 'equipment', label: 'Equipment', icon: <Wrench className="h-5 w-5" /> },
    { id: 'sop', label: 'SOP', icon: <FileText className="h-5 w-5" /> },
    { id: 'payment', label: 'Payment', icon: <CreditCard className="h-5 w-5" /> },
    { id: 'contact', label: 'Contact Us', icon: <Phone className="h-5 w-5" /> },
  ];

  const renderNavigation = () => {
    if (isMobile) {
      return (
        <Sheet>
          <SheetTrigger className="p-2">
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px] p-0">
            <div className="flex flex-col h-full bg-white">
              <div className="flex items-center p-4 border-b">
                <Hospital className="text-primary h-6 w-6 mr-2" />
                <span className="text-lg font-semibold text-primary">Healthcare Haven</span>
              </div>
              <nav className="flex-1 overflow-auto">
                <ul className="py-2">
                  {navItems.map(item => (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          scrollToSection(item.id);
                        }}
                        className={`w-full text-left flex items-center px-4 py-3 hover:bg-gray-100 ${
                          activeSection === item.id ? 'bg-primary/10 text-primary font-medium' : ''
                        }`}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <nav className="hidden md:flex items-center space-x-6">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={`text-sm font-medium hover:text-primary transition-colors ${
              activeSection === item.id ? 'text-primary' : 'text-gray-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            {isMobile && renderNavigation()}
            <Hospital className="text-primary h-8 w-8 mr-2" />
            <span className="text-xl font-bold text-primary">HealthCare Haven</span>
          </div>
          {!isMobile && renderNavigation()}
          <button
            onClick={() => setShowLoginModal(true)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 mb-6">
                Professional Healthcare <br />
                <span className="text-primary">At Your Doorstep</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                We bring quality healthcare services directly to your home, ensuring comfort and convenience for you and your loved ones. Our team of certified medical professionals is available 24/7.
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
                src="https://images.unsplash.com/photo-1584432810601-6c7f27d2362b"
                alt="Doctor with stethoscope providing home healthcare"
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">About Us</h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Healthcare Haven was founded with a mission to make quality healthcare accessible to everyone in the comfort of their homes.
          </p>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1651008376811-b90baee60c1f"
                alt="Healthcare Haven team of medical professionals"
                className="rounded-lg shadow-md w-full h-auto"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-600 mb-6">
                At Healthcare Haven, we believe that quality healthcare should be accessible to everyone, regardless of mobility constraints, busy schedules, or geographical barriers. Our mission is to bridge the gap between traditional healthcare facilities and patients by bringing professional medical services directly to your doorstep.
              </p>
              <h3 className="text-2xl font-bold mb-4">Our Team</h3>
              <p className="text-gray-600 mb-6">
                Our team consists of certified healthcare professionals including doctors, nurses, therapists, and caregivers who are not only experts in their respective fields but also compassionate individuals dedicated to providing personalized care.
              </p>
              <div className="bg-blue-50 border-l-4 border-primary p-4">
                <p className="text-sm font-medium">
                  All our healthcare providers undergo rigorous background checks, are fully vaccinated, and follow strict hygiene protocols to ensure your safety and well-being.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Home Health Services</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Regular Health Checkups Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1631815588090-d1bcbe9b4b59"
                alt="Doctor checking patient's vitals at home"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Regular Health Checkups</h3>
                <p className="text-gray-600 mb-4">
                  Our qualified healthcare professionals will visit your home to conduct comprehensive health assessments, monitor vital signs, and provide personalized health reports.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <BriefcaseMedical className="text-primary h-5 w-5 mr-2" />
                    <span>Vital signs monitoring</span>
                  </li>
                  <li className="flex items-center">
                    <Monitor className="text-primary h-5 w-5 mr-2" />
                    <span>Blood tests and analysis</span>
                  </li>
                  <li className="flex items-center">
                    <Calendar className="text-primary h-5 w-5 mr-2" />
                    <span>Personalized health plans</span>
                  </li>
                </ul>
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-medium py-2 rounded-md transition-colors"
                >
                  Schedule Checkup
                </button>
              </div>
            </div>

            {/* Elderly Care Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1576765608866-5b51046452be"
                alt="Caregiver assisting elderly patient"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Caregivers for Elderly</h3>
                <p className="text-gray-600 mb-4">
                  Our compassionate caregivers provide personalized assistance to elderly individuals, ensuring they receive the attention, care, and companionship they deserve in the comfort of their homes.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <User className="text-primary h-5 w-5 mr-2" />
                    <span>Personal hygiene assistance</span>
                  </li>
                  <li className="flex items-center">
                    <BriefcaseMedical className="text-primary h-5 w-5 mr-2" />
                    <span>Medication management</span>
                  </li>
                  <li className="flex items-center">
                    <Heart className="text-primary h-5 w-5 mr-2" />
                    <span>Companionship and emotional support</span>
                  </li>
                </ul>
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-medium py-2 rounded-md transition-colors"
                >
                  Hire Caregiver
                </button>
              </div>
            </div>
            
            {/* Post-Surgery Care Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118"
                alt="Nurse providing post-surgery care at home"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Post-Surgery Care</h3>
                <p className="text-gray-600 mb-4">
                  Recovering from surgery is easier with our specialized post-operative care. We ensure proper wound care, pain management, and rehabilitation exercises in the comfort of your home.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <Bed className="text-primary h-5 w-5 mr-2" />
                    <span>Wound dressing and care</span>
                  </li>
                  <li className="flex items-center">
                    <Users className="text-primary h-5 w-5 mr-2" />
                    <span>Physical therapy assistance</span>
                  </li>
                  <li className="flex items-center">
                    <Monitor className="text-primary h-5 w-5 mr-2" />
                    <span>Recovery progress monitoring</span>
                  </li>
                </ul>
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-medium py-2 rounded-md transition-colors"
                >
                  Request Care
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Equipment Section */}
      <section id="equipment" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Medical Equipment</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <div className="h-48 flex items-center justify-center mb-6 bg-gray-50 rounded-md">
                <img 
                  src="https://images.unsplash.com/photo-1584982751601-97dcc096659c"
                  alt="Portable ECG Monitor" 
                  className="h-40 object-contain" 
                />
              </div>
              <h3 className="text-xl font-bold mb-2">Portable ECG Monitor</h3>
              <p className="text-gray-600">Advanced portable ECG monitoring for convenient cardiac assessment at home. Our healthcare professionals bring hospital-grade equipment to your doorstep.</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <div className="h-48 flex items-center justify-center mb-6 bg-gray-50 rounded-md">
                <img 
                  src="https://images.unsplash.com/photo-1603398938378-e54eab446dde"
                  alt="Advanced Blood Pressure Monitor" 
                  className="h-40 object-contain" 
                />
              </div>
              <h3 className="text-xl font-bold mb-2">Blood Pressure Monitor</h3>
              <p className="text-gray-600">Clinical-grade blood pressure monitoring equipment for accurate readings and tracking. Helps maintain optimal health with professional guidance.</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <div className="h-48 flex items-center justify-center mb-6 bg-gray-50 rounded-md">
                <img 
                  src="https://images.unsplash.com/photo-1589210138848-aec229844c51"
                  alt="Oxygen Therapy Equipment" 
                  className="h-40 object-contain" 
                />
              </div>
              <h3 className="text-xl font-bold mb-2">Oxygen Therapy Equipment</h3>
              <p className="text-gray-600">Comprehensive oxygen therapy solutions for patients needing respiratory support at home, including portable oxygen concentrators and related accessories.</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <button 
              onClick={() => setShowLoginModal(true)}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Request Equipment Information
            </button>
          </div>
        </div>
      </section>
      
      {/* Standard Operating Procedures */}
      <section id="sop" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Our Standard Operating Procedures</h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
            We maintain strict protocols to ensure the highest quality of care and safety for our patients
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FileText className="text-primary h-6 w-6 mr-2" />
                HIPAA Compliance
              </h3>
              <p className="text-gray-600 mb-4">
                All our services strictly adhere to HIPAA regulations, ensuring complete confidentiality and protection of your health information. Our digital systems are encrypted and our staff is thoroughly trained in privacy practices.
              </p>
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm">
                  Our Security Operations Center (SOC) continuously monitors all systems to detect and prevent any potential data breaches.
                </p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FileText className="text-primary h-6 w-6 mr-2" />
                Infection Control
              </h3>
              <p className="text-gray-600 mb-4">
                Our healthcare professionals follow rigorous infection control protocols, including proper hand hygiene, use of personal protective equipment (PPE), and sterilization of medical instruments to prevent cross-contamination.
              </p>
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm">
                  All healthcare providers undergo regular training on the latest infection control guidelines and are tested regularly to ensure compliance.
                </p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FileText className="text-primary h-6 w-6 mr-2" />
                Emergency Response
              </h3>
              <p className="text-gray-600 mb-4">
                We have established clear protocols for handling emergencies during home visits. Our healthcare providers are trained in emergency procedures and carry essential emergency response equipment at all times.
              </p>
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm">
                  We maintain direct communication channels with local emergency services to ensure rapid response if needed.
                </p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FileText className="text-primary h-6 w-6 mr-2" />
                Quality Assurance
              </h3>
              <p className="text-gray-600 mb-4">
                Our services undergo regular quality checks and evaluations. We collect patient feedback after each visit and conduct periodic reviews of our healthcare providers to maintain our high standards of care.
              </p>
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm">
                  We are accredited by leading healthcare organizations and regularly update our protocols based on the latest research and best practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Section */}
      <section id="payment" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Payment Options</h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
            We offer flexible payment solutions to make healthcare accessible and affordable for everyone
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary">
              <h3 className="text-xl font-bold mb-4">Insurance Coverage</h3>
              <p className="text-gray-600 mb-6">
                We accept a wide range of insurance plans. Our team will verify your coverage before services begin and handle all the paperwork to make the process seamless for you.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <CreditCard className="text-primary h-5 w-5 mr-2" />
                  <span>Major insurance providers accepted</span>
                </li>
                <li className="flex items-center">
                  <FileText className="text-primary h-5 w-5 mr-2" />
                  <span>Transparent claims process</span>
                </li>
                <li className="flex items-center">
                  <Phone className="text-primary h-5 w-5 mr-2" />
                  <span>Dedicated insurance coordinator</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary">
              <h3 className="text-xl font-bold mb-4">Direct Payment</h3>
              <p className="text-gray-600 mb-6">
                We offer competitive rates for our services with transparent pricing. Pay directly for the services you need without hidden fees or long-term commitments.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <CreditCard className="text-primary h-5 w-5 mr-2" />
                  <span>Credit/debit cards accepted</span>
                </li>
                <li className="flex items-center">
                  <CreditCard className="text-primary h-5 w-5 mr-2" />
                  <span>Secure online payment portal</span>
                </li>
                <li className="flex items-center">
                  <FileText className="text-primary h-5 w-5 mr-2" />
                  <span>Detailed electronic receipts</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary">
              <h3 className="text-xl font-bold mb-4">Membership Plans</h3>
              <p className="text-gray-600 mb-6">
                Our membership plans offer regular healthcare services at discounted rates. Choose a plan that fits your needs and budget for ongoing care.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <CreditCard className="text-primary h-5 w-5 mr-2" />
                  <span>Monthly or annual subscriptions</span>
                </li>
                <li className="flex items-center">
                  <Heart className="text-primary h-5 w-5 mr-2" />
                  <span>Priority scheduling</span>
                </li>
                <li className="flex items-center">
                  <FileText className="text-primary h-5 w-5 mr-2" />
                  <span>Complimentary health assessments</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 bg-blue-50 p-6 rounded-lg max-w-3xl mx-auto">
            <h4 className="font-bold text-lg mb-4">Need help with payment options?</h4>
            <p className="text-gray-600 mb-4">
              Our financial counselors are available to discuss your specific situation and help you find the most affordable payment solution. We believe everyone deserves access to quality healthcare.
            </p>
            <button 
              onClick={() => setShowLoginModal(true)}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Speak to a Financial Counselor
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Patients Say</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Sarah Johnson</h4>
                  <p className="text-gray-500 text-sm">Regular Health Checkup</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The convenience of having healthcare professionals come to my home for regular checkups has been invaluable. They're always thorough and take the time to answer all my questions."
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Robert Williams</h4>
                  <p className="text-gray-500 text-sm">Elderly Care</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The caregivers for my father have been exceptional. Their compassion and professionalism have given our family peace of mind knowing he's well cared for at home."
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Emily Chen</h4>
                  <p className="text-gray-500 text-sm">Post-Surgery Care</p>
                </div>
              </div>
              <p className="text-gray-600">
                "After my knee surgery, having professional care at home made recovery so much easier. The nurses were skilled and encouraging throughout my rehabilitation."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Need Immediate Assistance?</h2>
              <p className="text-lg text-gray-600 mb-8">
                Our healthcare professionals are available 24/7 to assist you with any concerns or emergencies. Don't hesitate to reach out for quality home healthcare services.
              </p>
              <div className="flex items-center mb-4">
                <Phone className="text-primary h-6 w-6 mr-3" />
                <span className="text-xl font-semibold">+1 (800) 123-4567</span>
              </div>
              <div className="bg-blue-50 border-l-4 border-primary p-4 mt-6">
                <p className="text-sm">
                  <strong>Our commitment to you:</strong> All our healthcare providers are fully vaccinated, follow strict hygiene protocols, and are regularly tested to ensure your safety.
                </p>
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
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Service Needed</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select a service</option>
                  <option value="checkup">Regular Health Checkup</option>
                  <option value="elderly">Elderly Care</option>
                  <option value="surgery">Post-Surgery Care</option>
                  <option value="other">Other Services</option>
                </select>
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
                <Hospital className="text-white h-8 w-8 mr-2" />
                <span className="text-xl font-bold">HealthCare Haven</span>
              </div>
              <p className="text-gray-400">
                Providing quality healthcare services at the comfort of your home, with certified medical professionals available 24/7.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('home')} className="text-gray-400 hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => scrollToSection('about')} className="text-gray-400 hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => scrollToSection('services')} className="text-gray-400 hover:text-white transition-colors">Services</button></li>
                <li><button onClick={() => scrollToSection('equipment')} className="text-gray-400 hover:text-white transition-colors">Equipment</button></li>
                <li><button onClick={() => scrollToSection('sop')} className="text-gray-400 hover:text-white transition-colors">SOP</button></li>
                <li><button onClick={() => scrollToSection('payment')} className="text-gray-400 hover:text-white transition-colors">Payment</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="text-gray-400 hover:text-white transition-colors">Contact Us</button></li>
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
            <p className="text-gray-400 text-sm">© 2025 HealthCare Haven. All rights reserved.</p>
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
