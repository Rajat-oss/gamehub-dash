import React, { useState } from 'react';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaQuestionCircle, FaBug, FaLightbulb, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

const Contact: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I add games to my favorites?",
      answer: "Click the heart icon on any game card to add it to your favorites. You can view all your favorites in the 'My Favorites' section."
    },
    {
      question: "Can I request games that aren't listed?",
      answer: "Yes! Click the 'Request' button on any game or use the game request feature to suggest new games for our platform."
    },
    {
      question: "How do I create and manage my gaming profile?",
      answer: "Go to your profile page to update your bio, view your gaming stats, and manage your account settings."
    },
    {
      question: "Is GameHub free to use?",
      answer: "Yes, GameHub is completely free to use. You can browse games, create lists, and connect with other gamers at no cost."
    },
    {
      question: "How do I report inappropriate content?",
      answer: "Use the report feature on posts or comments, or contact us directly through this form with details about the content."
    },
    {
      question: "Can I sync my gaming data across devices?",
      answer: "Yes, your profile and favorites are automatically synced when you sign in to your account on any device."
    }
  ];

  const contactTypes = [
    { value: 'general', label: 'General Inquiry', icon: FaQuestionCircle },
    { value: 'bug', label: 'Bug Report', icon: FaBug },
    { value: 'feature', label: 'Feature Request', icon: FaLightbulb }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject || `${contactTypes.find(t => t.value === formData.type)?.label} - GameHub`,
          message: formData.message,
          type: formData.type,
          to_email: import.meta.env.VITE_ADMIN_EMAIL
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: user?.displayName || '',
        email: user?.email || '',
        subject: '',
        message: '',
        type: 'general'
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearch={() => {}} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Contact Us & Support
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions, feedback, or need help? We're here to assist you with anything related to GameHub.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Type */}
                  <div>
                    <label className="block text-sm font-medium mb-3">What can we help you with?</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {contactTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            formData.type === type.value
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <type.icon className="w-4 h-4 mb-2" />
                          <div className="text-sm font-medium">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message *</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Please provide details about your inquiry..."
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info & FAQs */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FaEnvelope className="w-4 h-4 text-primary" />
                  <div>
                    <div className="text-sm font-medium">Email</div>
                    <div className="text-sm text-muted-foreground">support@gamehub.com</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FaPhone className="w-4 h-4 text-primary" />
                  <div>
                    <div className="text-sm font-medium">Phone</div>
                    <div className="text-sm text-muted-foreground">+1 (555) 123-4567</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FaMapMarkerAlt className="w-4 h-4 text-primary" />
                  <div>
                    <div className="text-sm font-medium">Address</div>
                    <div className="text-sm text-muted-foreground">123 Gaming Street<br />Tech City, TC 12345</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Badge className="mb-2">Response Time</Badge>
                  <p className="text-sm text-muted-foreground">
                    We typically respond within 24 hours during business days.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-border rounded-lg">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-secondary/50 transition-colors"
                    >
                      <span className="font-medium">{faq.question}</span>
                      {expandedFaq === index ? (
                        <FaChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <FaChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="px-4 pb-4 text-muted-foreground">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;