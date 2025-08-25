import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const TermsOfService: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/logofinal.png" alt="GameHub" className="h-32 w-32 object-contain" />
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-2">
              <ThemeToggle />
              {!user && (
                <>
                  <Button variant="ghost" onClick={() => navigate('/auth?mode=login')} size="sm">
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/auth?mode=signup')} size="sm">
                    Get Started
                  </Button>
                </>
              )}
              {user && (
                <Button onClick={() => navigate('/homepage')} size="sm">
                  Homepage
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using GameHub, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, 
                please do not use this service.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-4">Use License</h2>
              <p className="text-muted-foreground mb-4">
                Permission is granted to temporarily use GameHub for personal, non-commercial 
                transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Modify or copy the materials</li>
                <li>Use the materials for commercial purposes</li>
                <li>Attempt to reverse engineer any software</li>
                <li>Remove any copyright or proprietary notations</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-4">User Accounts</h2>
              <p className="text-muted-foreground mb-4">
                When you create an account with us, you must provide accurate and complete information. 
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Safeguarding your password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us of any unauthorized use</li>
                <li>Maintaining accurate account information</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-4">Prohibited Uses</h2>
              <p className="text-muted-foreground mb-4">You may not use our service:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>For any unlawful purpose or to solicit others to unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-4">Content</h2>
              <p className="text-muted-foreground mb-4">
                Our service allows you to post, link, store, share and otherwise make available certain information, 
                text, graphics, videos, or other material. You are responsible for the content that you post to the service, including its legality, reliability, and appropriateness.
              </p>
              <p className="text-muted-foreground">
                By posting content to the service, you grant us the right and license to use, modify, 
                publicly perform, publicly display, reproduce, and distribute such content on and through the service.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-4">Termination</h2>
              <p className="text-muted-foreground">
                We may terminate or suspend your account immediately, without prior notice or liability, 
                for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-4">Disclaimer</h2>
              <p className="text-muted-foreground">
                The information on this platform is provided on an 'as is' basis. To the fullest extent 
                permitted by law, this Company excludes all representations, warranties, conditions and 
                terms relating to our platform and the use of this platform.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us at legal@gamehub.com
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} GameHub. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};