'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle, Star, Users, TrendingUp, Shield, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [animatedElements, setAnimatedElements] = useState<Set<string>>(new Set())

  useEffect(() => {
    setIsVisible(true)
    
    // Intersection Observer for scroll-triggered animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-animate-id')
            if (id) {
              setAnimatedElements(prev => new Set(prev).add(id))
            }
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    )

    // Observe all elements with data-animate-id
    document.querySelectorAll('[data-animate-id]').forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const fadeInUp = (delay: number = 0) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
    transition: `all 0.8s ease-out ${delay}s`
  })

  const slideInLeft = (delay: number = 0) => ({
    opacity: animatedElements.has('slide-left') ? 1 : 0,
    transform: animatedElements.has('slide-left') ? 'translateX(0)' : 'translateX(-50px)',
    transition: `all 0.8s ease-out ${delay}s`
  })

  const slideInRight = (delay: number = 0) => ({
    opacity: animatedElements.has('slide-right') ? 1 : 0,
    transform: animatedElements.has('slide-right') ? 'translateX(0)' : 'translateX(50px)',
    transition: `all 0.8s ease-out ${delay}s`
  })

  const scaleIn = (delay: number = 0) => ({
    opacity: animatedElements.has('scale-in') ? 1 : 0,
    transform: animatedElements.has('scale-in') ? 'scale(1)' : 'scale(0.8)',
    transition: `all 0.6s ease-out ${delay}s`
  })

  const bounceIn = (delay: number = 0) => ({
    opacity: animatedElements.has('bounce-in') ? 1 : 0,
    transform: animatedElements.has('bounce-in') ? 'scale(1)' : 'scale(0.3)',
    transition: `all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${delay}s`
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl"
              style={fadeInUp(0.2)}
            >
              Know what's in your{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
                pantry
              </span>
            </h1>
            <p 
              className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl"
              style={fadeInUp(0.4)}
            >
              Stop throwing away food and money. Pantree gives you complete visibility into your pantry, 
              helps you plan meals, and ensures you never run out of essentials again.
            </p>
            <div 
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              style={fadeInUp(0.6)}
            >
              <Link
                href="/auth/signin"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1"
              >
                <span className="relative z-10">Login Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <ArrowRight className="ml-2 h-5 w-5 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110" />
              </Link>
              <div className="flex items-center space-x-1 text-sm text-gray-500 animate-fade-in">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-4 w-4 fill-yellow-400 text-yellow-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
                <span className="ml-2">4.9/5 from 2,847 users</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating elements background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-300 rounded-full opacity-20 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </section>

      {/* Feature Section 1: Image Left, Text Right */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div 
              className="order-2 lg:order-1"
              data-animate-id="slide-left"
              style={slideInLeft(0.2)}
            >
              <div className="relative group">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 p-8 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                  <div className="h-full w-full rounded-xl bg-white shadow-2xl transition-all duration-500 group-hover:shadow-3xl">
                    <div className="flex h-full flex-col p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="h-3 w-20 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="h-8 w-8 rounded-full bg-blue-500 animate-bounce"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse"></div>
                        <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <div className="mt-auto grid grid-cols-2 gap-3">
                        <div className="h-16 rounded-lg bg-green-100 p-3 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                          <div className="h-3 w-12 rounded bg-green-500"></div>
                          <div className="mt-2 h-2 w-8 rounded bg-green-300"></div>
                        </div>
                        <div className="h-16 rounded-lg bg-orange-100 p-3 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                          <div className="h-3 w-10 rounded bg-orange-500"></div>
                          <div className="mt-2 h-2 w-6 rounded bg-orange-300"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div 
              className="order-1 lg:order-2"
              data-animate-id="slide-right"
              style={slideInRight(0.4)}
            >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Never waste food again
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Pantree's smart inventory system tracks every item in your pantry with real-time updates. 
                Set custom thresholds and get instant alerts when items are running low. 
                Transform your kitchen chaos into organized bliss.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  'Real-time inventory tracking',
                  'Smart low-stock alerts',
                  'Family collaboration'
                ].map((feature, index) => (
                  <div 
                    key={feature}
                    className="flex items-center transition-all duration-300 hover:translate-x-2"
                    style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 animate-bounce" style={{ animationDelay: `${0.6 + index * 0.1}s` }} />
                    <span className="ml-3 text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2: Text Left, Image Right */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div data-animate-id="slide-left" style={slideInLeft(0.2)}>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Save money, reduce stress
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Stop buying duplicates and throwing away expired food. Pantree helps you plan meals, 
                track expiration dates, and make informed shopping decisions. 
                The average family saves $600+ annually with smart pantry management.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  'Expiration date tracking',
                  'Shopping list generation',
                  'Cost analysis & insights'
                ].map((feature, index) => (
                  <div 
                    key={feature}
                    className="flex items-center transition-all duration-300 hover:translate-x-2"
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 animate-bounce" style={{ animationDelay: `${0.4 + index * 0.1}s` }} />
                    <span className="ml-3 text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div data-animate-id="slide-right" style={slideInRight(0.4)}>
              <div className="relative group">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-green-100 to-blue-100 p-8 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                  <div className="h-full w-full rounded-xl bg-white shadow-2xl transition-all duration-500 group-hover:shadow-3xl">
                    <div className="flex h-full flex-col p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="h-3 w-24 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="flex space-x-2">
                          <div className="h-6 w-6 rounded bg-green-500 animate-bounce"></div>
                          <div className="h-6 w-6 rounded bg-yellow-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="h-6 w-6 rounded bg-red-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-20 rounded-lg bg-gradient-to-r from-green-50 to-green-100 p-4 transition-all duration-300 hover:scale-105">
                          <div className="flex items-center justify-between">
                            <div className="h-4 w-16 rounded bg-green-600"></div>
                            <div className="h-6 w-12 rounded-full bg-green-500 text-xs text-white animate-pulse"></div>
                          </div>
                          <div className="mt-2 h-3 w-24 rounded bg-green-300"></div>
                        </div>
                        <div className="h-20 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 transition-all duration-300 hover:scale-105">
                          <div className="flex items-center justify-between">
                            <div className="h-4 w-20 rounded bg-yellow-600"></div>
                            <div className="h-6 w-8 rounded-full bg-yellow-500 text-xs text-white animate-pulse"></div>
                          </div>
                          <div className="mt-2 h-3 w-20 rounded bg-yellow-300"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 3: Image Left, Text Right */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div 
              className="order-2 lg:order-1"
              data-animate-id="slide-left"
              style={slideInLeft(0.2)}
            >
              <div className="relative group">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 p-8 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                  <div className="h-full w-full rounded-xl bg-white shadow-2xl transition-all duration-500 group-hover:shadow-3xl">
                    <div className="flex h-full flex-col p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="h-3 w-20 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="h-8 w-8 rounded-full bg-purple-500 animate-bounce"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse"></div>
                        <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <div className="mt-auto space-y-3">
                        <div className="h-12 rounded-lg bg-purple-50 p-3 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-purple-500 animate-pulse"></div>
                            <div className="flex-1">
                              <div className="h-3 w-16 rounded bg-purple-600"></div>
                              <div className="mt-1 h-2 w-12 rounded bg-purple-300"></div>
                            </div>
                          </div>
                        </div>
                        <div className="h-12 rounded-lg bg-pink-50 p-3 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-pink-500 animate-pulse"></div>
                            <div className="flex-1">
                              <div className="h-3 w-20 rounded bg-pink-600"></div>
                              <div className="mt-1 h-2 w-14 rounded bg-pink-300"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div 
              className="order-1 lg:order-2"
              data-animate-id="slide-right"
              style={slideInRight(0.4)}
            >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Work together as a family
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Everyone in your household can contribute to keeping the pantry organized. 
                Share shopping lists, track who used what, and maintain a single source of truth 
                for your family's food inventory.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  'Multi-user access',
                  'Shared shopping lists',
                  'Activity tracking'
                ].map((feature, index) => (
                  <div 
                    key={feature}
                    className="flex items-center transition-all duration-300 hover:translate-x-2"
                    style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 animate-bounce" style={{ animationDelay: `${0.6 + index * 0.1}s` }} />
                    <span className="ml-3 text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl"
            data-animate-id="scale-in"
            style={scaleIn(0.2)}
          >
            Save money now
          </h2>
          <p 
            className="mt-6 text-lg leading-8 text-gray-600"
            data-animate-id="scale-in"
            style={scaleIn(0.4)}
          >
            Join thousands of families who have transformed their kitchen chaos into organized bliss. 
            Start saving money, reducing waste, and enjoying stress-free meal planning today.
          </p>
          
          <div 
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            data-animate-id="scale-in"
            style={scaleIn(0.6)}
          >
            <Link
              href="/auth/signin"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1"
            >
              <span className="relative z-10">Get Started Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <ArrowRight className="ml-2 h-5 w-5 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110" />
            </Link>
          </div>

          {/* Trust Elements */}
          <div 
            className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3"
            data-animate-id="bounce-in"
            style={bounceIn(0.8)}
          >
            {[
              { icon: Users, bg: 'bg-blue-100', text: 'text-blue-600', title: '2,847+ Users', subtitle: 'Trusting Pantree daily' },
              { icon: TrendingUp, bg: 'bg-green-100', text: 'text-green-600', title: '$600+ Saved', subtitle: 'Average annual savings' },
              { icon: Shield, bg: 'bg-purple-100', text: 'text-purple-600', title: '100% Secure', subtitle: 'Your data is protected' }
            ].map((item, index) => (
              <div 
                key={item.title}
                className="text-center transition-all duration-500 hover:scale-110 hover:shadow-xl"
                style={{ animationDelay: `${1 + index * 0.2}s` }}
              >
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${item.bg} transition-all duration-300 hover:scale-110`}>
                  <item.icon className={`h-8 w-8 ${item.text}`} />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-gray-600">{item.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div 
            className="mt-16 rounded-2xl bg-white p-8 shadow-xl transition-all duration-500 hover:shadow-2xl hover:scale-105"
            data-animate-id="bounce-in"
            style={bounceIn(1.4)}
          >
            <div className="flex items-center justify-center space-x-1 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className="h-5 w-5 fill-current animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <blockquote className="mt-4 text-lg text-gray-700">
              "Pantree has completely transformed how we manage our pantry. We've cut our food waste by 80% 
              and save over $100/month on groceries. It's like having a personal kitchen manager!"
            </blockquote>
            <div className="mt-4 text-sm text-gray-500">
              — Sarah M., Family of 4
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse"></div>
            <span className="text-xl font-bold text-gray-900">Pantree</span>
          </div>
          <p className="mt-4 text-gray-600">
            Making pantry management simple and collaborative for families everywhere.
          </p>
          <div className="mt-8 flex justify-center space-x-6 text-sm text-gray-500">
            <Link href="/auth/signin" className="hover:text-gray-900 transition-colors duration-200">Sign In</Link>
            <Link href="/auth/register" className="hover:text-gray-900 transition-colors duration-200">Register</Link>
            <span>© 2025 Pantree. All rights reserved.</span>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(-10px) rotate(240deg); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  )
}
