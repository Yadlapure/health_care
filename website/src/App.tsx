import React, { useEffect, useState } from "react";
import {
  X,
  Menu,
  Heart,
  Phone,
  Calendar,
  BriefcaseMedical,
  Monitor,
  Users,
  User,
  Bed,
  CreditCard,
  FileText,
  Settings,
  Info,
  Wrench,
  Mail,
  Home,
  Briefcase,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Helmet } from "react-helmet";

const App = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [activeSection, setActiveSection] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    window.open("https://wa.me/+919480226460", "_blank");
  };

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
    setMobileNumber("");
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navItems = [
    { id: "home", label: "Home", icon: <Home className="h-5 w-5" /> },
    { id: "about", label: "About Us", icon: <Info className="h-5 w-5" /> },
    {
      id: "services",
      label: "Services",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      id: "equipment",
      label: "Equipment",
      icon: <Wrench className="h-5 w-5" />,
    },
    { id: "sop", label: "SOP", icon: <FileText className="h-5 w-5" /> },
    {
      id: "payment",
      label: "Payment",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      id: "careers",
      label: "Careers",
      icon: <Briefcase className="h-5 w-5" />,
    },
    { id: "contact", label: "Contact Us", icon: <Phone className="h-5 w-5" /> },
  ];

  const renderNavigation = () => {
    if (isMobile) {
      return (
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger className="p-2" onClick={() => setIsMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px] p-0">
            <div className="flex flex-col h-full bg-white">
              <div className="flex items-center p-4 border-b">
                <img
                  src="./yasho_logo.jpeg"
                  alt="logo"
                  className="text-primary h-10 w-12 mr-2 rounded-xl"
                />
                <span className="text-xl font-bold text-primary">
                  YASHOCARE
                </span>
              </div>
              <nav className="flex-1 overflow-auto">
                <ul className="py-2">
                  {navItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          scrollToSection(item.id);
                        }}
                        className={`w-full text-left flex items-center px-4 py-3 hover:bg-gray-100 ${
                          activeSection === item.id
                            ? "bg-primary/10 text-primary font-medium"
                            : ""
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
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={`text-sm font-medium hover:text-primary transition-colors ${
              activeSection === item.id ? "text-blue-400" : "text-gray-600"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    );
  };

  return (
    <>
      <Helmet>
        {/* Basic SEO */}
        <title>Yashocare Health Care Services</title>
        <meta
          name="description"
          content="Yashocare offers 24/7 compassionate and professional home healthcare services including elder care, post-surgery care, and medical support at home."
        />
        <meta
          name="keywords"
          content="Home healthcare, Yashocare, elder care, post-surgery care, in-home nurse, Bangalore healthcare"
        />
        <meta name="author" content="Yashocare" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://yourdomain.com" />

        {/* Open Graph */}
        <meta property="og:title" content="Yashocare Health Care Services" />
        <meta
          property="og:description"
          content="Trusted home healthcare professionals at your doorstep. Book 24/7 nursing care, elder care, and post-surgery recovery support."
        />
        <meta
          property="og:image"
          content="https://yourdomain.com/og-image.jpg"
        />
        <meta property="og:url" content="https://yourdomain.com" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Yashocare" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Yashocare Home Healthcare" />
        <meta
          name="twitter:description"
          content="24/7 Home medical care and nursing services from Yashocare. Trusted professionals at your doorstep."
        />
        <meta
          name="twitter:image"
          content="https://yourdomain.com/og-image.jpg"
        />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />

        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Yashocare",
            url: "https://yourdomain.com",
            logo: "https://yourdomain.com/yasho_logo.jpeg",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+91-9480226460",
              contactType: "Customer Service",
            },
            sameAs: [
              "https://www.facebook.com/yashocare",
              "https://www.instagram.com/yashocare",
              "https://wa.me/919480226460",
            ],
          })}
        </script>
      </Helmet>
      <div className="flex flex-col min-h-screen">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-white shadow-sm">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              {isMobile && renderNavigation()}
              <img
                src="./yasho_logo.jpeg"
                alt="logo"
                className="text-primary h-10 w-12 mr-2 rounded-xl"
              />
              {isMobile ? (
                <span
                  className="text-xl font-bold text-primary"
                  style={{ textShadow: "6px 4px 4px rgba(0,0,0,0.5)" }}
                >
                  YASHOCARE
                </span>
              ) : (
                <span
                  className=" text-md font-bold text-primary"
                  style={{ textShadow: "6px 4px 4px rgba(0,0,0,0.5)" }}
                >
                  YASHOCARE HEALTH CARE SERVICES
                </span>
              )}
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
        <section
          id="home"
          className="bg-gradient-to-b from-blue-50 to-white md:py-24"
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-1/2">
                <h1 className="text-3xl md:text-5xl font-serif leading-tight text-gray-900 mb-6">
                  Professional Healthcare <br />
                  <span className="text-primary">At Your Doorstep</span>
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  We bring quality healthcare services directly to your home,
                  ensuring comfort and convenience for you and your loved ones.
                  Our team of certified medical professionals is available 24/7.
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
                  src="./doctors.jpeg"
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
              Yashocare Health Care Services was founded with a mission to make
              quality healthcare accessible to everyone in the comfort of their
              homes.
            </p>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src="./group.jpeg"
                  alt="Healthcare Haven team of medical professionals"
                  className="rounded-lg shadow-md w-full h-auto"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-gray-600 mb-6">
                  At Yashocare Health Care Services, we believe that quality
                  healthcare should be accessible to everyone, regardless of
                  mobility constraints, busy schedules, or geographical
                  barriers. Our mission is to bridge the gap between traditional
                  healthcare facilities and patients by bringing professional
                  medical services directly to your doorstep.
                </p>
                <h3 className="text-2xl font-bold mb-4">Our Team</h3>
                <p className="text-gray-600 mb-6">
                  Our team consists of certified healthcare professionals
                  including doctors, nurses, therapists, and caregivers who are
                  not only experts in their respective fields but also
                  compassionate individuals dedicated to providing personalized
                  care.
                </p>
                <div className="bg-blue-50 border-l-4 border-primary p-4">
                  <p className="text-sm font-medium">
                    All our healthcare providers undergo rigorous background
                    checks, are fully vaccinated, and follow strict hygiene
                    protocols to ensure your safety and well-being.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Our Home Health Services
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Home Nursing Services */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                <img
                  src="./homeNursing.jpeg"
                  alt="Professional nurse providing in-home care services"
                  className="w-full h-80 object-fill"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">
                    Home Nursing Services
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Our experienced home nurses provide round-the-clock medical
                    support for patients who need regular attention at home.
                    From chronic condition monitoring to assistance with daily
                    medical routines, we offer dependable care in a familiar
                    environment.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <Bed className="text-primary h-5 w-5 mr-2" />
                      <span>Medication administration & IV care</span>
                    </li>
                    <li className="flex items-center">
                      <Users className="text-primary h-5 w-5 mr-2" />
                      <span>Assistance with hygiene and mobility</span>
                    </li>
                    <li className="flex items-center">
                      <Monitor className="text-primary h-5 w-5 mr-2" />
                      <span>Regular health monitoring and documentation</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-medium py-2 rounded-md transition-colors"
                  >
                    Request Nursing Care
                  </button>
                </div>
              </div>

              {/* Regular Health Checkups Card */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                <img
                  src="./cancer.jpeg"
                  alt="Doctor checking patient's vitals at home"
                  className="w-full h-80 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">
                    Cancer Patient Care
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We provide compassionate, professional in-home care tailored
                    for cancer patients. Our trained caregivers and medical
                    staff offer ongoing support, symptom management, and
                    essential health services in the comfort of your home.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <BriefcaseMedical className="text-primary h-5 w-5 mr-2" />
                      <span>
                        Medication management & side-effect monitoring
                      </span>
                    </li>
                    <li className="flex items-center">
                      <Monitor className="text-primary h-5 w-5 mr-2" />
                      <span>Assistance with daily activities and mobility</span>
                    </li>
                    <li className="flex items-center">
                      <Calendar className="text-primary h-5 w-5 mr-2" />
                      <span>Nutrition planning and emotional support</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-medium py-2 rounded-md transition-colors"
                  >
                    Request Care Visit
                  </button>
                </div>
              </div>

              {/* Elderly Care Card */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                <img
                  src="./elder.jpeg"
                  alt="Caregiver assisting elderly patient"
                  className="w-full h-80 object-fill"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">
                    Caregivers for Elderly
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Our compassionate caregivers provide personalized assistance
                    to elderly individuals, ensuring they receive the attention,
                    care, and companionship they deserve in the comfort of their
                    homes.
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
                  src="./postSurgery.jpeg"
                  alt="Nurse providing post-surgery care at home"
                  className="w-full h-80 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">Post-Surgery Care</h3>
                  <p className="text-gray-600 mb-4">
                    Recovering from surgery is easier with our specialized
                    post-operative care. We ensure proper wound care, pain
                    management, and rehabilitation exercises in the comfort of
                    your home.
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
              {/* Patient Assistance at Hospital */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                <img
                  src="./hospital.jpeg"
                  alt="Attendant assisting patient in hospital"
                  className="w-full h-80 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">
                    Patient Assistance at Hospital
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Our trained patient attendants provide in-hospital support,
                    ensuring comfort, companionship, and help with basic needs.
                    We bridge the gap between hospital staff and patients by
                    offering personal attention around the clock.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <Bed className="text-primary h-5 w-5 mr-2" />
                      <span>Help with mobility and hygiene</span>
                    </li>
                    <li className="flex items-center">
                      <Users className="text-primary h-5 w-5 mr-2" />
                      <span>Meal support and patient companionship</span>
                    </li>
                    <li className="flex items-center">
                      <Monitor className="text-primary h-5 w-5 mr-2" />
                      <span>Coordination with medical staff</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-medium py-2 rounded-md transition-colors"
                  >
                    Book Attendant
                  </button>
                </div>
              </div>
              {/* In-home Companion Care */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                <img
                  src="./homeCare.jpeg"
                  alt="Companion caregiver supporting an elderly patient at home"
                  className="w-full h-80 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">
                    In-home Companion Care
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Our companion care service offers emotional and social
                    support for elderly or recovering patients. We help with
                    daily routines, provide meaningful conversation, and ensure
                    overall well-being in a familiar home environment.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <Bed className="text-primary h-5 w-5 mr-2" />
                      <span>Help with daily tasks and routines</span>
                    </li>
                    <li className="flex items-center">
                      <Users className="text-primary h-5 w-5 mr-2" />
                      <span>Companionship and emotional support</span>
                    </li>
                    <li className="flex items-center">
                      <Monitor className="text-primary h-5 w-5 mr-2" />
                      <span>Wellness observation and communication</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-medium py-2 rounded-md transition-colors"
                  >
                    Request Companion
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Equipment Section */}
        <section id="equipment" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Medical Equipment
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <div className="h-48 flex items-center justify-center mb-6 bg-gray-50 rounded-md">
                  <img
                    src="./ecg.jpeg"
                    alt="Portable ECG Monitor"
                    className="h-40 object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">Portable ECG Monitor</h3>
                <p className="text-gray-600">
                  Advanced portable ECG monitoring for convenient cardiac
                  assessment at home. Our healthcare professionals bring
                  hospital-grade equipment to your doorstep.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <div className="h-48 flex items-center justify-center mb-6 bg-gray-50 rounded-md">
                  <img
                    src="./bloodMonitor.jpeg"
                    alt="Advanced Blood Pressure Monitor"
                    className="h-40 object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Blood Pressure Monitor
                </h3>
                <p className="text-gray-600">
                  Clinical-grade blood pressure monitoring equipment for
                  accurate readings and tracking. Helps maintain optimal health
                  with professional guidance.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <div className="h-48 flex items-center justify-center mb-6 bg-gray-50 rounded-md">
                  <img
                    src="./oxygen.jpeg"
                    alt="Oxygen Therapy Equipment"
                    className="h-40 object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Oxygen Therapy Equipment
                </h3>
                <p className="text-gray-600">
                  Comprehensive oxygen therapy solutions for patients needing
                  respiratory support at home, including portable oxygen
                  concentrators and related accessories.
                </p>
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
            <h2 className="text-3xl font-bold text-center mb-8">
              Our Standard Operating Procedures
            </h2>
            <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
              We maintain strict protocols to ensure the highest quality of care
              and safety for our patients
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <FileText className="text-primary h-6 w-6 mr-2" />
                  Trust and Transparency
                </h3>
                <p className="text-gray-600 mb-4">
                  We believe in building trust with our clients by being fully
                  transparent in all our services. We provide clear
                  communication, honest feedback, and ensure that our clients
                  are informed at every stage of their healthcare journey.
                </p>
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-sm">
                    Our team is committed to providing transparent care by
                    sharing detailed reports, keeping clients updated about
                    their care plans, and addressing any concerns promptly and
                    openly.
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <FileText className="text-primary h-6 w-6 mr-2" />
                  Emergency Response
                </h3>
                <p className="text-gray-600 mb-4">
                  We have established clear protocols for handling emergencies
                  during home visits. Our healthcare providers are trained in
                  emergency procedures and carry essential emergency response
                  equipment at all times.
                </p>
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-sm">
                    We maintain direct communication channels with local
                    emergency services to ensure rapid response if needed.
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <FileText className="text-primary h-6 w-6 mr-2" />
                  Quality Assurance
                </h3>
                <p className="text-gray-600 mb-4">
                  Our services undergo regular quality checks and evaluations.
                  We collect patient feedback after each visit and conduct
                  periodic reviews of our healthcare providers to maintain our
                  high standards of care.
                </p>
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-sm">
                    We are accredited by leading healthcare organizations and
                    regularly update our protocols based on the latest research
                    and best practices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Section */}
        <section id="payment" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              Payment Options
            </h2>
            <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
              We offer flexible payment solutions to make healthcare accessible
              and affordable for everyone
            </p>

            <div className="mt-12 bg-blue-50 p-6 rounded-lg max-w-3xl mx-auto">
              <h4 className="font-bold text-lg mb-4">
                Need help with payment options?
              </h4>
              <p className="text-gray-600 mb-4">
                Our financial counselors are available to discuss your specific
                situation and help you find the most affordable payment
                solution. We believe everyone deserves access to quality
                healthcare.
              </p>
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Speak to Our Co-ordinator
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-6 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10">
              What Our Patients Say
            </h2>

            {/* Scrollable container on mobile */}
            <div className="md:grid md:grid-cols-3 md:gap-8 flex overflow-x-auto space-x-4 md:space-x-0 scrollbar-hide px-2 -mx-2">
              {/* Card 1 */}
              <div className="min-w-[85%] max-w-xs md:min-w-0 bg-white p-6 rounded-lg shadow-md flex-shrink-0 my-2">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold">Priya Sharma</h4>
                    <p className="text-gray-500 text-sm">Health Checkup</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "The convenience of having healthcare professionals come to my
                  home for regular checkups has been invaluable. They're always
                  thorough and take the time to answer all my questions."
                </p>
              </div>

              {/* Card 2 */}
              <div className="min-w-[85%] max-w-xs md:min-w-0 bg-white p-6 rounded-lg shadow-md flex-shrink-0 my-2">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold">Manish Kumar</h4>
                    <p className="text-gray-500 text-sm">Elderly Care</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "The caregivers for my father have been exceptional. Their
                  compassion and professionalism have given our family peace of
                  mind knowing he's well cared for at home."
                </p>
              </div>

              {/* Card 3 */}
              <div className="min-w-[85%] max-w-xs md:min-w-0 bg-white p-6 rounded-lg shadow-md flex-shrink-0 my-2">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold">Sneha Iyer</h4>
                    <p className="text-gray-500 text-sm">Post-Surgery Care</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "After my knee surgery, having professional care at home made
                  recovery so much easier. The nurses were skilled and
                  encouraging throughout my rehabilitation."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Careers Section */}
        <section id="careers" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              Join Our Team
            </h2>
            <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
              We are always looking for passionate and dedicated professionals
              to join our growing team.
            </p>

            <div className="grid md:grid-cols-4 gap-6 text-center mb-12">
              {[
                "Registered Nurse",
                "Nurse Practitioner",
                "Semi Nurse",
                "Care Takers",
              ].map((role) => (
                <div
                  key={role}
                  className="bg-gray-50 rounded-lg p-4 shadow hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold text-primary">{role}</h3>
                </div>
              ))}
            </div>

            <form
              className="max-w-xl mx-auto bg-gray-50 p-6 rounded-lg shadow"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  className="w-full border border-gray-300 px-4 py-2 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 px-4 py-2 rounded-md"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-1">
                  Mobile
                </label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  className="w-full border border-gray-300 px-4 py-2 rounded-md"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded-md font-medium hover:bg-primary/90 transition"
              >
                Submit Application
              </button>
            </form>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 bg-orange-200">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* LEFT SIDE: Always Visible, Centered on Mobile */}
              <div className="md:w-1/2 w-full text-center md:text-left">
                <h2 className="text-3xl font-bold mb-6">
                  Need Immediate Assistance?
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Our healthcare professionals are available 24/7 to assist you
                  with any concerns or emergencies. Don't hesitate to reach out
                  for quality home healthcare services.
                </p>
                <div className="flex items-center justify-start mb-4">
                  <a href="tel:+919480226460" className="flex items-center">
                    <Phone className="text-primary h-6 w-6 mr-3" />
                    <span className="text-lg font-semibold">
                      +91 9480226460
                    </span>
                  </a>
                </div>
                <div className="flex items-center justify-start mb-4">
                  <a
                    href="mailto:yashocarehomehealth44@gmail.com"
                    className="flex items-center"
                  >
                    <Mail className="text-primary h-6 w-6 mr-3" />
                    <span className="text-lg font-semibold">
                      yashocarehomehealth44@gmail.com
                    </span>
                  </a>
                </div>

                <div className="bg-blue-50 border-l-4 border-primary p-4 mt-6 text-left">
                  <p className="text-sm">
                    <strong>Our commitment to you:</strong> All our healthcare
                    providers are fully vaccinated, follow strict hygiene
                    protocols, and are regularly tested to ensure your safety.
                  </p>
                </div>
              </div>

              {/* RIGHT SIDE: Request Form — Hidden on Mobile */}
              <div className="hidden md:block md:w-1/2 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Request a Service</h3>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your mobile number"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Service Needed
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Select a service</option>
                    <option value="checkup">Cancer Patient Care</option>
                    <option value="elderly">Elderly Care</option>
                    <option value="surgery">Post-Surgery Care</option>
                    <option value="other">Other Services</option>
                  </select>
                </div>
                <button className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium transition-colors">
                  Submit
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 mt-auto">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              {/* Left: Logo and Address */}
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <img
                    src="./yasho_logo.jpeg"
                    alt="logo"
                    className="text-primary h-10 w-10 mr-2 rounded-xl"
                  />
                  <span className="text-sm font-bold">
                    YASHOCARE HEALTH CARE SERVICES
                  </span>
                </div>
                <p className="text-gray-400">
                  1st Main road, Venkateshwara layout, S.G Palya, BTM Layout,
                  Bangalore-560029
                </p>
              </div>

              {/* Right: Legal */}
              <div className="flex-1 flex justify-end">
                <div>
                  <h3 className="text-lg font-bold mb-4">Legal</h3>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        Terms of Service
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom copyright */}
            <div className="flex justify-center">
              <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400 text-sm text-center md:text-left mb-8 w-[60%] md:w-auto">
                  © 2025 YASHOCARE HEALTH CARE SERVICES. All rights reserved.
                </p>
              </div>
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
                  <label
                    htmlFor="mobile"
                    className="block text-gray-700 font-medium mb-2"
                  >
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

        {/* contact modal */}
        {showContactModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white w-full max-w-md mx-auto rounded-lg shadow-lg p-6 relative">
              <button
                onClick={() => setShowContactModal(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
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
                <label className="block text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your mobile number"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Service Needed
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select a service</option>
                  <option value="checkup">Cancer Patient Care</option>
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
        )}

        {showPopup && (
          <div className="fixed bottom-32 right-4 z-50 bg-orange-100 text-black px-4 py-2 rounded-md shadow-md animate-fadeIn">
            Chat with us on WhatsApp!
          </div>
        )}

        <div
          className="fixed bottom-20 right-4 z-50 p-3 bg-green-600 rounded-full shadow-lg cursor-pointer"
          onClick={handleClick}
        >
          <img src="/whatsapp.svg" alt="WhatsApp" width={30} height={30} />
        </div>
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-orange-700 shadow-lg">
            <button
              onClick={() => setShowContactModal(true)}
              className="w-full text-white text-center py-4 text-lg font-semibold"
            >
              Connect with us
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default App;
